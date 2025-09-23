import { useState, useEffect } from 'react'
import { Header } from '../../templates/Header'
import { ToastContainer } from '../../components/ui/ToastNotification'
import { useToast } from '../../hooks/global/useToast'
import { bookingsApi } from '../../api/bookings'
import { Booking } from '../../@types/bookings'
import { formatDate, formatTime } from '../../utils/date'
import { cpfMask } from '../../utils/masks'
import { motion } from 'framer-motion'
import { BarChart3, Users, Calendar, TrendingUp, Activity, Settings } from 'lucide-react'
import { Analytics } from '../../components/admin/Analytics'
import { ManagementPanel } from '../../components/admin/ManagementPanel'

export const AdminPanel = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'management'>('overview')
  const { toasts, removeToast, error } = useToast()

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const data = await bookingsApi.listAll()
      setBookings(Array.isArray(data) ? data : data.bookings || [])
    } catch (err: any) {
      console.error('Erro ao carregar reservas:', err)
      if (err.response?.status === 403) {
        error('Erro', 'Acesso negado - Faça login como administrador')
      } else {
        error('Erro', 'Não foi possível carregar as reservas')
      }
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.status === 'ACTIVE').length,
    today: bookings.filter(b => {
      const today = new Date().toISOString().split('T')[0]
      return b.date.split('T')[0] === today && b.status === 'ACTIVE'
    }).length,
    uniqueUsers: new Set(bookings.map(b => b.userId)).size
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      return booking.date.split('T')[0] === today && booking.status === 'ACTIVE'
    }
    if (filter === 'active') return booking.status === 'ACTIVE'
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { key: 'analytics', label: 'Analytics', icon: Activity },
              { key: 'management', label: 'Gestão', icon: Settings }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Reservas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Ativas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-lg shadow"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="px-4 sm:px-6 py-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Reservas</h2>
                <p className="text-sm text-gray-600">Gestão completa de todas as reservas do sistema</p>
              </div>
              <div className="mt-3 sm:mt-0">
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Todas as reservas</option>
                  <option value="active">Apenas ativas</option>
                  <option value="today">Hoje</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trader
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estação
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data & Horário
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Nenhuma reserva encontrada
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.fullName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          CPF: {cpfMask(booking.cpf)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 hidden lg:block">
                          {booking.user?.company}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">
                          {booking.user?.email}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.user?.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-800 font-semibold text-sm">
                            {booking.station?.number}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">Estação {booking.station?.number}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(booking.date)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(booking.startTime)} às {formatTime(booking.endTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status === 'ACTIVE' ? 'Ativa' : 'Cancelada'}
                      </span>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {filteredBookings.length > 0 && (
            <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t">
              <p className="text-sm text-gray-600">
                Mostrando {filteredBookings.length} de {bookings.length} reservas
              </p>
            </div>
          )}
        </motion.div>
          </>
        )}

        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'management' && <ManagementPanel />}
      </div>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}