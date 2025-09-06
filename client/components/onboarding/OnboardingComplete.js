import { useState } from 'react';

export default function OnboardingComplete({ onComplete }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="p-8">
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Precision Bookkeeping!
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Your onboarding is complete! We've received all your information and documents. 
          Our team will review everything and get back to you within 24 hours to schedule your setup call.
        </p>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-blue-900 mb-4">What happens next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-medium">
                  1
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Document Review:</strong> Our team will review your uploaded documents and business information.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-medium">
                  2
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Setup Call:</strong> We'll schedule a 30-minute call to discuss your specific needs and set up your account.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-medium">
                  3
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Account Setup:</strong> We'll set up your bookkeeping system and connect your bank accounts.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-sm font-medium">
                  4
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  <strong>Go Live:</strong> Your bookkeeping will be fully automated and you'll have access to your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Need help?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📧 Email: <a href="mailto:support@precisionbookkeeping.com" className="text-primary-600 hover:text-primary-500">support@precisionbookkeeping.com</a></p>
            <p>📞 Phone: <a href="tel:+1-555-123-4567" className="text-primary-600 hover:text-primary-500">(555) 123-4567</a></p>
            <p>💬 Live Chat: Available in your dashboard</p>
          </div>
        </div>

        {/* Optional Details */}
        <div className="mb-8">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            {showDetails ? 'Hide' : 'Show'} onboarding summary
          </button>
          
          {showDetails && (
            <div className="mt-4 bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto text-left">
              <h4 className="font-medium text-gray-900 mb-4">Onboarding Summary</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✅ Business information collected</p>
                <p>✅ Business details and service preferences recorded</p>
                <p>✅ Documents uploaded and categorized</p>
                <p>✅ Bank account information provided</p>
                <p>✅ Communication preferences set</p>
                <p>✅ Terms and privacy agreements accepted</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onComplete}
            className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
          >
            Print Summary
          </button>
        </div>
      </div>
    </div>
  );
}