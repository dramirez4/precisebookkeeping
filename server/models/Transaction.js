const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Client',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    bank_account_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'BankAccount',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    plaid_transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    account_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    merchant_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subcategory: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    account_owner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    pending_transaction_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_meta: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    personal_finance_category: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    // Custom categorization
    custom_category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    custom_subcategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_reviewed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_reconciled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reconciled_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // QuickBooks integration
    quickbooks_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quickbooks_synced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    quickbooks_sync_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'Transaction',
    timestamps: true,
    indexes: [
      {
        fields: ['client_id'],
      },
      {
        fields: ['bank_account_id'],
      },
      {
        fields: ['plaid_transaction_id'],
        unique: true,
      },
      {
        fields: ['date'],
      },
      {
        fields: ['amount'],
      },
      {
        fields: ['category_id'],
      },
      {
        fields: ['custom_category'],
      },
      {
        fields: ['is_reviewed'],
      },
      {
        fields: ['is_reconciled'],
      },
      {
        fields: ['pending'],
      },
    ],
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client',
    });
    
    Transaction.belongsTo(models.BankAccount, {
      foreignKey: 'bank_account_id',
      as: 'bankAccount',
    });
  };

  return Transaction;
};