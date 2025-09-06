const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const categorizer = require('../services/categorization');
const { Transaction, Client } = require('../models');

// Helper function to get clientId based on user role
const getClientId = async (req) => {
  if (req.user.role === 'client') {
    const client = await Client.findOne({ where: { email: req.user.email } });
    if (!client) {
      throw new Error('Client profile not found');
    }
    return client.id;
  } else {
    // For admin/bookkeeper, clientId should be provided in query or body
    return req.query.clientId || req.body.clientId;
  }
};

/**
 * @route   POST /api/categorization/categorize
 * @desc    Categorize a single transaction
 * @access  Private
 */
router.post('/categorize', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID required' });
    }

    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user owns this transaction
    if (transaction.client_id !== clientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const categorization = await categorizer.categorizeTransaction(transaction);
    
    res.json({
      success: true,
      categorization
    });
  } catch (error) {
    console.error('Categorization error:', error);
    res.status(500).json({ error: 'Failed to categorize transaction' });
  }
});

/**
 * @route   POST /api/categorization/batch-categorize
 * @desc    Categorize multiple transactions
 * @access  Private
 */
router.post('/batch-categorize', authenticateToken, async (req, res) => {
  try {
    const { transactionIds } = req.body;
    
    if (!transactionIds || !Array.isArray(transactionIds)) {
      return res.status(400).json({ error: 'Transaction IDs array is required' });
    }

    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID required' });
    }

    const transactions = await Transaction.findAll({
      where: {
        id: transactionIds,
        client_id: clientId
      }
    });

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'No transactions found' });
    }

    const categorizations = await categorizer.batchCategorize(transactions);
    
    res.json({
      success: true,
      categorizations
    });
  } catch (error) {
    console.error('Batch categorization error:', error);
    res.status(500).json({ error: 'Failed to categorize transactions' });
  }
});

/**
 * @route   POST /api/categorization/learn
 * @desc    Learn from user correction
 * @access  Private
 */
router.post('/learn', authenticateToken, async (req, res) => {
  try {
    const { transactionId, correctCategory, correctSubcategory } = req.body;
    
    if (!transactionId || !correctCategory) {
      return res.status(400).json({ error: 'Transaction ID and correct category are required' });
    }

    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID required' });
    }

    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user owns this transaction
    if (transaction.client_id !== clientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const success = await categorizer.learnFromCorrection(
      transactionId, 
      correctCategory, 
      correctSubcategory
    );

    if (success) {
      res.json({ success: true, message: 'Correction learned successfully' });
    } else {
      res.status(500).json({ error: 'Failed to learn from correction' });
    }
  } catch (error) {
    console.error('Learning error:', error);
    res.status(500).json({ error: 'Failed to learn from correction' });
  }
});

/**
 * @route   GET /api/categorization/stats
 * @desc    Get categorization statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    let clientId = req.query.clientId;
    
    // For client users, find their client record
    if (req.user.role === 'client') {
      const { Client } = require('../models');
      const client = await Client.findOne({ where: { email: req.user.email } });
      if (!client) {
        return res.status(404).json({ error: 'Client profile not found' });
      }
      clientId = client.id;
    }
    
    // For admin/bookkeeper, clientId should be provided in query
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID required' });
    }
    
    const stats = await categorizer.getCategorizationStats(clientId);
    
    if (stats) {
      res.json({
        success: true,
        stats
      });
    } else {
      res.status(500).json({ error: 'Failed to get categorization stats' });
    }
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get categorization stats' });
  }
});

/**
 * @route   GET /api/categorization/categories
 * @desc    Get available categories
 * @access  Private
 */
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = {
      expenses: Object.keys(categorizer.categories),
      income: Object.keys(categorizer.incomeCategories)
    };
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

/**
 * @route   POST /api/categorization/auto-categorize-all
 * @desc    Auto-categorize all uncategorized transactions for a client
 * @access  Private
 */
router.post('/auto-categorize-all', authenticateToken, async (req, res) => {
  try {
    const { limit = 100 } = req.body;
    
    const clientId = await getClientId(req);
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID required' });
    }
    
    // Get uncategorized transactions
    const transactions = await Transaction.findAll({
      where: {
        client_id: clientId,
        category: 'Uncategorized',
        is_reviewed: false
      },
      limit: parseInt(limit),
      order: [['date', 'DESC']]
    });

    if (transactions.length === 0) {
      return res.json({
        success: true,
        message: 'No uncategorized transactions found',
        processed: 0
      });
    }

    // Categorize all transactions
    const categorizations = await categorizer.batchCategorize(transactions);
    
    // Update transactions with new categories
    const updatePromises = categorizations.map(async (cat) => {
      if (cat.confidence > 0.6) { // Only update if confidence is high enough
        return Transaction.update(
          {
            category: cat.category,
            subcategory: cat.subcategory
          },
          {
            where: { id: cat.transactionId }
          }
        );
      }
    });

    await Promise.all(updatePromises.filter(Boolean));
    
    const processed = categorizations.filter(cat => cat.confidence > 0.6).length;
    
    res.json({
      success: true,
      message: `Processed ${processed} transactions`,
      processed,
      total: transactions.length,
      categorizations
    });
  } catch (error) {
    console.error('Auto-categorize error:', error);
    res.status(500).json({ error: 'Failed to auto-categorize transactions' });
  }
});

module.exports = router;