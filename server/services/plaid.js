const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

class PlaidService {
  constructor() {
    this.client = new PlaidApi(
      new Configuration({
        basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
          },
        },
      })
    );
  }

  /**
   * Create a link token for client to connect their bank account
   */
  async createLinkToken(userId, clientId) {
    try {
      const request = {
        user: {
          client_user_id: userId.toString(),
        },
        client_name: 'Precision Bookkeeping',
        products: ['transactions', 'auth'],
        country_codes: ['US'],
        language: 'en',
        webhook: `${process.env.API_BASE_URL}/api/plaid/webhook`,
        account_filters: {
          depository: {
            account_subtypes: ['checking', 'savings'],
          },
        },
      };

      const response = await this.client.linkTokenCreate(request);
      return {
        success: true,
        link_token: response.data.link_token,
        expiration: response.data.expiration,
      };
    } catch (error) {
      console.error('Error creating link token:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Exchange public token for access token
   */
  async exchangePublicToken(publicToken, clientId) {
    try {
      const request = {
        public_token: publicToken,
      };

      const response = await this.client.itemPublicTokenExchange(request);
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      return {
        success: true,
        access_token: accessToken,
        item_id: itemId,
      };
    } catch (error) {
      console.error('Error exchanging public token:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get account information
   */
  async getAccounts(accessToken) {
    try {
      const request = {
        access_token: accessToken,
      };

      const response = await this.client.accountsGet(request);
      return {
        success: true,
        accounts: response.data.accounts,
        item: response.data.item,
      };
    } catch (error) {
      console.error('Error getting accounts:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch transactions for a specific date range
   */
  async getTransactions(accessToken, startDate, endDate, accountIds = null) {
    try {
      const request = {
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        count: 500,
        offset: 0,
      };

      if (accountIds) {
        request.account_ids = accountIds;
      }

      const response = await this.client.transactionsGet(request);
      return {
        success: true,
        transactions: response.data.transactions,
        total_transactions: response.data.total_transactions,
        accounts: response.data.accounts,
      };
    } catch (error) {
      console.error('Error getting transactions:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all transactions for the last 30 days
   */
  async getRecentTransactions(accessToken, accountIds = null) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return this.getTransactions(
      accessToken,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      accountIds
    );
  }

  /**
   * Update webhook URL for an item
   */
  async updateWebhook(accessToken, webhookUrl) {
    try {
      const request = {
        access_token: accessToken,
        webhook: webhookUrl,
      };

      const response = await this.client.itemWebhookUpdate(request);
      return {
        success: true,
        item: response.data.item,
      };
    } catch (error) {
      console.error('Error updating webhook:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Remove an item (disconnect bank account)
   */
  async removeItem(accessToken) {
    try {
      const request = {
        access_token: accessToken,
      };

      const response = await this.client.itemRemove(request);
      return {
        success: true,
        removed: response.data.removed,
      };
    } catch (error) {
      console.error('Error removing item:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get institution information
   */
  async getInstitution(institutionId) {
    try {
      const request = {
        institution_id: institutionId,
        country_codes: ['US'],
      };

      const response = await this.client.institutionsGetById(request);
      return {
        success: true,
        institution: response.data.institution,
      };
    } catch (error) {
      console.error('Error getting institution:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new PlaidService();