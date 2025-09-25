import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stationsApi } from '../../api/stations'
import { SeatSchedule } from './SeatSchedule'
import { AccessTime, Person, CheckCircle } from '@mui/icons-material'

interface SeatMapProps {
  stationNumber: number
  onSeatSelect: (seatId: string) => void
  selectedSeat?: string
  stationId: string
  selectedDate: string
  timeRange?: { startTime: string, endTime: string }
  onTimeRangeChange?: (startTime: string, endTime: string) => void
}

interface Seat {
  id: string
  x: number
  y: number
  available: boolean
  bookings?: Array<{
    seatNumber: number
    startTime: string
    endTime: string
    user: { name: string }
  }>
}

// Configurações das estações baseadas nos SVGs reais
const stationConfigs = {
  1: {
    name: 'Estação 1',
    seats: 12,
    viewBox: '0 0 1440 810',
    bgImage: '/assets/stations/station1.svg',
    seatPositions: [
      { x: 361, y: 132 }, // Assento 1
      { x: 583, y: 122 }, // Assento 2
      { x: 798, y: 126 }, // Assento 3
      { x: 1044, y: 126 }, // Assento 4
      { x: 1246, y: 321 }, // Assento 5
      { x: 1220, y: 516 }, // Assento 6
      { x: 1023, y: 684 }, // Assento 7
      { x: 802, y: 678 }, // Assento 8
      { x: 582, y: 680 }, // Assento 9
      { x: 344, y: 681 }, // Assento 10
      { x: 206, y: 520 }, // Assento 11
      { x: 203, y: 316 }, // Assento 12
    ]
  },
  2: {
    name: 'Estação 2',
    seats: 4,
    viewBox: '0 0 1440 810',
    bgImage: '/assets/stations/station2.svg',
    seatPositions: [
      { x: 537, y: 164 }, // Assento 1
      { x: 854, y: 157 }, // Assento 2
      { x: 558, y: 654 }, // Assento 3
      { x: 884, y: 645 }, // Assento 4
    ]
  },
  3: {
    name: 'Estação 3',
    seats: 1,
    viewBox: '0 0 1440 810',
    bgImage: '/assets/stations/station3.svg',
    seatPositions: [
      { x: 716, y: 200 }, // Assento 1
    ]
  },
  4: {
    name: 'Estação 4',
    seats: 1,
    viewBox: '0 0 1440 810',
    bgImage: '/assets/stations/station4.svg',
    seatPositions: [
      { x: 716, y: 200 }, // Assento 1
    ]
  },
  5: {
    name: 'Estação 5',
    seats: 6,
    viewBox: '0 0 1440 810',
    bgImage: '/assets/stations/station5.svg',
    seatPositions: [
      { x: 950, y: 553 }, // Assento 1
      { x: 791, y: 554 }, // Assento 2
      { x: 616, y: 528 }, // Assento 3
      { x: 621, y: 366 }, // Assento 4
      { x: 680, y: 260 }, // Assento 5
      { x: 843, y: 261 }, // Assento 6
    ]
  }

}

// Real seat data will be loaded from API
const stationSeats: Record<number, Seat[]> = {}

export const SeatMap = ({ stationNumber, onSeatSelect, selectedSeat, stationId, selectedDate, timeRange, onTimeRangeChange }: SeatMapProps) => {
  const [hoveredSeat, setHoveredSeat] = useState<string>('')
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const config = stationConfigs[stationNumber as keyof typeof stationConfigs]
  
  useEffect(() => {
    // Only load once when modal opens
    loadSeatAvailability()
  }, [stationId, selectedDate])
  
  const loadSeatAvailability = async (startTime?: string, endTime?: string) => {
    try {
      setLoading(true)
      // Use fallback data directly since API doesn't exist yet
      const fallbackSeats = config?.seatPositions.map((pos, i) => ({
        id: `${stationNumber}-${i + 1}`,
        x: pos.x,
        y: pos.y,
        available: true,
        bookings: []
      })) || []
      setSeats(fallbackSeats)
    } finally {
      setLoading(false)
    }
  }
  
  if (!config) {
    return <div className="text-center p-8 text-gray-500">Estação não encontrada</div>
  }
  
  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando disponibilidade...</p>
      </div>
    )
  }

  const handleSeatClick = (seatId: string, available: boolean) => {
    if (available) {
      onSeatSelect(seatId)
    }
  }

  // Helper function to get next available time
  const getNextAvailableTime = (bookings: any[]) => {
    if (!bookings || bookings.length === 0) return 'Agora'
    
    // Sort bookings by end time
    const sortedBookings = [...bookings].sort((a, b) => a.endTime.localeCompare(b.endTime))
    const lastBooking = sortedBookings[sortedBookings.length - 1]
    
    // If last booking ends before 18:00, show that time
    if (lastBooking.endTime < '18:00') {
      return lastBooking.endTime
    }
    
    return 'Amanhã'
  }

  return (
    <div className="relative">
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border">
        <div className="text-center mb-4 sm:mb-6">
          <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            {config.name}
          </h4>
          <p className="text-sm sm:text-base text-gray-600">
            {seats.filter(s => s.available).length} de {seats.length} assentos disponíveis
          </p>
        </div>
        
        <div className="relative bg-gray-50 rounded-xl p-3 sm:p-4 overflow-hidden mb-4 sm:mb-6">
          <div className="relative w-full" style={{ aspectRatio: '16/10' }}>
            <svg 
              width="100%" 
              height="100%" 
              viewBox={config.viewBox}
              className="border border-gray-200 rounded-xl bg-white touch-manipulation select-none"
            >
              {/* Fundo da planta usando o SVG real */}
              <image 
                href={config.bgImage}
                width="100%" 
                height="100%"
                opacity="0.6"
                preserveAspectRatio="xMidYMid meet"
                className="pointer-events-none"
              />
              
              {/* Overlay para melhor contraste */}
              <rect 
                width="100%" 
                height="100%" 
                fill="rgba(248, 250, 252, 0.3)"
                className="pointer-events-none"
              />
              
              {/* Título da estação */}
              <text 
                x="720" 
                y="80" 
                textAnchor="middle" 
                className="font-bold fill-gray-800 pointer-events-none"
                style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
              >
                {config.name}
              </text>
              
              {/* Assentos posicionados precisamente */}
              {seats.map((seat, index) => {
                const isHovered = hoveredSeat === seat.id
                const isSelected = selectedSeat === seat.id
                
                return (
                  <motion.g
                    key={seat.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.15, duration: 0.4 }}
                    style={{ cursor: seat.available ? 'pointer' : 'not-allowed' }}
                    onMouseEnter={() => setHoveredSeat(seat.id)}
                    onMouseLeave={() => setHoveredSeat('')}
                    onClick={() => handleSeatClick(seat.id, seat.available)}
                  >
                    {/* Sombra do assento */}
                    <motion.circle
                      cx={seat.x + 2}
                      cy={seat.y + 2}
                      r={isHovered ? 32 : 28}
                      fill="rgba(0, 0, 0, 0.2)"
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* Assento principal */}
                    <motion.circle
                      cx={seat.x}
                      cy={seat.y}
                      r={isHovered ? 32 : 28}
                      fill={
                        isSelected 
                          ? '#3b82f6' 
                          : seat.available 
                            ? isHovered 
                              ? '#60a5fa' 
                              : '#10b981'
                            : '#ef4444'
                      }
                      stroke={isSelected ? '#1d4ed8' : isHovered ? '#1f2937' : '#374151'}
                      strokeWidth={isHovered ? 4 : 3}
                      animate={{
                        scale: isHovered ? 1.1 : 1
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* Brilho interno */}
                    <motion.circle
                      cx={seat.x - 8}
                      cy={seat.y - 8}
                      r={isHovered ? 10 : 8}
                      fill="rgba(255, 255, 255, 0.5)"
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* Número do assento */}
                    <text
                      x={seat.x}
                      y={seat.y + 6}
                      textAnchor="middle"
                      className="font-bold fill-white pointer-events-none select-none"
                      style={{ fontSize: 'clamp(16px, 2vw, 22px)' }}
                    >
                      {seat.id.split('-')[1]}
                    </text>
                    
                    {/* X para assentos ocupados */}
                    {!seat.available && (
                      <motion.g
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.15 + 0.3 }}
                      >
                        <line
                          x1={seat.x - 16}
                          y1={seat.y - 16}
                          x2={seat.x + 16}
                          y2={seat.y + 16}
                          stroke="#ffffff"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                        <line
                          x1={seat.x + 16}
                          y1={seat.y - 16}
                          x2={seat.x - 16}
                          y2={seat.y + 16}
                          stroke="#ffffff"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </motion.g>
                    )}
                    

                  </motion.g>
                )
              })}
              
              {/* Indicador de entrada */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <rect
                  x="60"
                  y="750"
                  width="140"
                  height="45"
                  fill="#f3f4f6"
                  stroke="#d1d5db"
                  strokeWidth="2"
                  rx="10"
                />
                <text
                  x="130"
                  y="780"
                  textAnchor="middle"
                  className="fill-gray-600"
                  style={{ fontSize: '18px' }}
                >
                  Entrada
                </text>
              </motion.g>
            </svg>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-4 sm:mb-6 text-sm sm:text-base">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full shadow-md"></div>
            <span className="text-gray-800 font-semibold">Disponível</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full shadow-md"></div>
            <span className="text-gray-800 font-semibold">Selecionado</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full shadow-md"></div>
            <span className="text-gray-800 font-semibold">Ocupado</span>
          </div>
        </div>
        
        {/* Fixed Tooltip Area - Always present to prevent layout shifts */}
        <div className="mt-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-h-[140px] flex items-center justify-center">
          {(hoveredSeat || selectedSeat) ? (
            <div className="text-center w-full">
              <h3 className="text-lg font-bold mb-3 text-gray-900 flex items-center justify-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  {displaySeat.split('-')[1]}
                </span>
                <span>Assento {displaySeat.split('-')[1]}</span>
              </h3>
              
              {(() => {
                const displaySeat = hoveredSeat || selectedSeat
                const seat = seats.find(s => s.id === displaySeat)
                if (seat?.bookings && seat.bookings.length > 0) {
                  const booking = seat.bookings[0]
                  return (
                    <div className="space-y-3">
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                          <AccessTime className="text-red-600" sx={{ fontSize: 18 }} />
                          <p className="text-red-700 font-semibold">
                            Ocupado: {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <Person className="text-red-600" sx={{ fontSize: 16 }} />
                          <p className="text-red-600 text-sm">
                            {booking.user?.name || 'Usuário'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="text-green-600" sx={{ fontSize: 18 }} />
                          <p className="text-green-700 font-semibold">
                            Livre após: {getNextAvailableTime(seat.bookings)}
                          </p>
                        </div>
                        <p className="text-green-600 text-sm mt-1">
                          Disponível para nova reserva
                        </p>
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <CheckCircle className="text-green-600" sx={{ fontSize: 20 }} />
                        <p className="text-green-700 font-semibold text-lg">
                          Livre o dia todo!
                        </p>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <AccessTime className="text-green-600" sx={{ fontSize: 16 }} />
                        <p className="text-green-600 text-sm">
                          Disponível das 08:00 às 18:00
                        </p>
                      </div>
                    </div>
                  )
                }
              })()
              }
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              Passe o mouse sobre um assento para ver detalhes
            </p>
          )}
        </div>
        
        {selectedSeat && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 sm:p-5 bg-blue-50 border-2 border-blue-200 rounded-xl text-center shadow-sm"
          >
            <p className="text-blue-900 font-bold text-lg sm:text-xl">
              Assento {selectedSeat.split('-')[1]} selecionado
            </p>
            <p className="text-blue-700 text-sm sm:text-base mt-2 font-medium">
              Clique em "Confirmar" para finalizar sua reserva
            </p>
          </motion.div>
        )}
        

      </div>
    </div>
  )
}