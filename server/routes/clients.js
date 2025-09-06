const express = require('express');
const Joi = require('joi');
const { Client, BankAccount, Transaction, Document, Report, User } = require('../models');
const { requireRole, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const clientSchema = Joi.object({
  businessName: Joi.string().required(),
  contactName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  address: Joi.object({
    street: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    zipCode: Joi.string(),
    country: Joi.string().default('US')
  }).optional(),
  businessType: Joi.string().optional(),
  monthlyRevenue: Joi.number().min(0).optional(),
  serviceTier: Joi.string().valid('essential', 'professional', 'growth').default('essential')
});

// Client-specific routes (for clients to access their own data) - MUST come before /:id route

// Get client's own profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    // For clients, get their own profile
    if (req.user.role === 'client') {
      // Find client by user email
      const client = await Client.findOne({ 
        where: { email: req.user.email },
        attributes: { exclude: ['quickbooksAccessToken', 'quickbooksRefreshToken'] }
      });
      
      if (!client) {
        return res.status(404).json({ error: 'Client profile not found' });
      }
      
      return res.json({ client });
    }
    
    // For admin/bookkeeper, return their user profile
    res.json({ 
      client: {
        id: req.user.id,
        businessName: `${req.user.firstName} ${req.user.lastName}`,
        contactName: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        status: req.user.isActive ? 'active' : 'inactive',
        role: req.user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get client's own transactions
router.get('/transactions', authenticateToken, async (req, res, next) => {
  try {
    let clientId;
    
    if (req.user.role === 'client') {
      // Find client by user email
      const client = await Client.findOne({ where: { email: req.user.email } });
      if (!client) {
        return res.status(404).json({ error: 'Client profile not found' });
      }
      clientId = client.id;
    } else {
      // Admin/bookkeeper can specify clientId
      clientId = req.query.clientId;
      if (!clientId) {
        return res.status(400).json({ error: 'Client ID required' });
      }
    }

    const { page = 1, limit = 50, startDate, endDate, category } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { client_id: clientId };
    if (startDate) whereClause.date = { [require('sequelize').Op.gte]: startDate };
    if (endDate) whereClause.date = { ...whereClause.date, [require('sequelize').Op.lte]: endDate };
    if (category) whereClause[require('sequelize').Op.or] = [
      { category: category },
      { custom_category: category }
    ];

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']],
      include: [{
        model: BankAccount,
        attributes: ['account_name', 'institution_name']
      }]
    });

    res.json({
      transactions,
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

// Get client's own bank accounts
router.get('/bank-accounts', authenticateToken, async (req, res, next) => {
  try {
    let clientId;
    
    if (req.user.role === 'client') {
      // Find client by user email
      const client = await Client.findOne({ where: { email: req.user.email } });
      if (!client) {
        return res.status(404).json({ error: 'Client profile not found' });
      }
      clientId = client.id;
    } else {
      // Admin/bookkeeper can specify clientId
      clientId = req.query.clientId;
      if (!clientId) {
        return res.status(400).json({ error: 'Client ID required' });
      }
    }

    const bankAccounts = await BankAccount.findAll({
      where: { client_id: clientId },
      order: [['createdAt', 'DESC']]
    });

    res.json({ bankAccounts });
  } catch (error) {
    next(error);
  }
});

// Get all clients (admin/bookkeeper only)
router.get('/', requireRole(['admin', 'bookkeeper']), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, serviceTier } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (serviceTier) whereClause.serviceTier = serviceTier;

    const { count, rows: clients } = await Client.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['quickbooksAccessToken', 'quickbooksRefreshToken'] }
    });

    res.json({
      clients,
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

// Get single client (admin/bookkeeper only)
router.get('/:id', requireRole(['admin', 'bookkeeper']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const client = await Client.findByPk(id, {
      attributes: { exclude: ['quickbooksAccessToken', 'quickbooksRefreshToken'] },
      include: [
        {
          model: BankAccount,
          as: 'BankAccounts'
        },
        {
          model: Document,
          as: 'Documents',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ client });
  } catch (error) {
    next(error);
  }
});

// Create new client
router.post('/', requireRole(['admin', 'bookkeeper']), async (req, res, next) => {
  try {
    const { error, value } = clientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if client already exists
    const existingClient = await Client.findOne({ where: { email: value.email } });
    if (existingClient) {
      return res.status(409).json({ error: 'Client with this email already exists' });
    }

    const client = await Client.create(value);

    res.status(201).json({
      message: 'Client created successfully',
      client: {
        id: client.id,
        businessName: client.businessName,
        contactName: client.contactName,
        email: client.email,
        serviceTier: client.serviceTier,
        status: client.status
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update client
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = clientSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.update(value);

    res.json({
      message: 'Client updated successfully',
      client: {
        id: client.id,
        businessName: client.businessName,
        contactName: client.contactName,
        email: client.email,
        serviceTier: client.serviceTier,
        status: client.status
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update client status
router.patch('/:id/status', requireRole(['admin', 'bookkeeper']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['prospect', 'active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.update({ status });

    res.json({
      message: 'Client status updated successfully',
      status: client.status
    });
  } catch (error) {
    next(error);
  }
});

// Complete onboarding
router.post('/:id/complete-onboarding', requireRole(['admin', 'bookkeeper']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.update({
      onboardingCompleted: true,
      onboardingDate: new Date(),
      status: 'active'
    });

    res.json({
      message: 'Client onboarding completed successfully',
      onboardingDate: client.onboardingDate
    });
  } catch (error) {
    next(error);
  }
});

// Get client transactions
router.get('/:id/transactions', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, startDate, endDate, category } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { clientId: id };
    if (startDate) whereClause.date = { [require('sequelize').Op.gte]: new Date(startDate) };
    if (endDate) whereClause.date = { [require('sequelize').Op.lte]: new Date(endDate) };
    if (category) whereClause.category = category;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']],
      include: [
        {
          model: BankAccount,
          as: 'BankAccount',
          attributes: ['bankName', 'accountType']
        }
      ]
    });

    res.json({
      transactions,
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

// Get client documents
router.get('/:id/documents', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, documentType, month, year } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { clientId: id };
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

// Get client reports
router.get('/:id/reports', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reportType, period } = req.query;

    const whereClause = { clientId: id };
    if (reportType) whereClause.reportType = reportType;
    if (period) whereClause.period = period;

    const reports = await Report.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

// Delete client (soft delete)
router.delete('/:id', requireRole(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.update({ status: 'inactive' });

    res.json({ message: 'Client deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;