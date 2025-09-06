const QuickBooks = require('quickbooks');
const { Client, Transaction } = require('../models');

class QuickBooksService {
  constructor() {
    this.clientId = process.env.QB_CLIENT_ID;
    this.clientSecret = process.env.QB_CLIENT_SECRET;
    this.redirectUri = process.env.QB_REDIRECT_URI;
    this.sandboxUrl = process.env.QB_SANDBOX_URL;
    this.productionUrl = process.env.QB_PRODUCTION_URL;
    this.environment = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
  }

  // Get QuickBooks instance for a specific client
  getQuickBooksInstance(client) {
    if (!client.quickbooksCompanyId || !client.quickbooksAccessToken) {
      throw new Error('Client not connected to QuickBooks');
    }

    return new QuickBooks(
      this.clientId,
      this.clientSecret,
      client.quickbooksAccessToken,
      false, // no token secret for OAuth 2.0
      client.quickbooksCompanyId,
      this.environment === 'production' ? this.productionUrl : this.sandboxUrl,
      true, // debug
      null, // minor version
      null, // refresh token
      '2.0' // OAuth version
    );
  }

  // Generate OAuth authorization URL
  generateAuthUrl() {
    const scopes = [
      'com.intuit.quickbooks.accounting',
      'com.intuit.quickbooks.payment'
    ].join(' ');

    const authUrl = `https://appcenter.intuit.com/connect/oauth2?` +
      `client_id=${this.clientId}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `state=${Date.now()}`;

    return authUrl;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code) {
    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return await response.json();
  }

  // Refresh access token
  async refreshAccessToken(client) {
    if (!client.quickbooksRefreshToken) {
      throw new Error('No refresh token available');
    }

    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: client.quickbooksRefreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const tokenData = await response.json();
    
    // Update client with new tokens
    await client.update({
      quickbooksAccessToken: tokenData.access_token,
      quickbooksRefreshToken: tokenData.refresh_token,
      quickbooksTokenExpiry: new Date(Date.now() + (tokenData.expires_in * 1000))
    });

    return tokenData;
  }

  // Check if token needs refresh
  needsTokenRefresh(client) {
    if (!client.quickbooksTokenExpiry) return true;
    return new Date() >= new Date(client.quickbooksTokenExpiry);
  }

  // Sync transactions from QuickBooks
  async syncTransactions(clientId) {
    try {
      const client = await Client.findByPk(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      // Refresh token if needed
      if (this.needsTokenRefresh(client)) {
        await this.refreshAccessToken(client);
        await client.reload(); // Reload to get updated tokens
      }

      const qb = this.getQuickBooksInstance(client);
      
      // Get transactions from QuickBooks
      const transactions = await new Promise((resolve, reject) => {
        qb.findTransactions({}, (err, transactions) => {
          if (err) reject(err);
          else resolve(transactions.QueryResponse.Transaction || []);
        });
      });

      // Process and store transactions
      const syncedTransactions = [];
      for (const qbTransaction of transactions) {
        // Check if transaction already exists
        const existingTransaction = await Transaction.findOne({
          where: { quickbooksTransactionId: qbTransaction.Id }
        });

        if (!existingTransaction) {
          const transaction = await Transaction.create({
            clientId: client.id,
            quickbooksTransactionId: qbTransaction.Id,
            date: new Date(qbTransaction.TxnDate),
            amount: parseFloat(qbTransaction.TotalAmt || 0),
            description: qbTransaction.PrivateNote || qbTransaction.DocNumber || '',
            category: qbTransaction.Line?.[0]?.AccountRef?.name || '',
            isAutomated: true,
            isCategorized: true
          });

          syncedTransactions.push(transaction);
        }
      }

      return {
        success: true,
        syncedCount: syncedTransactions.length,
        totalCount: transactions.length
      };
    } catch (error) {
      console.error('Error syncing transactions:', error);
      throw error;
    }
  }

  // Create invoice in QuickBooks
  async createInvoice(clientId, invoiceData) {
    try {
      const client = await Client.findByPk(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      // Refresh token if needed
      if (this.needsTokenRefresh(client)) {
        await this.refreshAccessToken(client);
        await client.reload();
      }

      const qb = this.getQuickBooksInstance(client);

      const invoice = {
        Line: invoiceData.lineItems.map(item => ({
          DetailType: 'SalesItemLineDetail',
          Amount: item.amount,
          SalesItemLineDetail: {
            ItemRef: {
              value: item.itemId,
              name: item.itemName
            },
            Qty: item.quantity,
            UnitPrice: item.unitPrice
          }
        })),
        CustomerRef: {
          value: invoiceData.customerId
        },
        TxnDate: invoiceData.date,
        DueDate: invoiceData.dueDate,
        PrivateNote: invoiceData.notes
      };

      return new Promise((resolve, reject) => {
        qb.createInvoice(invoice, (err, invoice) => {
          if (err) reject(err);
          else resolve(invoice);
        });
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Get financial reports
  async getProfitLossReport(clientId, startDate, endDate) {
    try {
      const client = await Client.findByPk(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      // Refresh token if needed
      if (this.needsTokenRefresh(client)) {
        await this.refreshAccessToken(client);
        await client.reload();
      }

      const qb = this.getQuickBooksInstance(client);

      return new Promise((resolve, reject) => {
        qb.reportProfitLoss({
          start_date: startDate,
          end_date: endDate
        }, (err, report) => {
          if (err) reject(err);
          else resolve(report);
        });
      });
    } catch (error) {
      console.error('Error getting profit loss report:', error);
      throw error;
    }
  }

  // Get balance sheet
  async getBalanceSheet(clientId, asOfDate) {
    try {
      const client = await Client.findByPk(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      // Refresh token if needed
      if (this.needsTokenRefresh(client)) {
        await this.refreshAccessToken(client);
        await client.reload();
      }

      const qb = this.getQuickBooksInstance(client);

      return new Promise((resolve, reject) => {
        qb.reportBalanceSheet({
          as_of_date: asOfDate
        }, (err, report) => {
          if (err) reject(err);
          else resolve(report);
        });
      });
    } catch (error) {
      console.error('Error getting balance sheet:', error);
      throw error;
    }
  }
}

module.exports = new QuickBooksService();