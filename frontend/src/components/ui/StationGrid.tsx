import { Station, Booking } from '../../@types/bookings'
import { format, isSameDay, parseISO } from 'date-fns'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface StationGridProps {
  stations: Station[]
  bookings: Booking[]
  selectedDate: Date
  selectedStation?: string
  onStationSelect: (stationId: string) => void
}

export const StationGrid = ({ 
  stations, 
  bookings, 
  selectedDate, 
  selectedStation, 
  onStationSelect 
}: StationGridProps) => {
  
  const isStationBooked = (stationId: string, date: Date) => {
    return bookings.some(booking => 
      booking.stationId === stationId && 
      isSameDay(parseISO(booking.date), date) &&
      booking.status === 'ACTIVE'
    )
  }

  const getStationStatus = (station: Station) => {
    if (station.status === 'MAINTENANCE') return 'maintenance'
    if (isStationBooked(station.id, selectedDate)) return 'booked'
    return 'available'
  }

  const getStationClasses = (station: Station) => {
    const status = getStationStatus(station)
    const isSelected = selectedStation === station.id
    
    let classes = 'p-4 rounded-lg border-2 cursor-pointer transition-all text-center '
    
    if (isSelected) {
      classes += 'border-blue-600 bg-blue-50 '
    } else {
      classes += 'border-gray-200 hover:border-gray-300 '
    }
    
    switch (status) {
      case 'available':
        classes += 'bg-green-50 hover:bg-green-100 '
        break
      case 'booked':
        classes += 'bg-red-50 cursor-not-allowed '
        break
      case 'maintenance':
        classes += 'bg-yellow-50 cursor-not-allowed '
        break
    }
    
    return classes
  }

  const getStatusIcon = (station: Station) => {
    const status = getStationStatus(station)
    
    switch (status) {
      case 'available':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'booked':
        return <XCircle className="w-6 h-6 text-red-500" />
      case 'maintenance':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      default:
        return <XCircle className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusText = (station: Station) => {
    const status = getStationStatus(station)
    
    switch (status) {
      case 'available':
        return 'Disponível'
      case 'booked':
        return 'Ocupada'
      case 'maintenance':
        return 'Manutenção'
      default:
        return 'Indisponível'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Estações</h3>
        <span className="text-sm text-gray-600">
          {format(selectedDate, 'dd/MM/yyyy')}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {stations.map(station => (
          <div
            key={station.id}
            className={getStationClasses(station)}
            onClick={() => {
              if (getStationStatus(station) === 'available') {
                onStationSelect(station.id)
              }
            }}
          >
            <div className="mb-1">{getStatusIcon(station)}</div>
            <div className="font-semibold text-sm">Estação {station.number}</div>
            <div className="text-xs text-gray-600 mt-1">
              {getStatusText(station)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center space-x-1">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center space-x-1">
          <XCircle className="w-3 h-3 text-red-500" />
          <span>Ocupada</span>
        </div>
        <div className="flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3 text-yellow-500" />
          <span>Manutenção</span>
        </div>
      </div>
    </div>
  )
}