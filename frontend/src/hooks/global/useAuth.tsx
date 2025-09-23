import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, LoginData, RegisterData } from '../../@types/auth'
import { authApi } from '../../api/auth'

interface AuthContextType {
  user: User | null
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (data: LoginData) => {
    try {
      const response = await authApi.login(data)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setUser(response.user)
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      setUser(response.user)
    } catch (error) {
      console.error('Erro no registro:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}