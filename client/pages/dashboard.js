import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import SimpleLayout from '../components/SimpleLayout'
import SimpleDashboard from '../components/SimpleDashboard'

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    // Give the AuthContext time to load the user from localStorage
    const timer = setTimeout(() => {
      setInitialLoad(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Only redirect to login if we've given enough time for auth to load
    if (!initialLoad && !loading && !isAuthenticated) {
      router.push('/simple-login')
    }
  }, [initialLoad, loading, isAuthenticated, router])

  // Show loading while we're waiting for auth to initialize
  if (initialLoad || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // If not authenticated after loading, show nothing (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <SimpleLayout>
      <SimpleDashboard />
    </SimpleLayout>
  )
}