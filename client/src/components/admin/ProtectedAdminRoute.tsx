import { Navigate } from 'react-router-dom'
import { useAdmin } from '@/context/AdminContext'
import { Loader2 } from 'lucide-react'

interface ProtectedAdminRouteProps {
  children: React.ReactNode
}

function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { isAuthenticated, isLoading } = useAdmin()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-dark to-blue-deep flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-gold animate-spin mx-auto mb-4" />
          <p className="text-papyrus font-lato text-lg">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

export default ProtectedAdminRoute
