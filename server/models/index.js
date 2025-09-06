const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import onboarding models (commented out for now)
// const ClientOnboarding = require('./ClientOnboarding')(sequelize);
// const OnboardingDocument = require('./OnboardingDocument')(sequelize);

// User model (for admin/staff)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'bookkeeper', 'client'),
    defaultValue: 'bookkeeper'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Client model
const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.JSONB
  },
  businessType: {
    type: DataTypes.STRING
  },
  monthlyRevenue: {
    type: DataTypes.DECIMAL(12, 2)
  },
  serviceTier: {
    type: DataTypes.ENUM('essential', 'professional', 'growth'),
    defaultValue: 'essential'
  },
  status: {
    type: DataTypes.ENUM('prospect', 'active', 'inactive', 'suspended'),
    defaultValue: 'prospect'
  },
  quickbooksCompanyId: {
    type: DataTypes.STRING
  },
  quickbooksAccessToken: {
    type: DataTypes.TEXT
  },
  quickbooksRefreshToken: {
    type: DataTypes.TEXT
  },
  quickbooksTokenExpiry: {
    type: DataTypes.DATE
  },
  onboardingCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  onboardingDate: {
    type: DataTypes.DATE
  }
});

// Bank Account model (Enhanced for Plaid)
const BankAccount = sequelize.define('BankAccount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  client_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Client,
      key: 'id'
    }
  },
  plaid_item_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  plaid_access_token: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  plaid_account_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  institution_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  institution_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  account_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  account_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  account_subtype: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mask: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_sync: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sync_status: {
    type: DataTypes.ENUM('active', 'error', 'disconnected'),
    defaultValue: 'active'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Transaction model (Enhanced for Plaid)
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  client_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Client,
      key: 'id'
    }
  },
  bank_account_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: BankAccount,
      key: 'id'
    }
  },
  plaid_transaction_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  account_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  merchant_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subcategory: {
    type: DataTypes.STRING,
    allowNull: true
  },
  account_owner: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pending_transaction_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  payment_meta: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  personal_finance_category: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  // Custom categorization
  custom_category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  custom_subcategory: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_reviewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_reconciled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reconciled_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // QuickBooks integration
  quickbooks_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  quickbooks_synced: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  quickbooks_sync_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

// Document model
const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Client,
      key: 'id'
    }
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER
  },
  s3Key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  s3Bucket: {
    type: DataTypes.STRING,
    allowNull: false
  },
  documentType: {
    type: DataTypes.ENUM('receipt', 'invoice', 'statement', 'tax_document', 'other'),
    allowNull: false
  },
  month: {
    type: DataTypes.INTEGER
  },
  year: {
    type: DataTypes.INTEGER
  },
  isProcessed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ocrText: {
    type: DataTypes.TEXT
  },
  extractedData: {
    type: DataTypes.JSONB
  }
});

// Report model
const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Client,
      key: 'id'
    }
  },
  reportType: {
    type: DataTypes.ENUM('profit_loss', 'balance_sheet', 'cash_flow', 'custom'),
    allowNull: false
  },
  period: {
    type: DataTypes.STRING, // e.g., "2024-01" for January 2024
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  isGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  generatedAt: {
    type: DataTypes.DATE
  }
});

// Define associations
Client.hasMany(BankAccount, { foreignKey: 'client_id' });
BankAccount.belongsTo(Client, { foreignKey: 'client_id' });

Client.hasMany(Transaction, { foreignKey: 'client_id' });
Transaction.belongsTo(Client, { foreignKey: 'client_id' });

BankAccount.hasMany(Transaction, { foreignKey: 'bank_account_id' });
Transaction.belongsTo(BankAccount, { foreignKey: 'bank_account_id' });

Client.hasMany(Document, { foreignKey: 'clientId' });
Document.belongsTo(Client, { foreignKey: 'clientId' });

Client.hasMany(Report, { foreignKey: 'clientId' });
Report.belongsTo(Client, { foreignKey: 'clientId' });

// Onboarding associations (commented out for now)
// User.hasMany(ClientOnboarding, { foreignKey: 'userId' });
// ClientOnboarding.belongsTo(User, { foreignKey: 'userId' });

// User.hasMany(ClientOnboarding, { foreignKey: 'assignedBookkeeper' });
// ClientOnboarding.belongsTo(User, { foreignKey: 'assignedBookkeeper' });

// ClientOnboarding.hasMany(OnboardingDocument, { foreignKey: 'onboardingId' });
// OnboardingDocument.belongsTo(ClientOnboarding, { foreignKey: 'onboardingId' });

// User.hasMany(OnboardingDocument, { foreignKey: 'uploadedBy' });
// OnboardingDocument.belongsTo(User, { foreignKey: 'uploadedBy' });

module.exports = {
  User,
  Client,
  BankAccount,
  Transaction,
  Document,
  Report,
  // ClientOnboarding,
  // OnboardingDocument,
  sequelize
};