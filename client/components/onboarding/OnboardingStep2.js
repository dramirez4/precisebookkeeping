import { useState } from 'react';

export default function OnboardingStep2({ onComplete, onBack }) {
  const [formData, setFormData] = useState({
    expectedMonthlyRevenue: '',
    numberOfEmployees: '',
    currentBookkeepingSystem: '',
    subscriptionPlan: 'starter' // Default to starter plan
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const bookkeepingSystems = [
    'QuickBooks Online',
    'QuickBooks Desktop',
    'Xero',
    'FreshBooks',
    'Wave',
    'Excel/Spreadsheets',
    'Manual/Paper',
    'Other',
    'None'
  ];

  const subscriptionPlans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      price: '$299/month',
      description: 'Perfect for small businesses',
      features: ['Monthly Bookkeeping', 'Bank Reconciliation', 'Basic Financial Reports']
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      price: '$599/month',
      description: 'Ideal for growing businesses',
      features: ['Everything in Starter', 'Tax Preparation', 'Advanced Reporting', 'Accounts Payable/Receivable']
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: '$999/month',
      description: 'For established businesses',
      features: ['Everything in Professional', 'Payroll Processing', 'Business Advisory', 'Dedicated Account Manager']
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.expectedMonthlyRevenue) {
      newErrors.expectedMonthlyRevenue = 'Expected monthly revenue is required';
    }
    if (!formData.numberOfEmployees) {
      newErrors.numberOfEmployees = 'Number of employees is required';
    }
    if (!formData.subscriptionPlan) {
      newErrors.subscriptionPlan = 'Please select a subscription plan';
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
      console.log('Step 2 completed with data:', formData);
      
      // Store data in localStorage for admin dashboard
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        localStorage.setItem(`onboarding_step2_${user.id}`, JSON.stringify(formData));
      }
      
      onComplete(formData);
    } catch (error) {
      console.error('Error updating step 2:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Business Details & Plan Selection
        </h2>
        <p className="text-gray-600">
          Help us understand your business better and choose the plan that best fits your needs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expected Monthly Revenue */}
          <div>
            <label htmlFor="expectedMonthlyRevenue" className="block text-sm font-medium text-gray-700 mb-2">
              Expected Monthly Revenue *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="expectedMonthlyRevenue"
                name="expectedMonthlyRevenue"
                value={formData.expectedMonthlyRevenue}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full pl-7 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.expectedMonthlyRevenue ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="15000.00"
              />
            </div>
            {errors.expectedMonthlyRevenue && (
              <p className="mt-1 text-sm text-red-600">{errors.expectedMonthlyRevenue}</p>
            )}
          </div>

          {/* Number of Employees */}
          <div>
            <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Employees *
            </label>
            <input
              type="number"
              id="numberOfEmployees"
              name="numberOfEmployees"
              value={formData.numberOfEmployees}
              onChange={handleChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                errors.numberOfEmployees ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="5"
            />
            {errors.numberOfEmployees && (
              <p className="mt-1 text-sm text-red-600">{errors.numberOfEmployees}</p>
            )}
          </div>
        </div>

        {/* Current Bookkeeping System */}
        <div>
          <label htmlFor="currentBookkeepingSystem" className="block text-sm font-medium text-gray-700 mb-2">
            Current Bookkeeping System
          </label>
          <select
            id="currentBookkeepingSystem"
            name="currentBookkeepingSystem"
            value={formData.currentBookkeepingSystem}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select current system</option>
            {bookkeepingSystems.map(system => (
              <option key={system} value={system}>{system}</option>
            ))}
          </select>
        </div>

        {/* Subscription Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Your Plan *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscriptionPlans.map(plan => (
              <label key={plan.id} className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.subscriptionPlan === plan.id 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="subscriptionPlan"
                  value={plan.id}
                  checked={formData.subscriptionPlan === plan.id}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-2xl font-bold text-primary-600 mt-2">{plan.price}</p>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </label>
            ))}
          </div>
          {errors.subscriptionPlan && (
            <p className="mt-1 text-sm text-red-600">{errors.subscriptionPlan}</p>
          )}
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}