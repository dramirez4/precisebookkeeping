import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import SimpleLayout from '../components/SimpleLayout';
import OnboardingStep1 from '../components/onboarding/OnboardingStep1';
import OnboardingStep2 from '../components/onboarding/OnboardingStep2';
import OnboardingStep3 from '../components/onboarding/OnboardingStep3';
import OnboardingStep4 from '../components/onboarding/OnboardingStep4';
import OnboardingStepPayment from '../components/onboarding/OnboardingStepPayment';
import OnboardingStep5 from '../components/onboarding/OnboardingStep5';
import OnboardingComplete from '../components/onboarding/OnboardingComplete';

export default function Onboarding() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/simple-login');
      return;
    }

    fetchOnboardingStatus();
  }, [isAuthenticated, router]);

  const fetchOnboardingStatus = async () => {
    try {
      // For now, just set a default status since API is not available
      setOnboardingStatus({
        status: 'not_started',
        step: 1,
        totalSteps: 6,
        progress: 0
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = (stepData) => {
    setCurrentStep(prev => prev + 1);
    fetchOnboardingStatus(); // Refresh status
  };

  const handleOnboardingComplete = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <SimpleLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </SimpleLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // If onboarding is completed, redirect to dashboard
  if (onboardingStatus?.status === 'completed') {
    return <OnboardingComplete onComplete={handleOnboardingComplete} />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingStep1 onComplete={handleStepComplete} />;
      case 2:
        return <OnboardingStep2 onComplete={handleStepComplete} />;
      case 3:
        return <OnboardingStep3 onComplete={handleStepComplete} />;
      case 4:
        return <OnboardingStep4 onComplete={handleStepComplete} />;
      case 5:
        return <OnboardingStepPayment onComplete={handleStepComplete} />;
      case 6:
        return <OnboardingStep5 onComplete={handleStepComplete} />;
      default:
        return <OnboardingStep1 onComplete={handleStepComplete} />;
    }
  };

  return (
    <SimpleLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to Precision Bookkeeping
              </h1>
              <span className="text-sm text-gray-500">
                Step {currentStep} of {onboardingStatus?.totalSteps || 6}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / (onboardingStatus?.totalSteps || 6)) * 100}%` }}
              ></div>
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              {onboardingStatus?.progress || 0}% Complete
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {renderStep()}
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
}