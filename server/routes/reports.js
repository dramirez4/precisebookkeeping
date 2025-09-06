const express = require('express');
const { Report, Transaction, Client } = require('../models');
const { requireRole } = require('../middleware/auth');
const quickbooksService = require('../services/quickbooks');

const router = express.Router();

// Generate profit and loss report
router.post('/profit-loss/:clientId', async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date required' });
    }

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Try to get report from QuickBooks first
    let reportData;
    try {
      if (client.quickbooksCompanyId) {
        const qbReport = await quickbooksService.getProfitLossReport(clientId, startDate, endDate);
        reportData = qbReport;
      }
    } catch (error) {
      console.log('QuickBooks report failed, generating from local data:', error.message);
    }

    // If QuickBooks fails, generate from local transactions
    if (!reportData) {
      const transactions = await Transaction.findAll({
        where: {
          clientId,
          date: {
            [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
          }
        }
      });

      // Group transactions by category and calculate totals
      const revenue = transactions
        .filter(t => t.amount > 0)
        .reduce((acc, t) => {
          const category = t.category || 'Uncategorized Revenue';
          acc[category] = (acc[category] || 0) + parseFloat(t.amount);
          return acc;
        }, {});

      const expenses = transactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => {
          const category = t.category || 'Uncategorized Expenses';
          acc[category] = (acc[category] || 0) + Math.abs(parseFloat(t.amount));
          return acc;
        }, {});

      const totalRevenue = Object.values(revenue).reduce((sum, amount) => sum + amount, 0);
      const totalExpenses = Object.values(expenses).reduce((sum, amount) => sum + amount, 0);
      const netIncome = totalRevenue - totalExpenses;

      reportData = {
        period: { startDate, endDate },
        revenue,
        expenses,
        totalRevenue,
        totalExpenses,
        netIncome
      };
    }

    // Save report to database
    const report = await Report.create({
      clientId,
      reportType: 'profit_loss',
      period: `${startDate}_${endDate}`,
      data: reportData,
      isGenerated: true,
      generatedAt: new Date()
    });

    res.json({
      message: 'Profit and loss report generated successfully',
      report: {
        id: report.id,
        period: report.period,
        data: reportData,
        generatedAt: report.generatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Generate balance sheet
router.post('/balance-sheet/:clientId', async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { asOfDate } = req.body;

    if (!asOfDate) {
      return res.status(400).json({ error: 'As of date required' });
    }

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Try to get report from QuickBooks first
    let reportData;
    try {
      if (client.quickbooksCompanyId) {
        const qbReport = await quickbooksService.getBalanceSheet(clientId, asOfDate);
        reportData = qbReport;
      }
    } catch (error) {
      console.log('QuickBooks report failed, generating from local data:', error.message);
    }

    // If QuickBooks fails, generate basic balance sheet from transactions
    if (!reportData) {
      const transactions = await Transaction.findAll({
        where: {
          clientId,
          date: {
            [require('sequelize').Op.lte]: new Date(asOfDate)
          }
        }
      });

      // Calculate basic balance sheet
      const totalRevenue = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalExpenses = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

      const retainedEarnings = totalRevenue - totalExpenses;

      reportData = {
        asOfDate,
        assets: {
          cash: 0, // Would need bank account balances
          accountsReceivable: 0,
          totalAssets: 0
        },
        liabilities: {
          accountsPayable: 0,
          totalLiabilities: 0
        },
        equity: {
          retainedEarnings,
          totalEquity: retainedEarnings
        }
      };
    }

    // Save report to database
    const report = await Report.create({
      clientId,
      reportType: 'balance_sheet',
      period: asOfDate,
      data: reportData,
      isGenerated: true,
      generatedAt: new Date()
    });

    res.json({
      message: 'Balance sheet generated successfully',
      report: {
        id: report.id,
        period: report.period,
        data: reportData,
        generatedAt: report.generatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all reports for a client
router.get('/:clientId', async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { reportType, limit = 20 } = req.query;

    const whereClause = { clientId };
    if (reportType) whereClause.reportType = reportType;

    const reports = await Report.findAll({
      where: whereClause,
      limit: parseInt(limit),
      order: [['generatedAt', 'DESC']]
    });

    res.json({ reports });
  } catch (error) {
    next(error);
  }
});

// Get specific report
router.get('/:clientId/:reportId', async (req, res, next) => {
  try {
    const { clientId, reportId } = req.params;

    const report = await Report.findOne({
      where: { id: reportId, clientId }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report });
  } catch (error) {
    next(error);
  }
});

// Generate cash flow report
router.post('/cash-flow/:clientId', async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date required' });
    }

    const transactions = await Transaction.findAll({
      where: {
        clientId,
        date: {
          [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
        }
      }
    });

    // Categorize cash flows
    const operatingActivities = transactions.filter(t => 
      ['Revenue', 'Office Expenses', 'Utilities', 'Insurance'].includes(t.category)
    );

    const investingActivities = transactions.filter(t => 
      ['Equipment', 'Property', 'Investments'].includes(t.category)
    );

    const financingActivities = transactions.filter(t => 
      ['Loans', 'Owner Investment', 'Owner Draws'].includes(t.category)
    );

    const reportData = {
      period: { startDate, endDate },
      operatingActivities: {
        transactions: operatingActivities,
        netCashFlow: operatingActivities.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      },
      investingActivities: {
        transactions: investingActivities,
        netCashFlow: investingActivities.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      },
      financingActivities: {
        transactions: financingActivities,
        netCashFlow: financingActivities.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      },
      netIncreaseInCash: transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
    };

    // Save report to database
    const report = await Report.create({
      clientId,
      reportType: 'cash_flow',
      period: `${startDate}_${endDate}`,
      data: reportData,
      isGenerated: true,
      generatedAt: new Date()
    });

    res.json({
      message: 'Cash flow report generated successfully',
      report: {
        id: report.id,
        period: report.period,
        data: reportData,
        generatedAt: report.generatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;