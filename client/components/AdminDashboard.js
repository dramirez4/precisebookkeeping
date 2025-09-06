import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../services/api'

export default function AdminDashboard() {
  const [selectedClient, setSelectedClient] = useState(null)
  const [activeTab, setActiveTab] = useState('clients')
  const [onboardingData, setOnboardingData] = useState({})
  const queryClient = useQueryClient()

  // Fetch all clients
  const { data: clientsData, isLoading: clientsLoading } = useQuery(
    'clients',
    () => api.get('/clients').then(res => res.data),
    { enabled: true }
  )
  
  const clients = clientsData?.clients || []

  // Fetch transactions for selected client
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery(
    ['transactions', selectedClient?.id],
    () => api.get(`/transactions?clientId=${selectedClient.id}`).then(res => res.data),
    { enabled: !!selectedClient }
  )
  
  const transactions = transactionsData?.transactions || []

  // Auto-categorize all transactions for selected client
  const autoCategorizeMutation = useMutation(
    () => api.post('/categorization/auto-categorize-all', { clientId: selectedClient.id }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['transactions', selectedClient?.id])
        alert('Auto-categorization completed!')
      },
      onError: (error) => {
        alert(`Error: ${error.response?.data?.error || 'Auto-categorization failed'}`)
      }
    }
  )

  // Get categorization stats
  const { data: categorizationStatsData } = useQuery(
    ['categorization-stats', selectedClient?.id],
    () => api.get(`/categorization/stats?clientId=${selectedClient.id}`).then(res => res.data),
    { enabled: !!selectedClient }
  )
  
  const categorizationStats = categorizationStatsData?.stats || {}

  // Collect onboarding data from localStorage for demo purposes
  useEffect(() => {
    const collectOnboardingData = () => {
      const data = {}
      clients.forEach(client => {
        // Check if client has completed onboarding
        const isCompleted = localStorage.getItem(`onboarding_completed_${client.id}`) === 'true'
        
        // Collect step data from localStorage (in a real app, this would come from the backend)
        const step1Data = localStorage.getItem(`onboarding_step1_${client.id}`)
        const step2Data = localStorage.getItem(`onboarding_step2_${client.id}`)
        const step3Data = localStorage.getItem(`onboarding_step3_${client.id}`)
        const step4Data = localStorage.getItem(`onboarding_step4_${client.id}`)
        const paymentData = localStorage.getItem(`onboarding_payment_${client.id}`)
        const step5Data = localStorage.getItem(`onboarding_step5_${client.id}`)
        
        // Also check for the actual client ID that completed onboarding
        if (client.email === 'client@example.com') {
          const actualClientId = 'fee7a89f-d431-4aa0-bf65-3c45046f2515';
          const actualStep1Data = localStorage.getItem(`onboarding_step1_${actualClientId}`);
          const actualStep2Data = localStorage.getItem(`onboarding_step2_${actualClientId}`);
          const actualStep3Data = localStorage.getItem(`onboarding_step3_${actualClientId}`);
          const actualStep4Data = localStorage.getItem(`onboarding_step4_${actualClientId}`);
          const actualPaymentData = localStorage.getItem(`onboarding_payment_${actualClientId}`);
          const actualStep5Data = localStorage.getItem(`onboarding_step5_${actualClientId}`);
          const actualCompletion = localStorage.getItem(`onboarding_completed_${actualClientId}`);
          
          // Use the actual client ID data if it exists
          if (actualStep1Data || actualStep2Data || actualStep3Data || actualStep4Data || actualPaymentData || actualStep5Data) {
            data[client.id] = {
              completed: actualCompletion === 'true',
              step1: actualStep1Data ? JSON.parse(actualStep1Data) : null,
              step2: actualStep2Data ? JSON.parse(actualStep2Data) : null,
              step3: actualStep3Data ? JSON.parse(actualStep3Data) : null,
              step4: actualStep4Data ? JSON.parse(actualStep4Data) : null,
              payment: actualPaymentData ? JSON.parse(actualPaymentData) : null,
              step5: actualStep5Data ? JSON.parse(actualStep5Data) : null
            };
            return; // Skip the normal data assignment
          }
        }
        
        data[client.id] = {
          completed: isCompleted,
          step1: step1Data ? JSON.parse(step1Data) : null,
          step2: step2Data ? JSON.parse(step2Data) : null,
          step3: step3Data ? JSON.parse(step3Data) : null,
          step4: step4Data ? JSON.parse(step4Data) : null,
          payment: paymentData ? JSON.parse(paymentData) : null,
          step5: step5Data ? JSON.parse(step5Data) : null
        }
      })
      setOnboardingData(data)
    }
    
    if (clients.length > 0) {
      collectOnboardingData()
    }
  }, [clients])

  const handleAutoCategorize = () => {
    if (selectedClient && window.confirm(`Auto-categorize all transactions for ${selectedClient.businessName}?`)) {
      autoCategorizeMutation.mutate()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage all clients and their bookkeeping</p>
          </div>
          <div className="text-sm text-gray-500">
            {clients?.length || 0} clients total
          </div>
        </div>
      </div>

      {/* Client Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Client</h2>
        {clientsLoading ? (
          <div className="text-gray-500">Loading clients...</div>
        ) : (
          <select
            value={selectedClient?.id || ''}
            onChange={(e) => {
              const client = clients.find(c => c.id === e.target.value)
              setSelectedClient(client)
            }}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a client...</option>
            {clients?.map(client => (
              <option key={client.id} value={client.id}>
                {client.businessName} ({client.contactName})
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedClient && (
        <>
          {/* Client Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedClient.businessName}
              </h2>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                selectedClient.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : selectedClient.status === 'prospect'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedClient.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Contact:</span>
                <p className="text-gray-900">{selectedClient.contactName}</p>
                <p className="text-gray-600">{selectedClient.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Service Tier:</span>
                <p className="text-gray-900 capitalize">{selectedClient.serviceTier}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Monthly Revenue:</span>
                <p className="text-gray-900">
                  {selectedClient.monthlyRevenue 
                    ? `$${parseFloat(selectedClient.monthlyRevenue).toLocaleString()}`
                    : 'Not specified'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('categorization')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categorization'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Categorization
              </button>
              <button
                onClick={() => setActiveTab('banking')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'banking'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Banking
              </button>
              <button
                onClick={() => setActiveTab('onboarding')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'onboarding'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Onboarding
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Overview</h3>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {transactions?.length || 0}
                  </div>
                  <div className="text-sm text-blue-800">Total Transactions</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {categorizationStats?.categorizedCount || 0}
                  </div>
                  <div className="text-sm text-green-800">Categorized</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {categorizationStats?.uncategorizedCount || 0}
                  </div>
                  <div className="text-sm text-yellow-800">Uncategorized</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {categorizationStats?.accuracyPercentage || 0}%
                  </div>
                  <div className="text-sm text-purple-800">Accuracy</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAutoCategorize}
                    disabled={autoCategorizeMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {autoCategorizeMutation.isLoading ? 'Processing...' : 'Auto-Categorize All'}
                  </button>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    View All Transactions
                  </button>
                  <button
                    onClick={() => setActiveTab('categorization')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Manage Categorization
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Transactions</h3>
              {transactionsLoading ? (
                <div className="text-gray-500">Loading transactions...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions?.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.name}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.custom_category || transaction.category || 'Uncategorized'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.custom_category || transaction.category
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {transaction.custom_category || transaction.category ? 'Categorized' : 'Uncategorized'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categorization' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Categorization</h3>
              <p className="text-gray-600 mb-4">
                Manage transaction categorization for {selectedClient.businessName}
              </p>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAutoCategorize}
                  disabled={autoCategorizeMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {autoCategorizeMutation.isLoading ? 'Processing...' : 'Auto-Categorize All'}
                </button>
              </div>
              
              {/* Categorization Stats */}
              {categorizationStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {categorizationStats.categorizedCount}
                    </div>
                    <div className="text-sm text-green-800">Categorized</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {categorizationStats.uncategorizedCount}
                    </div>
                    <div className="text-sm text-yellow-800">Uncategorized</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {categorizationStats.accuracyPercentage}%
                    </div>
                    <div className="text-sm text-blue-800">Accuracy</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'banking' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking & Accounts</h3>
              <p className="text-gray-600 mb-4">
                Manage bank connections and account information for {selectedClient.businessName}
              </p>
              <div className="text-center py-8 text-gray-500">
                Banking management interface will be implemented here
              </div>
            </div>
          )}

          {activeTab === 'onboarding' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Information</h3>
              <p className="text-gray-600 mb-4">
                View onboarding data for {selectedClient.businessName}
              </p>
              
              {onboardingData[selectedClient.id] ? (
                <div className="space-y-6">
                  {/* Onboarding Status */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      onboardingData[selectedClient.id].completed 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {onboardingData[selectedClient.id].completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  {/* Step 1: Business Information */}
                  {onboardingData[selectedClient.id].step1 && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Step 1: Business Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Business Name:</span>
                          <p className="text-gray-900">{onboardingData[selectedClient.id].step1.businessName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Business Type:</span>
                          <p className="text-gray-900">{onboardingData[selectedClient.id].step1.businessType}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Industry:</span>
                          <p className="text-gray-900">{onboardingData[selectedClient.id].step1.industry}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Phone:</span>
                          <p className="text-gray-900">{onboardingData[selectedClient.id].step1.businessPhone}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700">Address:</span>
                          <p className="text-gray-900">{onboardingData[selectedClient.id].step1.businessAddress}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Business Details & Plan */}
                  {onboardingData[selectedClient.id].step2 && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Step 2: Business Details & Plan</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Monthly Revenue:</span>
                          <p className="text-gray-900">${onboardingData[selectedClient.id].step2.expectedMonthlyRevenue}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Employees:</span>
                          <p className="text-gray-900">{onboardingData[selectedClient.id].step2.numberOfEmployees}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Current System:</span>
                          <p className="text-gray-900">{onboardingData[selectedClient.id].step2.currentBookkeepingSystem}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Selected Plan:</span>
                          <p className="text-gray-900 font-semibold text-blue-600">
                            {onboardingData[selectedClient.id].step2.subscriptionPlan?.toUpperCase() || 'Not Selected'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Bank Account Information */}
                  {onboardingData[selectedClient.id].step4 && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Step 4: Bank Account Information</h4>
                      {onboardingData[selectedClient.id].step4.bankAccounts?.map((account, index) => (
                        <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Bank:</span>
                              <p className="text-gray-900">{account.bankName}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Account Type:</span>
                              <p className="text-gray-900">{account.accountType}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Account Number:</span>
                              <p className="text-gray-900">****{account.accountNumber}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Routing Number:</span>
                              <p className="text-gray-900">{account.routingNumber}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payment Information */}
                  {onboardingData[selectedClient.id].payment && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Payment Method:</span>
                          <p className="text-gray-900 capitalize">
                            {onboardingData[selectedClient.id].payment.paymentMethod?.replace('_', ' ')}
                          </p>
                        </div>
                        
                        {onboardingData[selectedClient.id].payment.paymentMethod === 'credit_card' && (
                          <>
                            <div>
                              <span className="font-medium text-gray-700">Card Number:</span>
                              <p className="text-gray-900">**** **** **** {onboardingData[selectedClient.id].payment.cardNumber?.slice(-4)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Expiry:</span>
                              <p className="text-gray-900">{onboardingData[selectedClient.id].payment.expiryDate}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Cardholder:</span>
                              <p className="text-gray-900">{onboardingData[selectedClient.id].payment.cardholderName}</p>
                            </div>
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">Billing Address:</span>
                              <p className="text-gray-900">
                                {onboardingData[selectedClient.id].payment.billingAddress}, {onboardingData[selectedClient.id].payment.billingCity}, {onboardingData[selectedClient.id].payment.billingState} {onboardingData[selectedClient.id].payment.billingZip}
                              </p>
                            </div>
                          </>
                        )}
                        
                        {onboardingData[selectedClient.id].payment.paymentMethod === 'ach' && (
                          <>
                            <div>
                              <span className="font-medium text-gray-700">Account Holder:</span>
                              <p className="text-gray-900">{onboardingData[selectedClient.id].payment.bankAccountHolderName}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Account Number:</span>
                              <p className="text-gray-900">****{onboardingData[selectedClient.id].payment.bankAccountNumber?.slice(-4)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Routing Number:</span>
                              <p className="text-gray-900">{onboardingData[selectedClient.id].payment.bankRoutingNumber}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Account Type:</span>
                              <p className="text-gray-900 capitalize">{onboardingData[selectedClient.id].payment.bankAccountType}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No onboarding data available for this client
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!selectedClient && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No client selected</h3>
            <p className="mt-1 text-sm text-gray-500">Choose a client from the dropdown above to manage their bookkeeping.</p>
          </div>
        </div>
      )}
    </div>
  )
}