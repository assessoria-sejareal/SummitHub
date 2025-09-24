import { useAuth } from '../hooks/global/useAuth'
import { Button } from '../components/ui/Button'
import { Link, useLocation } from 'react-router-dom'
import logoSvg from '../assets/images/logo.svg'

export const Header = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img src={logoSvg} alt="Summit Hub" className="h-8 w-8 sm:h-12 sm:w-12" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Summit Hub</h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
              Olá, {user?.name}
            </span>
            
            {user?.role === 'ADMIN' && (
              <Link 
                to={location.pathname === '/admin' ? '/dashboard' : '/admin'}
                className="text-sm px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {location.pathname === '/admin' ? 'Dashboard' : 'Admin'}
              </Link>
            )}
            
            <Button variant="secondary" onClick={logout} className="text-sm px-3 py-1 sm:px-4 sm:py-2">
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}