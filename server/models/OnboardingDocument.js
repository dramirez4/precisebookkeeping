const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OnboardingDocument = sequelize.define('OnboardingDocument', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    onboardingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ClientOnboardings',
        key: 'id'
      }
    },
    documentType: {
      type: DataTypes.ENUM(
        'business_license',
        'tax_id_document',
        'bank_statements',
        'previous_tax_returns',
        'chart_of_accounts',
        'invoices',
        'receipts',
        'payroll_records',
        'other'
      ),
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originalFileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    s3Key: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uploadStatus: {
      type: DataTypes.ENUM('uploading', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'uploading'
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    tableName: 'onboarding_documents',
    timestamps: true
  });

  return OnboardingDocument;
};