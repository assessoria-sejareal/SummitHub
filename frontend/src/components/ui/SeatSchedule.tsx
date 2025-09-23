import { motion } from 'framer-motion'
import { Clock, User } from 'lucide-react'

interface SeatScheduleProps {
  seatNumber: number
  bookings: Array<{
    startTime: string
    endTime: string
    user: { name: string }
  }>
  selectedDate: string
}

export const SeatSchedule = ({ seatNumber, bookings, selectedDate }: SeatScheduleProps) => {
  // Generate time slots from 8:00 to 18:00
  const timeSlots = []
  for (let hour = 8; hour < 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
  }

  const isTimeOccupied = (time: string) => {
    return bookings.some(booking => {
      const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1])
      const startMinutes = parseInt(booking.startTime.split(':')[0]) * 60 + parseInt(booking.startTime.split(':')[1])
      const endMinutes = parseInt(booking.endTime.split(':')[0]) * 60 + parseInt(booking.endTime.split(':')[1])
      return timeMinutes >= startMinutes && timeMinutes < endMinutes
    })
  }

  const getBookingAtTime = (time: string) => {
    return bookings.find(booking => {
      const timeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1])
      const startMinutes = parseInt(booking.startTime.split(':')[0]) * 60 + parseInt(booking.startTime.split(':')[1])
      const endMinutes = parseInt(booking.endTime.split(':')[0]) * 60 + parseInt(booking.endTime.split(':')[1])
      return timeMinutes >= startMinutes && timeMinutes < endMinutes
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-4 border"
    >
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-800 font-semibold text-sm">{seatNumber}</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Assento {seatNumber}</h3>
          <p className="text-sm text-gray-600">{new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Horários (08:00 - 18:00)</span>
        </div>
        
        <div className="grid grid-cols-5 gap-1">
          {timeSlots.map((time, index) => {
            const isOccupied = isTimeOccupied(time)
            const booking = getBookingAtTime(time)
            
            return (
              <div
                key={time}
                className={`relative p-2 rounded text-xs text-center transition-colors ${
                  isOccupied 
                    ? 'bg-red-100 text-red-800 border border-red-200' 
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}
                title={isOccupied ? `Ocupado por ${booking?.user.name}` : 'Disponível'}
              >
                <div className="font-medium">{time}</div>
                {isOccupied && booking && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <User className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {bookings.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Reservas do dia:</h4>
            <div className="space-y-2">
              {bookings.map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">{booking.user.name}</span>
                  </div>
                  <div className="text-sm font-medium text-red-700">
                    {booking.startTime} - {booking.endTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bookings.length === 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 text-center">
            <div className="text-green-600 text-sm">
              ✅ Assento disponível o dia todo
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}