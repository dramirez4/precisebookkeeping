import { useState, useEffect } from 'react';

const Transactions = ({ clientId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    startDate: '',
    endDate: '',
    accountId: ''
  });

  useEffect(() => {
    if (clientId) {
      loadTransactions();
    }
  }, [clientId, filters]);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/plaid/transactions/${clientId}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
        setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing other filters
    }));
  };

  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  const getCategoryColor = (category) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    const categoryName = Array.isArray(category) ? category[0] : category;
    const colors = {
      'Food and Drink': 'bg-green-100 text-green-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Shopping': 'bg-yellow-100 text-yellow-800',
      'Travel': 'bg-indigo-100 text-indigo-800',
      'Business': 'bg-gray-100 text-gray-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    
    return colors[categoryName] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionIcon = (category) => {
    if (!category) return '💳';
    
    const categoryName = Array.isArray(category) ? category[0] : category;
    const icons = {
      'Food and Drink': '🍽️',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Shopping': '🛍️',
      'Travel': '✈️',
      'Business': '💼',
      'Other': '💳'
    };
    
    return icons[categoryName] || '💳';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="End Date"
          />
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-500">Connect a bank account to start importing transactions</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {getTransactionIcon(transaction.category)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.name}
                          </div>
                          {transaction.merchant_name && (
                            <div className="text-sm text-gray-500">
                              {transaction.merchant_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.bankAccount?.institution_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.bankAccount?.account_name} ••••{transaction.bankAccount?.mask}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.category && (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(transaction.category)}`}>
                          {Array.isArray(transaction.category) ? transaction.category[0] : transaction.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className={parseFloat(transaction.amount) < 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatAmount(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFilterChange('page', pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handleFilterChange('page', pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Transactions;