const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ClientOnboarding, OnboardingDocument, User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/onboarding');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    }
  }
});

// Get onboarding status for current user
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const onboarding = await ClientOnboarding.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: OnboardingDocument,
          as: 'OnboardingDocuments'
        },
        {
          model: User,
          as: 'AssignedBookkeeper',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!onboarding) {
      return res.json({
        status: 'not_started',
        step: 0,
        totalSteps: 5,
        progress: 0
      });
    }

    const progress = Math.round((onboarding.onboardingStep / onboarding.totalSteps) * 100);

    res.json({
      status: onboarding.onboardingStatus,
      step: onboarding.onboardingStep,
      totalSteps: onboarding.totalSteps,
      progress: progress,
      onboarding: onboarding
    });
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
});

// Start onboarding process
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      industry,
      businessAddress,
      businessPhone,
      taxId,
      businessStartDate,
      accountingMethod,
      fiscalYearEnd,
      expectedMonthlyRevenue,
      numberOfEmployees,
      currentBookkeepingSystem,
      servicesNeeded
    } = req.body;

    // Check if onboarding already exists
    const existingOnboarding = await ClientOnboarding.findOne({
      where: { userId: req.user.id }
    });

    if (existingOnboarding) {
      return res.status(400).json({ error: 'Onboarding already started' });
    }

    const onboarding = await ClientOnboarding.create({
      userId: req.user.id,
      businessName,
      businessType,
      industry,
      businessAddress,
      businessPhone,
      taxId,
      businessStartDate,
      accountingMethod,
      fiscalYearEnd,
      expectedMonthlyRevenue,
      numberOfEmployees,
      currentBookkeepingSystem,
      servicesNeeded,
      onboardingStatus: 'in_progress',
      onboardingStep: 1
    });

    res.status(201).json({
      message: 'Onboarding started successfully',
      onboarding: onboarding
    });
  } catch (error) {
    console.error('Error starting onboarding:', error);
    res.status(500).json({ error: 'Failed to start onboarding' });
  }
});

// Update onboarding step
router.put('/step/:stepNumber', authenticateToken, async (req, res) => {
  try {
    const { stepNumber } = req.params;
    const { data } = req.body;

    const onboarding = await ClientOnboarding.findOne({
      where: { userId: req.user.id }
    });

    if (!onboarding) {
      return res.status(404).json({ error: 'Onboarding not found' });
    }

    // Update step and any additional data
    await onboarding.update({
      onboardingStep: parseInt(stepNumber),
      ...data
    });

    res.json({
      message: 'Step updated successfully',
      onboarding: onboarding
    });
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    res.status(500).json({ error: 'Failed to update onboarding step' });
  }
});

// Upload document
router.post('/upload-document', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { documentType, description, isRequired } = req.body;

    const onboarding = await ClientOnboarding.findOne({
      where: { userId: req.user.id }
    });

    if (!onboarding) {
      return res.status(404).json({ error: 'Onboarding not found' });
    }

    const document = await OnboardingDocument.create({
      onboardingId: onboarding.id,
      documentType,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      filePath: req.file.path,
      uploadStatus: 'completed',
      isRequired: isRequired === 'true',
      description,
      uploadedBy: req.user.id
    });

    // Update onboarding documents list
    const currentDocuments = onboarding.documentsUploaded || [];
    currentDocuments.push({
      id: document.id,
      type: documentType,
      fileName: document.originalFileName,
      uploadedAt: document.createdAt
    });

    await onboarding.update({
      documentsUploaded: currentDocuments
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get uploaded documents
router.get('/documents', authenticateToken, async (req, res) => {
  try {
    const onboarding = await ClientOnboarding.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: OnboardingDocument,
          as: 'OnboardingDocuments',
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!onboarding) {
      return res.status(404).json({ error: 'Onboarding not found' });
    }

    res.json({
      documents: onboarding.OnboardingDocuments
    });
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

// Complete onboarding
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const onboarding = await ClientOnboarding.findOne({
      where: { userId: req.user.id }
    });

    if (!onboarding) {
      return res.status(404).json({ error: 'Onboarding not found' });
    }

    await onboarding.update({
      onboardingStatus: 'completed',
      onboardingStep: onboarding.totalSteps,
      onboardingCompletedAt: new Date()
    });

    res.json({
      message: 'Onboarding completed successfully',
      onboarding: onboarding
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// Admin/Bookkeeper routes
router.get('/all', authenticateToken, requireRole(['admin', 'bookkeeper']), async (req, res) => {
  try {
    const onboardings = await ClientOnboarding.findAll({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'AssignedBookkeeper',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: OnboardingDocument,
          as: 'OnboardingDocuments'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      onboardings: onboardings
    });
  } catch (error) {
    console.error('Error getting all onboardings:', error);
    res.status(500).json({ error: 'Failed to get onboardings' });
  }
});

// Assign bookkeeper to onboarding
router.put('/:onboardingId/assign-bookkeeper', authenticateToken, requireRole(['admin', 'bookkeeper']), async (req, res) => {
  try {
    const { onboardingId } = req.params;
    const { bookkeeperId } = req.body;

    const onboarding = await ClientOnboarding.findByPk(onboardingId);
    if (!onboarding) {
      return res.status(404).json({ error: 'Onboarding not found' });
    }

    await onboarding.update({
      assignedBookkeeper: bookkeeperId
    });

    res.json({
      message: 'Bookkeeper assigned successfully',
      onboarding: onboarding
    });
  } catch (error) {
    console.error('Error assigning bookkeeper:', error);
    res.status(500).json({ error: 'Failed to assign bookkeeper' });
  }
});

module.exports = router;