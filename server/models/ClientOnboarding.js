const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ClientOnboarding = sequelize.define('ClientOnboarding', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    businessType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: false
    },
    businessAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    businessPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    taxId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    businessStartDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    accountingMethod: {
      type: DataTypes.ENUM('cash', 'accrual'),
      allowNull: false,
      defaultValue: 'cash'
    },
    fiscalYearEnd: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '12-31'
    },
    expectedMonthlyRevenue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    },
    numberOfEmployees: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    currentBookkeepingSystem: {
      type: DataTypes.STRING,
      allowNull: true
    },
    servicesNeeded: {
      type: DataTypes.JSON,
      allowNull: true
    },
    onboardingStatus: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'on_hold'),
      allowNull: false,
      defaultValue: 'pending'
    },
    onboardingStep: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    totalSteps: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    documentsUploaded: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    bankAccountsConnected: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    assignedBookkeeper: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    onboardingCompletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'client_onboardings',
    timestamps: true
  });

  return ClientOnboarding;
};