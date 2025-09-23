import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/global/useAuth'
import { Loading } from '../components/common/Loading'

interface PrivateRouteProps {
  children: ReactNode
  adminOnly?: boolean
}

export const PrivateRoute = ({ children, adminOnly = false }: PrivateRouteProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}