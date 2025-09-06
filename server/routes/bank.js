const express = require('express');
const { BankAccount, Transaction, Client } = require('../models');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Get bank accounts for a client
router.get('/:clientId/accounts', async (req, res, next) => {
  try {
    const { clientId } = req.params;

    const bankAccounts = await BankAccount.findAll({
      where: { clientId },
      order: [['createdAt', 'DESC']]
    });

    res.json({ bankAccounts });
  } catch (error) {
    next(error);
  }
});

// Add bank account
router.post('/:clientId/accounts', requireRole(['admin', 'bookkeeper']), async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { bankName, accountType, accountNumber, routingNumber } = req.body;

    // Verify client exists
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const bankAccount = await BankAccount.create({
      clientId,
      bankName,
      accountType,
      accountNumber,
      routingNumber
    });

    res.status(201).json({
      message: 'Bank account added successfully',
      bankAccount
    });
  } catch (error) {
    next(error);
  }
});

// Update bank account
router.put('/:clientId/accounts/:accountId', requireRole(['admin', 'bookkeeper']), async (req, res, next) => {
  try {
    const { clientId, accountId } = req.params;
    const updateData = req.body;

    const bankAccount = await BankAccount.findOne({
      where: { id: accountId, clientId }
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    await bankAccount.update(updateData);

    res.json({
      message: 'Bank account updated successfully',
      bankAccount
    });
  } catch (error) {
    next(error);
  }
});

// Delete bank account
router.delete('/:clientId/accounts/:accountId', requireRole(['admin', 'bookkeeper']), async (req, res, next) => {
  try {
    const { clientId, accountId } = req.params;

    const bankAccount = await BankAccount.findOne({
      where: { id: accountId, clientId }
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    await bankAccount.update({ isActive: false });

    res.json({ message: 'Bank account deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

// Sync transactions for a bank account
router.post('/:clientId/accounts/:accountId/sync', requireRole(['admin', 'bookkeeper']), async (req, res, next) => {
  try {
    const { clientId, accountId } = req.params;

    const bankAccount = await BankAccount.findOne({
      where: { id: accountId, clientId }
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    // This would integrate with Plaid or bank APIs
    // For now, we'll simulate the sync
    const mockTransactions = [
      {
        date: new Date(),
        amount: -150.00,
        description: 'Office Supplies - Staples',
        category: 'Office Expenses',
        isAutomated: true
      },
      {
        date: new Date(),
        amount: 2500.00,
        description: 'Client Payment - ABC Corp',
        category: 'Revenue',
        isAutomated: true
      }
    ];

    const syncedTransactions = [];
    for (const transactionData of mockTransactions) {
      const transaction = await Transaction.create({
        clientId,
        bankAccountId: accountId,
        ...transactionData
      });
      syncedTransactions.push(transaction);
    }

    await bankAccount.update({ lastSyncDate: new Date() });

    res.json({
      message: 'Transactions synced successfully',
      syncedCount: syncedTransactions.length,
      transactions: syncedTransactions
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;