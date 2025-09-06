import { useState } from 'react';

export default function OnboardingStep5({ onComplete, onBack }) {
  const [formData, setFormData] = useState({
    agreeToTerms: false,
    agreeToPrivacy: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);


  const handleChange = (e) => {
    const { name, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : false
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

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms of service';
    }
    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = 'You must agree to the privacy policy';
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
      // For demo purposes, simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Step 5 completed with data:', formData);
      
      // Store data in localStorage for admin dashboard
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        localStorage.setItem(`onboarding_step5_${user.id}`, JSON.stringify(formData));
      }
      
      // Simulate completing onboarding
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Onboarding completed!');
      onComplete(formData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Final Setup
        </h2>
        <p className="text-gray-600 mb-4">
          Complete your onboarding by agreeing to our terms and conditions.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-green-800 mb-2">🎉 Almost Done!</h4>
          <p className="text-sm text-green-700">
            You're just one step away from completing your onboarding. Once you finish, you'll have full access to your client dashboard and all our bookkeeping services.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Terms and Privacy */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Agreements</h3>
          
          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <span className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <button 
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-primary-600 hover:text-primary-500 underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Terms of Service
                </button>{' '}
                and understand the scope of services provided.
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
            )}

            <label className="flex items-start">
              <input
                type="checkbox"
                name="agreeToPrivacy"
                checked={formData.agreeToPrivacy}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <span className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <button 
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-primary-600 hover:text-primary-500 underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Privacy Policy
                </button>{' '}
                and consent to the collection and use of my information as described.
              </span>
            </label>
            {errors.agreeToPrivacy && (
              <p className="text-sm text-red-600">{errors.agreeToPrivacy}</p>
            )}
          </div>
        </div>

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
            {loading ? 'Completing...' : 'Complete Onboarding'}
          </button>
        </div>
      </form>

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="prose max-w-none text-sm text-gray-700 space-y-4">
                <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                
                <h3 className="text-lg font-semibold text-gray-900">1. Service Agreement</h3>
                <p>Precision Bookkeeping ("we," "our," or "us") provides professional bookkeeping and accounting services to businesses. By engaging our services, you agree to these terms.</p>
                
                <h3 className="text-lg font-semibold text-gray-900">2. Scope of Services</h3>
                <p>Our services include but are not limited to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Monthly bookkeeping and transaction categorization</li>
                  <li>Bank reconciliation and account management</li>
                  <li>Financial statement preparation (P&L, Balance Sheet, Cash Flow)</li>
                  <li>Tax preparation and filing assistance</li>
                  <li>QuickBooks setup, training, and maintenance</li>
                  <li>Accounts payable and receivable management</li>
                  <li>Payroll processing (Enterprise plan)</li>
                  <li>Business advisory and consultation</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-gray-900">3. Client Responsibilities</h3>
                <p>You agree to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate and complete financial information</li>
                  <li>Submit required documents in a timely manner</li>
                  <li>Maintain access to bank accounts and financial systems</li>
                  <li>Pay monthly fees as agreed in your subscription plan</li>
                  <li>Notify us of any significant business changes</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-gray-900">4. Payment Terms</h3>
                <p>Monthly subscription fees are due in advance. Late payments may result in service suspension. All fees are non-refundable except as required by law.</p>
                
                <h3 className="text-lg font-semibold text-gray-900">5. Confidentiality</h3>
                <p>We maintain strict confidentiality of all client financial information and will not disclose it to third parties except as required by law or with your written consent.</p>
                
                <h3 className="text-lg font-semibold text-gray-900">6. Limitation of Liability</h3>
                <p>Our liability is limited to the amount of fees paid for services. We are not responsible for business decisions made based on our reports or advice.</p>
                
                <h3 className="text-lg font-semibold text-gray-900">7. Termination</h3>
                <p>Either party may terminate services with 30 days written notice. Upon termination, you will receive all work completed and data in our possession.</p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="prose max-w-none text-sm text-gray-700 space-y-4">
                <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                
                <h3 className="text-lg font-semibold text-gray-900">1. Information We Collect</h3>
                <p>We collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Business Information:</strong> Company name, address, phone, email, tax ID, business type</li>
                  <li><strong>Financial Data:</strong> Bank account information, transaction data, financial statements</li>
                  <li><strong>Documentation:</strong> Receipts, invoices, contracts, tax documents</li>
                  <li><strong>Payment Information:</strong> Credit card details, bank account information for billing</li>
                  <li><strong>Communication Data:</strong> Emails, phone calls, meeting notes</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-gray-900">2. How We Use Your Information</h3>
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide bookkeeping and accounting services</li>
                  <li>Prepare financial reports and tax documents</li>
                  <li>Process payments and manage billing</li>
                  <li>Communicate about your account and services</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Improve our services and customer experience</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-gray-900">3. Information Sharing</h3>
                <p>We do not sell, trade, or rent your personal information. We may share information only:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>With trusted service providers who assist in our operations</li>
                  <li>In case of business transfer or merger</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-gray-900">4. Data Security</h3>
                <p>We implement industry-standard security measures including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure cloud storage with access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>Employee training on data protection</li>
                  <li>Limited access on a need-to-know basis</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-gray-900">5. Data Retention</h3>
                <p>We retain your information for as long as necessary to provide services and comply with legal requirements. Financial records are typically retained for 7 years as required by tax regulations.</p>
                
                <h3 className="text-lg font-semibold text-gray-900">6. Your Rights</h3>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information (subject to legal requirements)</li>
                  <li>Opt out of marketing communications</li>
                  <li>Data portability</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-gray-900">7. Contact Us</h3>
                <p>For questions about this Privacy Policy or to exercise your rights, contact us at:</p>
                <p>
                  <strong>Precision Bookkeeping</strong><br/>
                  Email: privacy@precisionbookkeeping.com<br/>
                  Phone: (555) 123-4567<br/>
                  Address: [Your Business Address]
                </p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}