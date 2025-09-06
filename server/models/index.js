const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

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

// Bank Account model
const BankAccount = sequelize.define('BankAccount', {
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
  bankName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  accountType: {
    type: DataTypes.ENUM('checking', 'savings', 'credit_card', 'loan'),
    allowNull: false
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  routingNumber: {
    type: DataTypes.STRING
  },
  plaidItemId: {
    type: DataTypes.STRING
  },
  plaidAccountId: {
    type: DataTypes.STRING
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastSyncDate: {
    type: DataTypes.DATE
  }
});

// Transaction model
const Transaction = sequelize.define('Transaction', {
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
  bankAccountId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: BankAccount,
      key: 'id'
    }
  },
  quickbooksTransactionId: {
    type: DataTypes.STRING
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING
  },
  subcategory: {
    type: DataTypes.STRING
  },
  account: {
    type: DataTypes.STRING
  },
  isReconciled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isCategorized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isAutomated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT
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
Client.hasMany(BankAccount, { foreignKey: 'clientId' });
BankAccount.belongsTo(Client, { foreignKey: 'clientId' });

Client.hasMany(Transaction, { foreignKey: 'clientId' });
Transaction.belongsTo(Client, { foreignKey: 'clientId' });

BankAccount.hasMany(Transaction, { foreignKey: 'bankAccountId' });
Transaction.belongsTo(BankAccount, { foreignKey: 'bankAccountId' });

Client.hasMany(Document, { foreignKey: 'clientId' });
Document.belongsTo(Client, { foreignKey: 'clientId' });

Client.hasMany(Report, { foreignKey: 'clientId' });
Report.belongsTo(Client, { foreignKey: 'clientId' });

module.exports = {
  User,
  Client,
  BankAccount,
  Transaction,
  Document,
  Report,
  sequelize
};