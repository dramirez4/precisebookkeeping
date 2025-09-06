import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../services/api'

export default function TransactionCategorizer({ clientId, onCategorizationComplete }) {
  const [selectedTransactions, setSelectedTransactions] = useState([])
  const [showStats, setShowStats] = useState(false)
  const queryClient = useQueryClient()

  // Fetch uncategorized transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery(
    ['uncategorized-transactions', clientId],
    () => api.get(`/clients/${clientId}/transactions?category=Uncategorized&limit=50`).then(res => res.data),
    { enabled: !!clientId }
  )

  // Fetch categorization stats
  const { data: statsData } = useQuery(
    ['categorization-stats', clientId],
    () => api.get('/categorization/stats').then(res => res.data),
    { enabled: !!clientId }
  )

  // Fetch available categories
  const { data: categoriesData } = useQuery(
    'categorization-categories',
    () => api.get('/categorization/categories').then(res => res.data)
  )

  // Auto-categorize mutation
  const autoCategorizeMutation = useMutation(
    (data) => api.post('/categorization/auto-categorize-all', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['uncategorized-transactions', clientId])
        queryClient.invalidateQueries(['categorization-stats', clientId])
        if (onCategorizationComplete) onCategorizationComplete()
      }
    }
  )

  // Learn from correction mutation
  const learnMutation = useMutation(
    (data) => api.post('/categorization/learn', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['uncategorized-transactions', clientId])
        queryClient.invalidateQueries(['categorization-stats', clientId])
      }
    }
  )

  const transactions = transactionsData?.transactions || []
  const stats = statsData?.stats
  const categories = categoriesData?.categories

  const handleAutoCategorize = () => {
    autoCategorizeMutation.mutate({ limit: 100 })
  }

  const handleCategoryCorrection = (transactionId, correctCategory, correctSubcategory) => {
    learnMutation.mutate({
      transactionId,
      correctCategory,
      correctSubcategory
    })
  }

  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(transactions.map(t => t.id))
    }
  }

  if (transactionsLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Transaction Categorization</h3>
          <p className="text-sm text-gray-500">
            Automatically categorize transactions to save time and improve accuracy
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
          <button
            onClick={handleAutoCategorize}
            disabled={autoCategorizeMutation.isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {autoCategorizeMutation.isLoading ? 'Processing...' : 'Auto-Categorize All'}
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && stats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Categorization Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-blue-700">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.autoCategorized}</div>
              <div className="text-xs text-green-700">Auto-Categorized</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.reviewed}</div>
              <div className="text-xs text-yellow-700">Manually Reviewed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.uncategorized}</div>
              <div className="text-xs text-red-700">Uncategorized</div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">🎉 All transactions are categorized!</div>
          <p className="text-sm text-gray-400 mt-2">
            Great job! Your transactions are properly organized.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedTransactions.length === transactions.length}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Select All ({transactions.length} transactions)
            </label>
          </div>

          {/* Transaction Items */}
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                categories={categories}
                isSelected={selectedTransactions.includes(transaction.id)}
                onSelect={() => handleSelectTransaction(transaction.id)}
                onCategoryCorrection={handleCategoryCorrection}
              />
            ))}
          </div>
        </div>
      )}

      {/* Auto-categorize Results */}
      {autoCategorizeMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400">✅</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Auto-categorization Complete!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Processed {autoCategorizeMutation.data?.data?.processed} out of{' '}
                  {autoCategorizeMutation.data?.data?.total} transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TransactionItem({ transaction, categories, isSelected, onSelect, onCategoryCorrection }) {
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)
  const [correctCategory, setCorrectCategory] = useState('')
  const [correctSubcategory, setCorrectSubcategory] = useState('')

  const handleSubmitCorrection = () => {
    if (correctCategory) {
      onCategoryCorrection(transaction.id, correctCategory, correctSubcategory)
      setShowCorrectionForm(false)
      setCorrectCategory('')
      setCorrectSubcategory('')
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {transaction.name || transaction.description}
              </span>
              {transaction.merchant_name && (
                <span className="text-xs text-gray-500">• {transaction.merchant_name}</span>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-500">
                {new Date(transaction.date).toLocaleDateString()}
              </span>
              <span className={`text-sm font-medium ${
                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
              </span>
              <span className="text-xs text-gray-400">
                {transaction.category || 'Uncategorized'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCorrectionForm(!showCorrectionForm)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showCorrectionForm ? 'Cancel' : 'Correct'}
          </button>
        </div>
      </div>

      {/* Correction Form */}
      {showCorrectionForm && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={correctCategory}
                onChange={(e) => setCorrectCategory(e.target.value)}
                className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category...</option>
                {categories?.expenses?.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                {categories?.income?.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                value={correctSubcategory}
                onChange={(e) => setCorrectSubcategory(e.target.value)}
                placeholder="Optional subcategory..."
                className="block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end space-x-2">
            <button
              onClick={() => setShowCorrectionForm(false)}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitCorrection}
              disabled={!correctCategory}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Save Correction
            </button>
          </div>
        </div>
      )}
    </div>
  )
}