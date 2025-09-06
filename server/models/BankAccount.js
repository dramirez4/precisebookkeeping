const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BankAccount = sequelize.define('BankAccount', {
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
    plaid_item_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    plaid_access_token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    plaid_account_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    institution_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    institution_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_subtype: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mask: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_sync: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sync_status: {
      type: DataTypes.ENUM('active', 'error', 'disconnected'),
      defaultValue: 'active',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'BankAccount',
    timestamps: true,
    indexes: [
      {
        fields: ['client_id'],
      },
      {
        fields: ['plaid_item_id'],
        unique: true,
      },
      {
        fields: ['institution_id'],
      },
      {
        fields: ['is_active'],
      },
    ],
  });

  BankAccount.associate = (models) => {
    BankAccount.belongsTo(models.Client, {
      foreignKey: 'client_id',
      as: 'client',
    });
    
    BankAccount.hasMany(models.Transaction, {
      foreignKey: 'bank_account_id',
      as: 'transactions',
    });
  };

  return BankAccount;
};