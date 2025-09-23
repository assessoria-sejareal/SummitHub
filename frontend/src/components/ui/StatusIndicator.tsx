import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface StatusIndicatorProps {
  lastUpdate: Date
  isLoading: boolean
  onRefresh: () => void
  isOnline?: boolean
}

export const StatusIndicator = ({ 
  lastUpdate, 
  isLoading, 
  onRefresh, 
  isOnline = true 
}: StatusIndicatorProps) => {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow p-3 text-sm">
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className="text-gray-600">
          Última atualização: {format(lastUpdate, 'HH:mm:ss', { locale: ptBR })}
        </span>
      </div>
      
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Atualizar</span>
      </button>
    </div>
  )
}