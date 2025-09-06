const { Transaction, BankAccount, sequelize } = require('../models');

class TransactionCategorizer {
  constructor() {
    // Business expense categories with patterns
    this.categories = {
      'Office Supplies': {
        keywords: ['office depot', 'staples', 'amazon', 'supplies', 'paper', 'pens', 'ink'],
        merchants: ['office depot', 'staples', 'amazon business'],
        maxAmount: 500,
        confidence: 0.9
      },
      'Travel': {
        keywords: ['hotel', 'airline', 'uber', 'lyft', 'taxi', 'flight', 'travel'],
        merchants: ['marriott', 'hilton', 'delta', 'united', 'uber', 'lyft'],
        maxAmount: 2000,
        confidence: 0.95
      },
      'Meals & Entertainment': {
        keywords: ['restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'food'],
        merchants: ['mcdonalds', 'starbucks', 'subway', 'pizza hut'],
        maxAmount: 200,
        confidence: 0.8
      },
      'Software & Subscriptions': {
        keywords: ['subscription', 'software', 'saas', 'monthly', 'annual'],
        merchants: ['adobe', 'microsoft', 'salesforce', 'slack', 'zoom'],
        maxAmount: 1000,
        confidence: 0.9
      },
      'Marketing & Advertising': {
        keywords: ['google ads', 'facebook ads', 'marketing', 'advertising', 'promotion'],
        merchants: ['google', 'facebook', 'linkedin', 'twitter'],
        maxAmount: 5000,
        confidence: 0.85
      },
      'Professional Services': {
        keywords: ['legal', 'accounting', 'consulting', 'attorney', 'lawyer'],
        merchants: ['law firm', 'accounting firm', 'consulting'],
        maxAmount: 10000,
        confidence: 0.8
      },
      'Utilities': {
        keywords: ['electric', 'gas', 'water', 'internet', 'phone', 'utility'],
        merchants: ['comcast', 'verizon', 'at&t', 'electric company'],
        maxAmount: 1000,
        confidence: 0.9
      },
      'Rent & Lease': {
        keywords: ['rent', 'lease', 'office space', 'warehouse'],
        merchants: ['property management', 'landlord'],
        maxAmount: 50000,
        confidence: 0.95
      },
      'Insurance': {
        keywords: ['insurance', 'premium', 'coverage'],
        merchants: ['state farm', 'allstate', 'geico', 'progressive'],
        maxAmount: 5000,
        confidence: 0.9
      },
      'Equipment & Machinery': {
        keywords: ['equipment', 'machinery', 'computer', 'laptop', 'server'],
        merchants: ['dell', 'hp', 'apple', 'lenovo'],
        maxAmount: 10000,
        confidence: 0.8
      }
    };

    // Income categories
    this.incomeCategories = {
      'Sales Revenue': {
        keywords: ['payment', 'invoice', 'sale', 'revenue', 'income'],
        merchants: ['customer', 'client', 'payment'],
        confidence: 0.9
      },
      'Interest Income': {
        keywords: ['interest', 'dividend', 'yield'],
        merchants: ['bank', 'investment'],
        confidence: 0.95
      },
      'Refunds': {
        keywords: ['refund', 'return', 'credit'],
        merchants: ['refund', 'return'],
        confidence: 0.8
      }
    };
  }

  /**
   * Categorize a single transaction
   */
  async categorizeTransaction(transaction) {
    const { name, merchant_name, amount, description } = transaction;
    
    // Combine all text fields for analysis
    const textToAnalyze = [
      name,
      merchant_name,
      description
    ].filter(Boolean).join(' ').toLowerCase();

    // Check if it's income (positive amount)
    if (amount > 0) {
      return this.categorizeIncome(textToAnalyze, amount);
    }

    // Categorize expenses
    return this.categorizeExpense(textToAnalyze, amount);
  }

  /**
   * Categorize income transactions
   */
  categorizeIncome(text, amount) {
    for (const [category, rules] of Object.entries(this.incomeCategories)) {
      const score = this.calculateScore(text, rules);
      if (score > 0.7) {
        return {
          category,
          subcategory: this.getSubcategory(category, text),
          confidence: score,
          reasoning: this.getReasoning(text, rules)
        };
      }
    }

    return {
      category: 'Other Income',
      subcategory: 'Uncategorized',
      confidence: 0.3,
      reasoning: 'No specific income pattern matched'
    };
  }

  /**
   * Categorize expense transactions
   */
  categorizeExpense(text, amount) {
    let bestMatch = {
      category: 'Uncategorized',
      subcategory: 'Uncategorized',
      confidence: 0,
      reasoning: 'No patterns matched'
    };

    for (const [category, rules] of Object.entries(this.categories)) {
      // Check amount threshold
      if (amount > rules.maxAmount) {
        continue;
      }

      const score = this.calculateScore(text, rules);
      if (score > bestMatch.confidence) {
        bestMatch = {
          category,
          subcategory: this.getSubcategory(category, text),
          confidence: score,
          reasoning: this.getReasoning(text, rules)
        };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate confidence score for a category
   */
  calculateScore(text, rules) {
    let score = 0;
    let matches = 0;

    // Check keyword matches
    for (const keyword of rules.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 0.3;
        matches++;
      }
    }

    // Check merchant matches (higher weight)
    for (const merchant of rules.merchants) {
      if (text.includes(merchant.toLowerCase())) {
        score += 0.5;
        matches++;
      }
    }

    // Apply base confidence
    score = Math.min(score * rules.confidence, 1.0);

    return score;
  }

  /**
   * Get subcategory based on category and text
   */
  getSubcategory(category, text) {
    const subcategories = {
      'Travel': ['Airfare', 'Hotel', 'Ground Transportation', 'Meals'],
      'Meals & Entertainment': ['Business Meals', 'Client Entertainment', 'Team Building'],
      'Office Supplies': ['Stationery', 'Technology', 'Furniture'],
      'Software & Subscriptions': ['Productivity', 'Communication', 'Design', 'Analytics'],
      'Marketing & Advertising': ['Digital Ads', 'Print Ads', 'Events', 'Content'],
      'Professional Services': ['Legal', 'Accounting', 'Consulting', 'Other'],
      'Utilities': ['Electric', 'Gas', 'Water', 'Internet', 'Phone'],
      'Equipment & Machinery': ['Computers', 'Office Equipment', 'Manufacturing', 'Other']
    };

    const options = subcategories[category] || ['General'];
    
    // Simple subcategory logic based on text
    if (text.includes('computer') || text.includes('laptop')) return 'Computers';
    if (text.includes('phone') || text.includes('internet')) return 'Internet';
    if (text.includes('legal') || text.includes('attorney')) return 'Legal';
    if (text.includes('accounting') || text.includes('bookkeeping')) return 'Accounting';
    
    return options[0];
  }

  /**
   * Get reasoning for categorization
   */
  getReasoning(text, rules) {
    const matchedKeywords = rules.keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );
    const matchedMerchants = rules.merchants.filter(merchant => 
      text.includes(merchant.toLowerCase())
    );

    let reasoning = [];
    if (matchedKeywords.length > 0) {
      reasoning.push(`Keywords: ${matchedKeywords.join(', ')}`);
    }
    if (matchedMerchants.length > 0) {
      reasoning.push(`Merchants: ${matchedMerchants.join(', ')}`);
    }

    return reasoning.join('; ') || 'Pattern matching';
  }

  /**
   * Learn from user corrections
   */
  async learnFromCorrection(transactionId, correctCategory, correctSubcategory) {
    try {
      const transaction = await Transaction.findByPk(transactionId);
      if (!transaction) return;

      // Update the transaction
      await transaction.update({
        custom_category: correctCategory,
        custom_subcategory: correctSubcategory,
        is_reviewed: true
      });

      // TODO: Implement machine learning to improve patterns
      // For now, we'll log the correction for future analysis
      console.log(`Learned correction: ${transaction.name} -> ${correctCategory}/${correctSubcategory}`);
      
      return true;
    } catch (error) {
      console.error('Error learning from correction:', error);
      return false;
    }
  }

  /**
   * Batch categorize multiple transactions
   */
  async batchCategorize(transactions) {
    const results = [];
    
    for (const transaction of transactions) {
      const categorization = await this.categorizeTransaction(transaction);
      results.push({
        transactionId: transaction.id,
        ...categorization
      });
    }

    return results;
  }

  /**
   * Get categorization statistics
   */
  async getCategorizationStats(clientId) {
    try {
      const stats = await Transaction.findAll({
        where: { client_id: clientId },
        attributes: [
          'category',
          'custom_category',
          'is_reviewed',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['category', 'custom_category', 'is_reviewed'],
        raw: true
      });

      return {
        total: stats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
        reviewed: stats.filter(s => s.is_reviewed).reduce((sum, stat) => sum + parseInt(stat.count), 0),
        autoCategorized: stats.filter(s => !s.is_reviewed && s.category !== 'Uncategorized').reduce((sum, stat) => sum + parseInt(stat.count), 0),
        uncategorized: stats.filter(s => s.category === 'Uncategorized').reduce((sum, stat) => sum + parseInt(stat.count), 0)
      };
    } catch (error) {
      console.error('Error getting categorization stats:', error);
      return null;
    }
  }
}

module.exports = new TransactionCategorizer();