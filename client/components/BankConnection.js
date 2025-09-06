import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BankConnection = ({ clientId, onAccountConnected }) => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [linkToken, setLinkToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load existing accounts
  useEffect(() => {
    if (clientId) {
      loadAccounts();
    }
  }, [clientId]);

  const loadAccounts = async () => {
    try {
      const response = await fetch(`/api/plaid/accounts/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const createLinkToken = async () => {
    try {
      const response = await fetch('/api/plaid/link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ clientId })
      });

      const data = await response.json();
      if (data.success) {
        setLinkToken(data.link_token);
        return data.link_token;
      } else {
        setError(data.error);
        return null;
      }
    } catch (error) {
      setError('Failed to create link token');
      return null;
    }
  };

  const handleConnectBank = async () => {
    setIsConnecting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await createLinkToken();
      if (!token) return;

      // Initialize Plaid Link
      const handler = window.Plaid.create({
        token: token,
        onSuccess: async (publicToken, metadata) => {
          try {
            const response = await fetch('/api/plaid/exchange-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                publicToken,
                clientId,
                institutionId: metadata.institution.institution_id,
                institutionName: metadata.institution.name
              })
            });

            const data = await response.json();
            if (data.success) {
              setSuccess('Bank account connected successfully!');
              setAccounts(prev => [...prev, ...data.accounts]);
              if (onAccountConnected) {
                onAccountConnected(data.accounts);
              }
            } else {
              setError(data.error);
            }
          } catch (error) {
            setError('Failed to connect bank account');
          } finally {
            setIsConnecting(false);
          }
        },
        onExit: (err, metadata) => {
          setIsConnecting(false);
          if (err) {
            setError('Connection cancelled or failed');
          }
        },
        onEvent: (eventName, metadata) => {
          console.log('Plaid event:', eventName, metadata);
        }
      });

      handler.open();
    } catch (error) {
      setError('Failed to initialize bank connection');
      setIsConnecting(false);
    }
  };

  const handleSyncTransactions = async (accountId) => {
    try {
      const response = await fetch(`/api/plaid/sync/${accountId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Synced ${data.synced_count} transactions`);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to sync transactions');
    }
  };

  const handleDisconnectAccount = async (accountId) => {
    if (!confirm('Are you sure you want to disconnect this bank account?')) {
      return;
    }

    try {
      const response = await fetch(`/api/plaid/accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Bank account disconnected successfully');
        setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to disconnect bank account');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bank Connections</h2>
        <button
          onClick={handleConnectBank}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {isConnecting ? 'Connecting...' : '+ Connect Bank Account'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bank accounts connected</h3>
          <p className="text-gray-500 mb-4">Connect your bank account to automatically import transactions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{account.institution_name}</h3>
                    <p className="text-sm text-gray-500">
                      {account.account_name} ••••{account.mask}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {account.account_type} • {account.account_subtype}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    account.sync_status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : account.sync_status === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {account.sync_status}
                  </span>
                  <button
                    onClick={() => handleSyncTransactions(account.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Sync
                  </button>
                  <button
                    onClick={() => handleDisconnectAccount(account.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
              {account.last_sync && (
                <p className="text-xs text-gray-400 mt-2">
                  Last synced: {new Date(account.last_sync).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Plaid Link Script */}
      <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
    </div>
  );
};

export default BankConnection;