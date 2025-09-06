# 🏦 Plaid Bank Integration Setup Guide

This guide will help you set up Plaid bank integration for automatic transaction imports.

## 📋 Prerequisites

1. **Plaid Developer Account**: Sign up at [https://dashboard.plaid.com/](https://dashboard.plaid.com/)
2. **Node.js**: Version 18 or higher
3. **PostgreSQL**: Database running and accessible

## 🚀 Step 1: Create Plaid Application

1. Go to [Plaid Dashboard](https://dashboard.plaid.com/)
2. Click "Create App"
3. Fill in the application details:
   - **App Name**: Precision Bookkeeping
   - **Environment**: Sandbox (for development)
   - **Products**: Select "Transactions" and "Auth"
   - **Country**: United States

## 🔑 Step 2: Get API Credentials

1. In your Plaid dashboard, go to "Team Settings" → "Keys"
2. Copy the following values:
   - **Client ID**
   - **Sandbox Secret** (for development)
   - **Development Secret** (for development)

## ⚙️ Step 3: Configure Environment Variables

1. Copy `env.example` to `.env`:

   ```bash
   cp env.example .env
   ```

2. Update the Plaid configuration in `.env`:
   ```env
   # Plaid Configuration
   PLAID_CLIENT_ID=your_plaid_client_id_here
   PLAID_SECRET=your_plaid_sandbox_secret_here
   PLAID_ENV=sandbox
   API_BASE_URL=http://localhost:3002
   ```

## 🗄️ Step 4: Update Database Schema

The new models will be automatically created when you start the server. If you need to manually sync:

```bash
# Start the server to trigger database sync
npm start
```

## 🧪 Step 5: Test the Integration

1. **Start the application**:

   ```bash
   ./start-all.sh
   ```

2. **Access the client portal**: http://localhost:3001

3. **Login with test credentials**:

   - Email: `test@precisionbookkeeping.com`
   - Password: `password123`

4. **Navigate to Banking tab** in the dashboard

5. **Click "Connect Bank Account"**

6. **Use Plaid Sandbox credentials**:
   - Username: `user_good`
   - Password: `pass_good`

## 🏦 Step 6: Sandbox Test Credentials

Plaid provides test credentials for different scenarios:

### Standard Test User

- **Username**: `user_good`
- **Password**: `pass_good`
- **Institution**: Chase, Wells Fargo, Bank of America, etc.

### Error Scenarios

- **Username**: `user_bad`
- **Password**: `pass_bad`
- **Result**: Invalid credentials error

### MFA Required

- **Username**: `user_good`
- **Password**: `mfa_device`
- **Result**: Multi-factor authentication required

## 🔄 Step 7: Webhook Configuration (Optional)

For production, configure webhooks to receive real-time transaction updates:

1. In Plaid dashboard, go to "Team Settings" → "Webhooks"
2. Add webhook URL: `https://yourdomain.com/api/plaid/webhook`
3. Select events: `TRANSACTIONS`, `ITEM`

## 🚀 Step 8: Production Setup

When ready for production:

1. **Switch to Production Environment**:

   ```env
   PLAID_ENV=production
   PLAID_SECRET=your_production_secret_here
   ```

2. **Update Webhook URL** to your production domain

3. **Test with real bank accounts** (start with a small test account)

## 📊 Features Available

Once set up, you'll have access to:

- ✅ **Automatic Bank Connection**: Clients can connect their bank accounts securely
- ✅ **Transaction Import**: Automatic daily transaction imports
- ✅ **Account Management**: View all connected accounts
- ✅ **Transaction Categorization**: Automatic categorization with Plaid's AI
- ✅ **Real-time Sync**: Manual and automatic transaction synchronization
- ✅ **Webhook Support**: Real-time transaction updates
- ✅ **Error Handling**: Comprehensive error handling and status tracking

## 🔧 Troubleshooting

### Common Issues

1. **"Invalid credentials" error**:

   - Check your `PLAID_CLIENT_ID` and `PLAID_SECRET`
   - Ensure you're using the correct environment (sandbox vs production)

2. **"Link token creation failed"**:

   - Verify your Plaid app is configured with the correct products
   - Check that your webhook URL is accessible

3. **"Database connection error"**:

   - Ensure PostgreSQL is running
   - Check your database credentials in `.env`

4. **"CORS error"**:
   - Verify your frontend URL is in the CORS configuration
   - Check that the API is running on the correct port

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
DEBUG=plaid:*
```

## 📚 Additional Resources

- [Plaid Documentation](https://plaid.com/docs/)
- [Plaid Link Documentation](https://plaid.com/docs/link/)
- [Plaid API Reference](https://plaid.com/docs/api/)
- [Plaid Webhooks Guide](https://plaid.com/docs/api/webhooks/)

## 🆘 Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify your Plaid dashboard configuration
3. Test with Plaid's sandbox credentials first
4. Review the Plaid documentation for your specific use case

---

**🎉 Congratulations!** You now have automatic bank integration set up. Your clients can connect their bank accounts and automatically import transactions for seamless bookkeeping automation.
