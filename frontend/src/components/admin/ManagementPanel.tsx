import { useState, useEffect } from 'react'
import { adminApi, AdminAction } from '../../api/admin'
import { bookingsApi } from '../../api/bookings'
import { stationsApi } from '../../api/stations'
import { Booking } from '../../@types/bookings'
import { Station } from '../../@types/stations'
import { formatDate, formatTime } from '../../utils/date'
import { cpfMask } from '../../utils/masks'
import { motion } from 'framer-motion'
import { Ban, CheckCircle, Download, History, Settings, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { useToast } from '../../hooks/global/useToast'

export const ManagementPanel = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [adminActions, setAdminActions] = useState<AdminAction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'bookings' | 'stations' | 'history'>('bookings')
  const { success, error } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [bookingsData, stationsData, actionsData] = await Promise.all([
        bookingsApi.listAll(),
        stationsApi.list(),
        adminApi.getAdminActions()
      ])
      
      setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || [])
      setStations(stationsData)
      setAdminActions(actionsData.actions)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (id: string, reason: string) => {
    try {
      await adminApi.cancelBooking(id, reason)
      await loadData()
      success('Reserva Cancelada', 'Reserva cancelada com sucesso pelo administrador')
    } catch (err: any) {
      error('Erro', err.response?.data?.message || 'Erro ao cancelar reserva')
    }
  }

  const handleStationStatus = async (id: string, status: 'ACTIVE' | 'MAINTENANCE', reason: string) => {
    try {
      await adminApi.updateStationStatus(id, status, reason)
      await loadData()
      success(
        'Status Alterado', 
        `Estação ${status === 'ACTIVE' ? 'ativada' : 'bloqueada'} com sucesso`
      )
    } catch (err: any) {
      error('Erro', err.response?.data?.message || 'Erro ao alterar status da estação')
    }
  }

  const handleExportReport = async () => {
    try {
      const blob = await adminApi.exportReport('bookings', 'csv')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reservas-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      success('Exportação Concluída', 'Relatório exportado com sucesso')
    } catch (err: any) {
      error('Erro', err.response?.data?.message || 'Erro ao exportar relatório')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'bookings', label: 'Reservas', icon: CheckCircle },
            { key: 'stations', label: 'Estações', icon: Settings },
            { key: 'history', label: 'Histórico', icon: History }
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
        
        <Button
          onClick={handleExportReport}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          <span>Exportar CSV</span>
        </Button>
      </div>

      {activeTab === 'bookings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Gerenciar Reservas</h3>
            <p className="text-sm text-gray-600">Cancelar reservas e gerenciar conflitos</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trader</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.filter(b => b.status === 'ACTIVE').map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.fullName}</div>
                        <div className="text-xs text-gray-500">{cpfMask(booking.cpf)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Estação {booking.station?.number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                        <div className="text-xs text-gray-500">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativa
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          const reason = prompt('Motivo do cancelamento:')
                          if (reason) handleCancelBooking(booking.id, reason)
                        }}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'stations' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Gerenciar Estações</h3>
            <p className="text-sm text-gray-600">Bloquear/desbloquear estações para manutenção</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {stations.map((station) => (
              <div key={station.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Estação {station.number}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    station.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {station.status === 'ACTIVE' ? 'Ativa' : 'Manutenção'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {station.status === 'ACTIVE' ? (
                    <button
                      onClick={() => {
                        const reason = prompt('Motivo do bloqueio:')
                        if (reason) handleStationStatus(station.id, 'MAINTENANCE', reason)
                      }}
                      className="w-full flex items-center justify-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Bloquear
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const reason = prompt('Motivo da ativação:')
                        if (reason) handleStationStatus(station.id, 'ACTIVE', reason)
                      }}
                      className="w-full flex items-center justify-center px-3 py-2 border border-green-300 text-green-700 rounded-md hover:bg-green-50 text-sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Ativar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Histórico de Ações</h3>
            <p className="text-sm text-gray-600">Registro de todas as ações administrativas</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {adminActions.map((action) => (
              <div key={action.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {action.user.name} - {action.action.replace('_', ' ').toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{action.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(action.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}