import { motion } from 'framer-motion'
import { Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface StationWithStatus {
  id: string
  number: number
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
  currentBooking?: any
  nextAvailable?: string
  occupiedUntil?: string
  averageUsage?: number
  isAvailableNow?: boolean
}

interface StationStatusCardProps {
  station: StationWithStatus
  onSelect?: (stationId: string) => void
  isSelected?: boolean
}

export const StationStatusCard = ({ station, onSelect, isSelected }: StationStatusCardProps) => {
  const getStatusColor = () => {
    if (station.status !== 'ACTIVE') return 'border-red-200 bg-red-50'
    if (station.isAvailableNow) return 'border-green-200 bg-green-50'
    return 'border-orange-200 bg-orange-50'
  }

  const getStatusIcon = () => {
    if (station.status !== 'ACTIVE') return <XCircle className="h-5 w-5 text-red-600" />
    if (station.isAvailableNow) return <CheckCircle className="h-5 w-5 text-green-600" />
    return <AlertCircle className="h-5 w-5 text-orange-600" />
  }

  const getStatusText = () => {
    if (station.status !== 'ACTIVE') return 'Manutenção'
    if (station.isAvailableNow) return 'Disponível'
    if (station.occupiedUntil) return `Ocupada até ${station.occupiedUntil}`
    return 'Ocupada'
  }

  const getNextAvailableText = () => {
    if (station.status !== 'ACTIVE') return null
    if (station.isAvailableNow) return 'Disponível agora'
    if (station.nextAvailable === 'Agora') return 'Próximo slot: Agora'
    if (station.nextAvailable === 'Disponível') return 'Livre após horário atual'
    return `Próximo slot: ${station.nextAvailable}`
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : getStatusColor()
      }`}
      onClick={() => onSelect?.(station.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-800 font-semibold text-sm">{station.number}</span>
          </div>
          <span className="font-medium text-gray-900">Estação {station.number}</span>
        </div>
        {getStatusIcon()}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            station.isAvailableNow ? 'bg-green-500' : 
            station.status !== 'ACTIVE' ? 'bg-red-500' : 'bg-orange-500'
          }`} />
          <span className="text-sm font-medium text-gray-700">
            {getStatusText()}
          </span>
        </div>

        {getNextAvailableText() && (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">
              {getNextAvailableText()}
            </span>
          </div>
        )}

        {station.averageUsage && station.status === 'ACTIVE' && (
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">
              Uso médio: {station.averageUsage}h por sessão
            </span>
          </div>
        )}
      </div>

      {station.currentBooking && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-600">
              Em uso por {station.currentBooking.fullName?.split(' ')[0] || 'Trader'}
            </span>
          </div>
        </div>
      )}

      {isSelected && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <CheckCircle className="h-4 w-4 text-white" />
        </div>
      )}
    </motion.div>
  )
}