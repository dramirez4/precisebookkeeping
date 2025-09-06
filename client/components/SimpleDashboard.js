import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminDashboard from './AdminDashboard'
import ClientDashboard from './ClientDashboard'
import OnboardingStep1 from './onboarding/OnboardingStep1'
import OnboardingStep2 from './onboarding/OnboardingStep2'
import OnboardingStep3 from './onboarding/OnboardingStep3'
import OnboardingStep4 from './onboarding/OnboardingStep4'
import OnboardingStepPayment from './onboarding/OnboardingStepPayment'
import OnboardingStep5 from './onboarding/OnboardingStep5'
import OnboardingComplete from './onboarding/OnboardingComplete'

export default function SimpleDashboard() {
  const { user } = useAuth()
  const [onboardingStatus, setOnboardingStatus] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  useEffect(() => {
    // Check if user needs onboarding
    if (user && user.role === 'client') {
      // Check localStorage first for immediate response
      const storedOnboardingStatus = localStorage.getItem(`onboarding_completed_${user.id}`);
      
      if (storedOnboardingStatus === 'true') {
        setOnboardingCompleted(true);
        setShowOnboarding(false);
        return;
      }
      
      // For demo purposes, assume new clients need onboarding
      setOnboardingStatus({
        status: 'not_started',
        step: 1,
        totalSteps: 6,
        progress: 0
      })
      setShowOnboarding(true)
    }
  }, [user])

  const handleStepComplete = (stepData) => {
    setCurrentStep(prev => prev + 1)
    setOnboardingStatus(prev => ({
      ...prev,
      step: prev.step + 1,
      progress: Math.round(((prev.step + 1) / prev.totalSteps) * 100)
    }))
  }

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      setOnboardingStatus(prev => ({
        ...prev,
        step: prev.step - 1,
        progress: Math.round(((prev.step - 1) / prev.totalSteps) * 100)
      }))
    }
  }

  const handleOnboardingComplete = () => {
    // Store completion status in localStorage
    if (user && user.id) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    
    setOnboardingCompleted(true);
    setShowOnboarding(false);
    setOnboardingStatus(prev => ({
      ...prev,
      status: 'completed',
      progress: 100
    }))
  }

  // Show loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show onboarding for clients who haven't completed it
  if (showOnboarding && user?.role === 'client') {
    const renderOnboardingStep = () => {
      switch (currentStep) {
        case 1:
          return <OnboardingStep1 onComplete={handleStepComplete} onBack={handleStepBack} />
        case 2:
          return <OnboardingStep2 onComplete={handleStepComplete} onBack={handleStepBack} />
        case 3:
          return <OnboardingStep3 onComplete={handleStepComplete} onBack={handleStepBack} />
        case 4:
          return <OnboardingStep4 onComplete={handleStepComplete} onBack={handleStepBack} />
        case 5:
          return <OnboardingStepPayment onComplete={handleStepComplete} onBack={handleStepBack} />
        case 6:
          return <OnboardingStep5 onComplete={handleOnboardingComplete} onBack={handleStepBack} />
        default:
          return <OnboardingStep1 onComplete={handleStepComplete} onBack={handleStepBack} />
      }
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Onboarding Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome to Precision Bookkeeping!
                </h1>
                <p className="text-gray-600 mt-1">
                  Let's get your account set up in just a few steps.
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  Step {currentStep} of {onboardingStatus?.totalSteps || 6}
                </span>
                <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / (onboardingStatus?.totalSteps || 6)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Onboarding Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {renderOnboardingStep()}
          </div>
        </div>
      </div>
    )
  }

  // Admin/Bookkeeper view - can manage multiple clients
  if (user.role === 'admin' || user.role === 'bookkeeper') {
    return <AdminDashboard />
  }

  // Client view - only sees their own data
  if (user.role === 'client') {
    return <ClientDashboard />
  }

  // Fallback for unknown roles
  return (
    <div className="bg-white shadow rounded-lg p-6 text-center">
      <div className="text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500">Your account role is not recognized. Please contact support.</p>
      </div>
    </div>
  )
}