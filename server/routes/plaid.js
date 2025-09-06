const express = require('express');
const router = express.Router();
const plaidService = require('../services/plaid');
const { BankAccount, Transaction, Client } = require('../models');
const { authenticateToken } = require('../middleware/auth');

/**
 * Create link token for client to connect bank account
 */
router.post('/link-token', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.body;
    const userId = req.user.id;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required'
      });
    }

    // Verify client belongs to user or user has access
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const result = await plaidService.createLinkToken(userId, clientId);
    
    if (result.success) {
      res.json({
        success: true,
        link_token: result.link_token,
        expiration: result.expiration
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Exchange public token for access token and store bank account
 */
router.post('/exchange-token', authenticateToken, async (req, res) => {
  try {
    const { publicToken, clientId, institutionId, institutionName } = req.body;
    const userId = req.user.id;

    if (!publicToken || !clientId || !institutionId || !institutionName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Verify client exists
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Exchange public token for access token
    const exchangeResult = await plaidService.exchangePublicToken(publicToken, clientId);
    
    if (!exchangeResult.success) {
      return res.status(400).json({
        success: false,
        error: exchangeResult.error
      });
    }

    // Get account information
    const accountsResult = await plaidService.getAccounts(exchangeResult.access_token);
    
    if (!accountsResult.success) {
      return res.status(400).json({
        success: false,
        error: accountsResult.error
      });
    }

    // Store bank accounts in database
    const savedAccounts = [];
    
    for (const account of accountsResult.accounts) {
      // Only store depository accounts (checking, savings)
      if (account.type === 'depository') {
        const bankAccount = await BankAccount.create({
          client_id: clientId,
          plaid_item_id: exchangeResult.item_id,
          plaid_access_token: exchangeResult.access_token,
          plaid_account_id: account.account_id,
          institution_id: institutionId,
          institution_name: institutionName,
          account_name: account.name,
          account_type: account.type,
          account_subtype: account.subtype,
          mask: account.mask,
          is_active: true,
          sync_status: 'active'
        });
        
        savedAccounts.push(bankAccount);
      }
    }

    res.json({
      success: true,
      message: 'Bank account connected successfully',
      accounts: savedAccounts,
      item_id: exchangeResult.item_id
    });

  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get connected bank accounts for a client
 */
router.get('/accounts/:clientId', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.params;

    const accounts = await BankAccount.findAll({
      where: {
        client_id: clientId,
        is_active: true
      },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['id', 'businessName', 'contactName']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      accounts
    });

  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Sync transactions for a bank account
 */
router.post('/sync/:accountId', authenticateToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const { startDate, endDate } = req.body;

    const bankAccount = await BankAccount.findByPk(accountId);
    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        error: 'Bank account not found'
      });
    }

    // Set default date range if not provided
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get transactions from Plaid
    const transactionsResult = await plaidService.getTransactions(
      bankAccount.plaid_access_token,
      start,
      end,
      [bankAccount.plaid_account_id]
    );

    if (!transactionsResult.success) {
      return res.status(400).json({
        success: false,
        error: transactionsResult.error
      });
    }

    // Store transactions in database
    const savedTransactions = [];
    const skippedTransactions = [];

    for (const plaidTransaction of transactionsResult.transactions) {
      try {
        // Check if transaction already exists
        const existingTransaction = await Transaction.findOne({
          where: {
            plaid_transaction_id: plaidTransaction.transaction_id
          }
        });

        if (existingTransaction) {
          skippedTransactions.push(plaidTransaction.transaction_id);
          continue;
        }

        // Create new transaction
        const transaction = await Transaction.create({
          client_id: bankAccount.client_id,
          bank_account_id: bankAccount.id,
          plaid_transaction_id: plaidTransaction.transaction_id,
          account_id: plaidTransaction.account_id,
          amount: plaidTransaction.amount,
          date: plaidTransaction.date,
          datetime: plaidTransaction.datetime,
          name: plaidTransaction.name,
          merchant_name: plaidTransaction.merchant_name,
          category: plaidTransaction.category,
          category_id: plaidTransaction.category_id,
          subcategory: plaidTransaction.subcategory,
          account_owner: plaidTransaction.account_owner,
          pending: plaidTransaction.pending,
          pending_transaction_id: plaidTransaction.pending_transaction_id,
          payment_meta: plaidTransaction.payment_meta,
          location: plaidTransaction.location,
          personal_finance_category: plaidTransaction.personal_finance_category
        });

        savedTransactions.push(transaction);
      } catch (transactionError) {
        console.error('Error saving transaction:', transactionError);
        skippedTransactions.push(plaidTransaction.transaction_id);
      }
    }

    // Update last sync time
    await bankAccount.update({
      last_sync: new Date()
    });

    res.json({
      success: true,
      message: 'Transactions synced successfully',
      synced_count: savedTransactions.length,
      skipped_count: skippedTransactions.length,
      transactions: savedTransactions
    });

  } catch (error) {
    console.error('Error syncing transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get transactions for a client
 */
router.get('/transactions/:clientId', authenticateToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 50, startDate, endDate, accountId } = req.query;

    const whereClause = {
      client_id: clientId
    };

    if (startDate && endDate) {
      whereClause.date = {
        [require('sequelize').Op.between]: [startDate, endDate]
      };
    }

    if (accountId) {
      whereClause.bank_account_id = accountId;
    }

    const offset = (page - 1) * limit;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [{
        model: BankAccount,
        as: 'bankAccount',
        attributes: ['id', 'institution_name', 'account_name', 'mask']
      }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      transactions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Disconnect bank account
 */
router.delete('/accounts/:accountId', authenticateToken, async (req, res) => {
  try {
    const { accountId } = req.params;

    const bankAccount = await BankAccount.findByPk(accountId);
    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        error: 'Bank account not found'
      });
    }

    // Remove from Plaid
    const removeResult = await plaidService.removeItem(bankAccount.plaid_access_token);
    
    if (!removeResult.success) {
      console.error('Error removing from Plaid:', removeResult.error);
    }

    // Mark as inactive in database
    await bankAccount.update({
      is_active: false,
      sync_status: 'disconnected'
    });

    res.json({
      success: true,
      message: 'Bank account disconnected successfully'
    });

  } catch (error) {
    console.error('Error disconnecting account:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Webhook endpoint for Plaid updates
 */
router.post('/webhook', async (req, res) => {
  try {
    const { webhook_type, webhook_code, item_id, error } = req.body;

    console.log('Plaid webhook received:', { webhook_type, webhook_code, item_id });

    if (error) {
      console.error('Plaid webhook error:', error);
      
      // Update bank account status
      const bankAccount = await BankAccount.findOne({
        where: { plaid_item_id: item_id }
      });
      
      if (bankAccount) {
        await bankAccount.update({
          sync_status: 'error',
          error_message: error.error_message
        });
      }
    }

    // Handle different webhook types
    switch (webhook_type) {
      case 'TRANSACTIONS':
        if (webhook_code === 'INITIAL_UPDATE' || webhook_code === 'HISTORICAL_UPDATE') {
          // Trigger transaction sync
          console.log('New transactions available for item:', item_id);
        }
        break;
      
      case 'ITEM':
        if (webhook_code === 'ERROR') {
          console.log('Item error for:', item_id);
        }
        break;
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;