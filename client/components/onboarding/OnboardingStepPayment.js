import { useState } from 'react';

export default function OnboardingStepPayment({ onComplete, onBack }) {
  const [formData, setFormData] = useState({
    paymentMethod: 'credit_card', // credit_card, bank_account, ach
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bankAccountType: 'checking',
    bankAccountHolderName: '',
    agreeToBilling: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.substring(0, 2) + '/' + digits.substring(2, 4);
    }
    return digits;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData(prev => ({
      ...prev,
      expiryDate: formatted
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.paymentMethod === 'credit_card') {
      if (!formData.cardNumber.replace(/\s/g, '')) {
        newErrors.cardNumber = 'Card number is required';
      } else if (formData.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
      
      if (!formData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Please enter expiry date as MM/YY';
      }
      
      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'CVV must be 3-4 digits';
      }
      
      if (!formData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }
      
      if (!formData.billingAddress.trim()) {
        newErrors.billingAddress = 'Billing address is required';
      }
      
      if (!formData.billingCity.trim()) {
        newErrors.billingCity = 'Billing city is required';
      }
      
      if (!formData.billingState.trim()) {
        newErrors.billingState = 'Billing state is required';
      }
      
      if (!formData.billingZip.trim()) {
        newErrors.billingZip = 'Billing ZIP code is required';
      }
    } else if (formData.paymentMethod === 'ach') {
      if (!formData.bankAccountNumber.trim()) {
        newErrors.bankAccountNumber = 'Bank account number is required';
      }
      
      if (!formData.bankRoutingNumber.trim()) {
        newErrors.bankRoutingNumber = 'Bank routing number is required';
      } else if (!/^\d{9}$/.test(formData.bankRoutingNumber)) {
        newErrors.bankRoutingNumber = 'Routing number must be 9 digits';
      }
      
      if (!formData.bankAccountHolderName.trim()) {
        newErrors.bankAccountHolderName = 'Account holder name is required';
      }
    }

    if (!formData.agreeToBilling) {
      newErrors.agreeToBilling = 'You must agree to the billing terms';
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
      console.log('Payment step completed with data:', formData);
      
      // Store data in localStorage for admin dashboard
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        localStorage.setItem(`onboarding_payment_${user.id}`, JSON.stringify(formData));
      }
      
      onComplete(formData);
    } catch (error) {
      console.error('Error processing payment:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Information
        </h2>
        <p className="text-gray-600 mb-4">
          Set up your payment method for monthly subscription billing.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-blue-800 mb-2">🔒 Secure Payment</h4>
          <p className="text-sm text-blue-700">
            Your payment information is encrypted and securely stored. We use industry-standard security measures to protect your data.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.paymentMethod === 'credit_card' 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="credit_card"
                checked={formData.paymentMethod === 'credit_card'}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-2">💳</div>
                <h3 className="text-lg font-semibold text-gray-900">Credit Card</h3>
                <p className="text-sm text-gray-600 mt-1">Visa, Mastercard, American Express</p>
              </div>
            </label>
            
            <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.paymentMethod === 'ach' 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="ach"
                checked={formData.paymentMethod === 'ach'}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-2">🏦</div>
                <h3 className="text-lg font-semibold text-gray-900">Bank Account (ACH)</h3>
                <p className="text-sm text-gray-600 mt-1">Direct bank transfer</p>
              </div>
            </label>
          </div>
        </div>

        {/* Credit Card Form */}
        {formData.paymentMethod === 'credit_card' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Credit Card Details</h3>
            
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Card Number *
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                maxLength="19"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="1234 5678 9012 3456"
              />
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleExpiryChange}
                  maxLength="5"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="MM/YY"
                />
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                  CVV *
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  maxLength="4"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.cvv ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="123"
                />
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name *
              </label>
              <input
                type="text"
                id="cardholderName"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.cardholderName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errors.cardholderName && (
                <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
              )}
            </div>

            {/* Billing Address */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Billing Address</h4>
              
              <div>
                <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.billingAddress ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="123 Main Street"
                />
                {errors.billingAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.billingAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="billingCity"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.billingCity ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="San Francisco"
                  />
                  {errors.billingCity && (
                    <p className="mt-1 text-sm text-red-600">{errors.billingCity}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    id="billingState"
                    name="billingState"
                    value={formData.billingState}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.billingState ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="CA"
                  />
                  {errors.billingState && (
                    <p className="mt-1 text-sm text-red-600">{errors.billingState}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="billingZip" className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="billingZip"
                    name="billingZip"
                    value={formData.billingZip}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                      errors.billingZip ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="94105"
                  />
                  {errors.billingZip && (
                    <p className="mt-1 text-sm text-red-600">{errors.billingZip}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACH Form */}
        {formData.paymentMethod === 'ach' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Bank Account Details</h3>
            
            <div>
              <label htmlFor="bankAccountHolderName" className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name *
              </label>
              <input
                type="text"
                id="bankAccountHolderName"
                name="bankAccountHolderName"
                value={formData.bankAccountHolderName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.bankAccountHolderName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errors.bankAccountHolderName && (
                <p className="mt-1 text-sm text-red-600">{errors.bankAccountHolderName}</p>
              )}
            </div>

            <div>
              <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Bank Account Number *
              </label>
              <input
                type="text"
                id="bankAccountNumber"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.bankAccountNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="1234567890"
              />
              {errors.bankAccountNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.bankAccountNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bankRoutingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Routing Number *
                </label>
                <input
                  type="text"
                  id="bankRoutingNumber"
                  name="bankRoutingNumber"
                  value={formData.bankRoutingNumber}
                  onChange={handleChange}
                  maxLength="9"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                    errors.bankRoutingNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="123456789"
                />
                {errors.bankRoutingNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.bankRoutingNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="bankAccountType" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type *
                </label>
                <select
                  id="bankAccountType"
                  name="bankAccountType"
                  value={formData.bankAccountType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Billing Agreement */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Billing Agreement</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Monthly Billing Terms:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Your subscription will be automatically charged monthly</li>
              <li>• Billing occurs on the same date each month as your signup date</li>
              <li>• You can cancel or change your plan at any time</li>
              <li>• Failed payments may result in service suspension</li>
              <li>• All charges are non-refundable unless otherwise specified</li>
            </ul>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="agreeToBilling"
              name="agreeToBilling"
              checked={formData.agreeToBilling}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="agreeToBilling" className="ml-2 text-sm text-gray-700">
              I agree to the billing terms and authorize automatic monthly charges for my selected subscription plan.
            </label>
          </div>
          {errors.agreeToBilling && (
            <p className="text-sm text-red-600">{errors.agreeToBilling}</p>
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
            {loading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}