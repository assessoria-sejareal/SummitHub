import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../hooks/global/useAuth'
import { PrivateRoute } from './PrivateRoute'
import { Login } from '../pages/auth/Login'
import { Register } from '../pages/auth/Register'
import { Dashboard } from '../pages/dashboard/Dashboard'
import { AdminPanel } from '../pages/admin/AdminPanel'

export const AppRoutes = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <AdminPanel />
            </PrivateRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}