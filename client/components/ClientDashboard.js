import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import api from '../services/api'

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch client's own data
  const { data: client, isLoading: clientLoading } = useQuery(
    'client-profile',
    () => api.get('/clients/profile').then(res => res.data.client),
    { enabled: true }
  )

  // Fetch client's transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery(
    'client-transactions',
    () => api.get('/clients/transactions').then(res => res.data.transactions),
    { enabled: true }
  )

  // Fetch client's bank accounts
  const { data: bankAccounts, isLoading: bankAccountsLoading } = useQuery(
    'client-bank-accounts',
    () => api.get('/clients/bank-accounts').then(res => res.data.bankAccounts),
    { enabled: true }
  )

  // Calculate summary stats
  const totalTransactions = transactions?.length || 0
  const categorizedTransactions = transactions?.filter(t => t.custom_category || t.category).length || 0
  const uncategorizedTransactions = totalTransactions - categorizedTransactions
  const categorizationProgress = totalTransactions > 0 ? Math.round((categorizedTransactions / totalTransactions) * 100) : 0

  // Calculate monthly totals
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyTransactions = transactions?.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
  }) || []

  const monthlyIncome = monthlyTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

  const monthlyNet = monthlyIncome - monthlyExpenses

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-blue-100">
              {clientLoading ? 'Loading...' : `Here's your ${client?.businessName || 'business'} overview`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">Service Status</div>
            <div className="text-lg font-semibold">
              {client?.status === 'active' ? '✅ Active' : '⏳ Processing'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                ${monthlyIncome.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Monthly Income</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                ${monthlyExpenses.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Monthly Expenses</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                ${monthlyNet.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Net Income</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {categorizationProgress}%
              </div>
              <div className="text-sm text-gray-600">Categorized</div>
            </div>
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
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reports
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Transactions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            {transactionsLoading ? (
              <div className="text-gray-500">Loading transactions...</div>
            ) : (
              <div className="space-y-3">
                {transactions?.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        transaction.amount > 0 ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900">{transaction.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()} • 
                          {transaction.custom_category || transaction.category || 'Uncategorized'}
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                    </div>
                  </div>
                ))}
                {transactions?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No transactions found. Connect your bank account to get started.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Categorization Progress */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Organization</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                  <span>Categorization Progress</span>
                  <span>{categorizedTransactions} of {totalTransactions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${categorizationProgress}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {uncategorizedTransactions > 0 
                  ? `${uncategorizedTransactions} transactions need categorization`
                  : 'All transactions are properly categorized!'
                }
              </div>
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
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.custom_category || transaction.category || 'Uncategorized'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No transactions found. Connect your bank account to get started.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'banking' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Accounts</h3>
          {bankAccountsLoading ? (
            <div className="text-gray-500">Loading bank accounts...</div>
          ) : (
            <div className="space-y-4">
              {bankAccounts?.map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{account.account_name}</div>
                      <div className="text-sm text-gray-500">
                        {account.institution_name} • ****{account.mask}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{account.account_type}</div>
                      <div className={`text-xs ${
                        account.sync_status === 'active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {account.sync_status === 'active' ? 'Connected' : 'Disconnected'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {bankAccounts?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No bank accounts connected. Contact your bookkeeper to set up bank connections.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Reports</h3>
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Reports coming soon</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your monthly financial reports will be available here once your bookkeeper processes your transactions.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}