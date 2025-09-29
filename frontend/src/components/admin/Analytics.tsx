import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useAnalytics } from '../../hooks/admin/useAnalytics'
import { motion } from 'framer-motion'
import { TrendingUp, Activity, Clock, BarChart3 } from 'lucide-react'

export const Analytics = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const {
    stationOccupancy,
    bookingsByPeriod,
    realTimeOccupancy,
    peakHours,
    loading,
    error,
    loadAnalytics,
    refreshRealTime
  } = useAnalytics()

  useEffect(() => {
    loadAnalytics(period)
    const interval = setInterval(refreshRealTime, 420000) // 7 minutes
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadAnalytics(period)
  }, [period])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => loadAnalytics(period)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {realTimeOccupancy && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Ocupação Atual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {realTimeOccupancy.occupancyRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Estações Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {realTimeOccupancy.activeBookings}/{realTimeOccupancy.totalStations}
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Última Atualização</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(realTimeOccupancy.timestamp).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Ocupação por Estação</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stationOccupancy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stationNumber" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} reservas`, 'Reservas']}
                labelFormatter={(label) => `Estação ${label}`}
              />
              <Bar dataKey="bookingCount" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold">Reservas por Período</h3>
            </div>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bookingsByPeriod}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} reservas`, 'Reservas']}
              />
              <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold">Horários de Pico</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHours.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} reservas`, 'Reservas']}
              />
              <Bar dataKey="count" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 mb-3">Top 5 Horários</h4>
            {peakHours.slice(0, 5).map((hour, index) => (
              <div key={hour.hour} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium">{hour.label}</span>
                </div>
                <span className="text-sm text-gray-600">{hour.count} reservas</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}