import { useState } from 'react';

export default function OnboardingStep1({ onComplete, onBack }) {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    industry: '',
    businessAddress: '',
    businessPhone: '',
    taxId: '',
    businessStartDate: '',
    accountingMethod: 'cash',
    fiscalYearEnd: '12-31'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const businessTypes = [
    'Sole Proprietorship',
    'Partnership',
    'LLC',
    'S-Corporation',
    'C-Corporation',
    'Non-Profit',
    'Other'
  ];

  const industries = [
    'Professional Services',
    'Retail',
    'Restaurant/Food Service',
    'Healthcare',
    'Construction',
    'Real Estate',
    'Technology',
    'Manufacturing',
    'Consulting',
    'E-commerce',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.businessType) {
      newErrors.businessType = 'Business type is required';
    }
    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }
    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = 'Business address is required';
    }
    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = 'Business phone is required';
    } else if (!/^[\d\s\(\)\-\+]+$/.test(formData.businessPhone)) {
      newErrors.businessPhone = 'Please enter a valid phone number';
    }
    if (!formData.businessStartDate) {
      newErrors.businessStartDate = 'Business start date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // For demo purposes, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Onboarding started with data:', formData);
      
      // Store data in localStorage for admin dashboard
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        localStorage.setItem(`onboarding_step1_${user.id}`, JSON.stringify(formData));
      }
      
      onComplete(formData);
    } catch (error) {
      console.error('Error starting onboarding:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Business Information
        </h2>
        <p className="text-gray-600">
          Let's start by gathering some basic information about your business.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.businessName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Acme Consulting LLC"
            />
            {errors.businessName && (
              <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
            )}
          </div>

          {/* Business Type */}
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
              Business Type *
            </label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.businessType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select business type</option>
              {businessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.businessType && (
              <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
              Industry *
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.industry ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select industry</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
            )}
          </div>

          {/* Business Phone */}
          <div>
            <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-2">
              Business Phone *
            </label>
            <input
              type="tel"
              id="businessPhone"
              name="businessPhone"
              value={formData.businessPhone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.businessPhone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="(555) 123-4567"
              pattern="[0-9\s\(\)\-\+]+"
            />
            {errors.businessPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.businessPhone}</p>
            )}
          </div>

          {/* Tax ID */}
          <div>
            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
              Tax ID (EIN/SSN)
            </label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="12-3456789"
              pattern="[0-9]{2}-[0-9]{7}"
            />
          </div>

          {/* Business Start Date */}
          <div>
            <label htmlFor="businessStartDate" className="block text-sm font-medium text-gray-700 mb-2">
              Business Start Date *
            </label>
            <input
              type="date"
              id="businessStartDate"
              name="businessStartDate"
              value={formData.businessStartDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.businessStartDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.businessStartDate && (
              <p className="mt-1 text-sm text-red-600">{errors.businessStartDate}</p>
            )}
          </div>
        </div>

        {/* Business Address */}
        <div>
          <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Business Address *
          </label>
          <textarea
            id="businessAddress"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
              errors.businessAddress ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your complete business address"
          />
          {errors.businessAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.businessAddress}</p>
          )}
        </div>

        {/* Accounting Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="accountingMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Accounting Method
            </label>
            <select
              id="accountingMethod"
              name="accountingMethod"
              value={formData.accountingMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="cash">Cash Basis</option>
              <option value="accrual">Accrual Basis</option>
            </select>
          </div>

          <div>
            <label htmlFor="fiscalYearEnd" className="block text-sm font-medium text-gray-700 mb-2">
              Fiscal Year End
            </label>
            <select
              id="fiscalYearEnd"
              name="fiscalYearEnd"
              value={formData.fiscalYearEnd}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="12-31">December 31</option>
              <option value="01-31">January 31</option>
              <option value="02-28">February 28</option>
              <option value="03-31">March 31</option>
              <option value="04-30">April 30</option>
              <option value="05-31">May 31</option>
              <option value="06-30">June 30</option>
              <option value="07-31">July 31</option>
              <option value="08-31">August 31</option>
              <option value="09-30">September 30</option>
              <option value="10-31">October 31</option>
              <option value="11-30">November 30</option>
            </select>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}