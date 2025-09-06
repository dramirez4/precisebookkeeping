const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const { Document, Client } = require('../models');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, Excel, and CSV files are allowed.'));
    }
  }
});

// Upload document
router.post('/:clientId/upload', upload.single('document'), async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { documentType, month, year, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify client exists
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Generate unique S3 key
    const fileExtension = req.file.originalname.split('.').pop();
    const s3Key = `clients/${clientId}/documents/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ServerSideEncryption: 'AES256'
    };

    const s3Result = await s3.upload(uploadParams).promise();

    // Save document record to database
    const document = await Document.create({
      clientId,
      fileName: req.file.originalname,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      s3Key: s3Key,
      s3Bucket: process.env.AWS_S3_BUCKET,
      documentType: documentType || 'other',
      month: month ? parseInt(month) : null,
      year: year ? parseInt(year) : null,
      notes: notes || null
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        fileName: document.fileName,
        documentType: document.documentType,
        fileSize: document.fileSize,
        uploadedAt: document.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get documents for a client
router.get('/:clientId', async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 20, documentType, month, year } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { clientId };
    if (documentType) whereClause.documentType = documentType;
    if (month) whereClause.month = parseInt(month);
    if (year) whereClause.year = parseInt(year);

    const { count, rows: documents } = await Document.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get specific document
router.get('/:clientId/:documentId', async (req, res, next) => {
  try {
    const { clientId, documentId } = req.params;

    const document = await Document.findOne({
      where: { id: documentId, clientId }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error) {
    next(error);
  }
});

// Download document
router.get('/:clientId/:documentId/download', async (req, res, next) => {
  try {
    const { clientId, documentId } = req.params;

    const document = await Document.findOne({
      where: { id: documentId, clientId }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Get file from S3
    const s3Params = {
      Bucket: document.s3Bucket,
      Key: document.s3Key
    };

    const s3Object = await s3.getObject(s3Params).promise();

    // Set appropriate headers
    res.setHeader('Content-Type', document.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Length', s3Object.ContentLength);

    res.send(s3Object.Body);
  } catch (error) {
    next(error);
  }
});

// Update document
router.put('/:clientId/:documentId', requireRole(['admin', 'bookkeeper']), async (req, res, next) => {
  try {
    const { clientId, documentId } = req.params;
    const { documentType, month, year, notes, isProcessed } = req.body;

    const document = await Document.findOne({
      where: { id: documentId, clientId }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await document.update({
      documentType: documentType || document.documentType,
      month: month ? parseInt(month) : document.month,
      year: year ? parseInt(year) : document.year,
      notes: notes || document.notes,
      isProcessed: isProcessed !== undefined ? isProcessed : document.isProcessed
    });

    res.json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    next(error);
  }
});

// Delete document
router.delete('/:clientId/:documentId', requireRole(['admin', 'bookkeeper']), async (req, res, next) => {
  try {
    const { clientId, documentId } = req.params;

    const document = await Document.findOne({
      where: { id: documentId, clientId }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from S3
    try {
      await s3.deleteObject({
        Bucket: document.s3Bucket,
        Key: document.s3Key
      }).promise();
    } catch (s3Error) {
      console.error('Error deleting from S3:', s3Error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await document.destroy();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Process document (OCR and data extraction)
router.post('/:clientId/:documentId/process', requireRole(['admin', 'bookkeeper']), async (req, res, next) => {
  try {
    const { clientId, documentId } = req.params;

    const document = await Document.findOne({
      where: { id: documentId, clientId }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // This would integrate with OCR services like AWS Textract or Tesseract
    // For now, we'll simulate the processing
    const mockExtractedData = {
      total: 150.00,
      vendor: 'Office Depot',
      date: '2024-01-15',
      category: 'Office Supplies',
      confidence: 0.95
    };

    await document.update({
      isProcessed: true,
      ocrText: 'Mock OCR text extracted from document',
      extractedData: mockExtractedData
    });

    res.json({
      message: 'Document processed successfully',
      extractedData: mockExtractedData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;