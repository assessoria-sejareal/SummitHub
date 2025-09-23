import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { formatDate, formatTime } from '../../utils/date'

interface UpcomingBookingsProps {
  bookings: any[]
}

export const UpcomingBookings = ({ bookings }: UpcomingBookingsProps) => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const currentTime = now.toTimeString().slice(0, 5)

  const upcomingBookings = bookings
    .filter(b => {
      const bookingDate = b.date.split('T')[0]
      if (bookingDate > today) return true
      if (bookingDate === today && b.startTime > currentTime) return true
      return false
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date.split('T')[0]}T${a.startTime}`)
      const dateB = new Date(`${b.date.split('T')[0]}T${b.startTime}`)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 3)

  if (upcomingBookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Reservas</h3>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma reserva futura</p>
          <p className="text-sm text-gray-400 mt-1">Suas próximas reservas aparecerão aqui</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Próximas Reservas</h3>
        <span className="text-sm text-gray-500">{upcomingBookings.length} agendada{upcomingBookings.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="space-y-3">
        {upcomingBookings.map((booking, index) => {
          const bookingDateTime = new Date(`${booking.date.split('T')[0]}T${booking.startTime}`)
          const isToday = booking.date.split('T')[0] === today
          const isSoon = isToday && booking.startTime <= addHours(currentTime, 2)
          
          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${
                isSoon ? 'border-l-orange-500 bg-orange-50' : 'border-l-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSoon ? 'bg-orange-100' : 'bg-blue-100'
                  }`}>
                    <MapPin className={`h-4 w-4 ${
                      isSoon ? 'text-orange-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Estação {booking.station?.number}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{isToday ? 'Hoje' : formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {isSoon && (
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Em breve
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {getTimeUntil(bookingDateTime)}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

const addHours = (time: string, hours: number): string => {
  const [h, m] = time.split(':').map(Number)
  const newHour = h + hours
  return `${String(newHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const getTimeUntil = (targetDate: Date): string => {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `em ${hours}h ${minutes}min`
  }
  return `em ${minutes}min`
}