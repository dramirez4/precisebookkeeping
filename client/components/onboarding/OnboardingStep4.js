import { useState } from 'react';

export default function OnboardingStep4({ onComplete, onBack }) {
  const [formData, setFormData] = useState({
    bankAccounts: [],
    additionalNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleBankAccountAdd = () => {
    setFormData(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, {
        id: Date.now(),
        bankName: '',
        accountType: 'checking',
        accountNumber: '',
        routingNumber: ''
      }]
    }));
  };

  const handleBankAccountChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map(account =>
        account.id === id ? { ...account, [field]: value } : account
      )
    }));
  };

  const handleBankAccountRemove = (id) => {
    setFormData(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter(account => account.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.bankAccounts.length === 0) {
      setErrors({ submit: 'At least one bank account is required' });
      return;
    }
    
    // Validate each bank account
    for (let i = 0; i < formData.bankAccounts.length; i++) {
      const account = formData.bankAccounts[i];
      if (!account.bankName.trim() || !account.accountType || !account.accountNumber.trim() || !account.routingNumber.trim()) {
        setErrors({ submit: 'Please fill in all bank account details' });
        return;
      }
      
      // Validate account number (last 4 digits)
      if (!/^\d{4}$/.test(account.accountNumber)) {
        setErrors({ submit: 'Account number must be exactly 4 digits' });
        return;
      }
      
      // Validate routing number (9 digits)
      if (!/^\d{9}$/.test(account.routingNumber)) {
        setErrors({ submit: 'Routing number must be exactly 9 digits' });
        return;
      }
    }
    
    setLoading(true);
    setErrors({});

    try {
      // For demo purposes, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Step 4 completed with data:', formData);
      
      // Store data in localStorage for admin dashboard
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        localStorage.setItem(`onboarding_step4_${user.id}`, JSON.stringify(formData));
      }
      
      onComplete(formData);
    } catch (error) {
      console.error('Error updating step 4:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Bank Account Information
        </h2>
        <p className="text-gray-600">
          Add your business bank accounts. This information will help us set up your bookkeeping system.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bank Accounts */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Bank Accounts</h3>
            <button
              type="button"
              onClick={handleBankAccountAdd}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Add Bank Account
            </button>
          </div>

          {formData.bankAccounts.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No bank accounts added yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add Bank Account" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.bankAccounts.map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Bank Account</h4>
                    <button
                      type="button"
                      onClick={() => handleBankAccountRemove(account.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={account.bankName}
                        onChange={(e) => handleBankAccountChange(account.id, 'bankName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., Chase, Wells Fargo, Bank of America"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type
                      </label>
                      <select
                        value={account.accountType}
                        onChange={(e) => handleBankAccountChange(account.id, 'accountType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="business">Business</option>
                        <option value="credit">Credit Card</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number (Last 4 digits)
                      </label>
                      <input
                        type="text"
                        value={account.accountNumber}
                        onChange={(e) => handleBankAccountChange(account.id, 'accountNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="1234"
                        maxLength="4"
                        pattern="[0-9]{4}"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Routing Number
                      </label>
                      <input
                        type="text"
                        value={account.routingNumber}
                        onChange={(e) => handleBankAccountChange(account.id, 'routingNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="123456789"
                        maxLength="9"
                        pattern="[0-9]{9}"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Any additional information that would help us serve you better..."
          />
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