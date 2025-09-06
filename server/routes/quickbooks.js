const express = require('express');
const quickbooksService = require('../services/quickbooks');
const { Client } = require('../models');

const router = express.Router();

// Get QuickBooks authorization URL
router.get('/auth-url', (req, res) => {
  try {
    const authUrl = quickbooksService.generateAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Handle QuickBooks OAuth callback
router.post('/callback', async (req, res, next) => {
  try {
    const { code, state, clientId } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for tokens
    const tokenData = await quickbooksService.exchangeCodeForTokens(code);

    // Update client with QuickBooks connection
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.update({
      quickbooksAccessToken: tokenData.access_token,
      quickbooksRefreshToken: tokenData.refresh_token,
      quickbooksTokenExpiry: new Date(Date.now() + (tokenData.expires_in * 1000)),
      quickbooksCompanyId: tokenData.realmId
    });

    res.json({
      message: 'QuickBooks connected successfully',
      companyId: tokenData.realmId
    });
  } catch (error) {
    next(error);
  }
});

// Sync transactions from QuickBooks
router.post('/sync-transactions/:clientId', async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const result = await quickbooksService.syncTransactions(clientId);
    
    res.json({
      message: 'Transactions synced successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Create invoice
router.post('/invoices/:clientId', async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const invoiceData = req.body;

    const invoice = await quickbooksService.createInvoice(clientId, invoiceData);
    
    res.json({
      message: 'Invoice created successfully',
      invoice
    });
  } catch (error) {
    next(error);
  }
});

// Get profit and loss report
router.get('/reports/profit-loss/:clientId', async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date required' });
    }

    const report = await quickbooksService.getProfitLossReport(clientId, startDate, endDate);
    
    res.json({ report });
  } catch (error) {
    next(error);
  }
});

// Get balance sheet
router.get('/reports/balance-sheet/:clientId', async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { asOfDate } = req.query;

    if (!asOfDate) {
      return res.status(400).json({ error: 'As of date required' });
    }

    const report = await quickbooksService.getBalanceSheet(clientId, asOfDate);
    
    res.json({ report });
  } catch (error) {
    next(error);
  }
});

// Disconnect QuickBooks
router.delete('/disconnect/:clientId', async (req, res, next) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await client.update({
      quickbooksAccessToken: null,
      quickbooksRefreshToken: null,
      quickbooksTokenExpiry: null,
      quickbooksCompanyId: null
    });

    res.json({ message: 'QuickBooks disconnected successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;