import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import api from '../services/api'
import BankConnection from './BankConnection'
import Transactions from './Transactions'
import TransactionCategorizer from './TransactionCategorizer'
import AdminDashboard from './AdminDashboard'
import ClientDashboard from './ClientDashboard'
import { useAuth } from '../contexts/AuthContext'

export default function SimpleDashboard() {
  const { user } = useAuth()

  console.log('SimpleDashboard - User data:', user)
  console.log('SimpleDashboard - User role:', user?.role)

  // Role-based rendering
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