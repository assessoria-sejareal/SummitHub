import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Users, Monitor } from 'lucide-react'
import { Station } from '../../@types/bookings'
import { SeatMap } from './SeatMap'

interface StationCatalogProps {
  stations: Station[]
  selectedStation: string
  onStationSelect: (stationId: string) => void
  onSeatSelect?: (stationId: string, seatId: string) => void
  compact?: boolean
  showStatus?: boolean
  onBookingConfirm?: (bookingData: any) => void
  onModalStateChange?: (isOpen: boolean) => void
}

interface StationDetails {
  id: string
  name: string
  description: string
  image: string
  capacity: number
  features: string[]
  seatMap?: string // SVG path for seat map
}

const stationDetails: Record<number, StationDetails> = {
  1: {
    id: '1',
    name: 'Estação 1',
    description: 'Área VIP com vista panorâmica e equipamentos de última geração',
    image: '/assets/images/1a81ac74-b607-401e-bfe7-da5d93aec2f7.jpeg',
    capacity: 12,
    features: ['Vista panorâmica', '4 monitores 4K', 'Mesa ergonômica', 'Ar condicionado'],
    seatMap: 'station1-map.svg'
  },
  2: {
    id: '2', 
    name: 'Estação 2',
    description: 'Ambiente executivo com privacidade e conforto',
    image: '/assets/images/6f9111be-41ea-44c5-8391-74800f6162b9.jpeg',
    capacity: 4,
    features: ['Ambiente privativo', '3 monitores', 'Cadeira premium', 'Iluminação LED'],
    seatMap: 'station2-map.svg'
  },
  3: {
    id: '3',
    name: 'Estação 3', 
    description: 'Espaço privativo para máximo foco',
    image: '/assets/images/7e8d0ea0-24bf-400d-a577-000f4556671a.jpeg',
    capacity: 1,
    features: ['Espaço privativo', '2 monitores', 'Mesa individual', 'Silêncio total'],
    seatMap: 'station3-map.svg'
  },
  4: {
    id: '4',
    name: 'Estação 4',
    description: 'Ambiente silencioso para máxima concentração',
    image: '/assets/images/dde57a5a-cfca-4f64-8eb3-2736c1a0a36d.jpeg', 
    capacity: 1,
    features: ['Ambiente silencioso', '2 monitores', 'Isolamento acústico', 'Iluminação focada'],
    seatMap: 'station4-map.svg'
  },
  5: {
    id: '5',
    name: 'Estação 5',
    description: 'Espaço flexível adaptável às suas necessidades',
    image: '/assets/images/c2fef9f8-9a98-40bb-8e9a-4a2f27e6d205.jpeg',
    capacity: 6, 
    features: ['Layout flexível', 'Monitores móveis', 'Mesa ajustável', 'Configuração personalizada'],
    seatMap: 'station5-map.svg'
  }
}

export const StationCatalog = ({ stations, selectedStation, onStationSelect, onSeatSelect, compact = false, showStatus = false, onBookingConfirm, onModalStateChange }: StationCatalogProps) => {
  const [selectedStationDetails, setSelectedStationDetails] = useState<StationDetails | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<string>('')
  const [bookingData, setBookingData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: ''
  })
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStationClick = (station: Station) => {
    const details = stationDetails[station.number]
    if (details) {
      setSelectedStationDetails(details)
      onStationSelect(station.id)
      onModalStateChange?.(true)
    }
  }

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(seatId)
    if (onSeatSelect && selectedStation) {
      onSeatSelect(selectedStation, seatId)
    }
  }

  return (
    <div className="space-y-4">
      {/* Station Grid */}
      <div className={compact ? "" : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"}>
        {stations.map((station) => {
          const details = stationDetails[station.number]
          if (!details) return null

          return (
            <motion.div
              key={station.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer border-2 transition-all ${
                selectedStation === station.id 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ y: -2 }}
              onClick={() => handleStationClick(station)}
            >
              <div className="aspect-video bg-gray-200 relative">
                <img 
                  src={details.image} 
                  alt={details.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                  #{station.number}
                </div>
              </div>
              
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg sm:text-xl text-gray-900">{details.name}</h3>
                  {showStatus && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      station.status !== 'ACTIVE' ? 'bg-red-100 text-red-800' :
                      (station as any).isAvailableNow ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        station.status !== 'ACTIVE' ? 'bg-red-500' :
                        (station as any).isAvailableNow ? 'bg-green-500' : 'bg-orange-500'
                      }`} />
                      <span>
                        {station.status !== 'ACTIVE' ? 'Manutenção' :
                         (station as any).isAvailableNow ? 'Disponível' : 
                         (station as any).occupiedUntil ? `Até ${(station as any).occupiedUntil}` : 'Ocupada'}
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-2 leading-relaxed">{details.description}</p>
                
                {showStatus && (station as any).nextAvailable && (station as any).nextAvailable !== 'Disponível' && (
                  <div className="mb-3 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    {(station as any).nextAvailable === 'Agora' ? 'Disponível agora' : `Próximo: ${(station as any).nextAvailable}`}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm sm:text-base text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    <span className="font-medium">{details.capacity} assentos</span>
                    {showStatus && (station as any).averageUsage && (
                      <span className="text-xs text-gray-400">• {(station as any).averageUsage}h médio</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-blue-600">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium">Ver mapa</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Station Details Modal */}
      <AnimatePresence>
        {selectedStationDetails && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (!isSubmitting) {
                setSelectedStationDetails(null)
                onModalStateChange?.(false)
              }
            }}
          >
            <motion.div
              className="bg-white rounded-xl max-w-7xl w-full max-h-[96vh] overflow-y-auto shadow-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 pr-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{selectedStationDetails.name}</h2>
                    <p className="text-base sm:text-lg text-gray-600 mt-2 leading-relaxed">{selectedStationDetails.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isSubmitting) {
                        setSelectedStationDetails(null)
                        onModalStateChange?.(false)
                      }
                    }}
                    disabled={isSubmitting}
                    className={`p-3 rounded-full flex-shrink-0 transition-colors ${
                      isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'
                    }`}
                  >
                    <X className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                  {/* Interactive Seat Map */}
                  <div className="order-1">
                    <h3 className="font-bold mb-4 text-lg sm:text-xl text-gray-900">Selecione seu assento:</h3>
                    <SeatMap
                      stationNumber={parseInt(selectedStationDetails.id)}
                      stationId={selectedStation}
                      selectedDate={bookingData.date}
                      selectedSeat={selectedSeat}
                      onSeatSelect={(seatId) => {
                        setSelectedSeat(seatId)
                        if (onSeatSelect && selectedStation) {
                          onSeatSelect(selectedStation, seatId)
                        }
                      }}
                    />
                  </div>
                  
                  {/* Station Image */}
                  <div className="order-2">
                    <img 
                      src={selectedStationDetails.image}
                      alt={selectedStationDetails.name}
                      className="w-full h-56 sm:h-72 object-cover rounded-xl shadow-lg"
                      loading="lazy"
                    />
                    
                    <div className="mt-4 sm:mt-6">
                      <h3 className="font-bold mb-3 text-lg sm:text-xl text-gray-900">Características:</h3>
                      <ul className="space-y-3">
                        {selectedStationDetails.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-3 text-sm sm:text-base">
                            <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                {selectedSeat && (
                  <div className="mt-6 sm:mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-lg text-blue-900 mb-4">
                      Reservar Assento {selectedSeat.split('-')[1]} - {selectedStationDetails.name}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <input
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="time"
                            min="08:00"
                            max="18:00"
                            value={bookingData.startTime}
                            onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                            placeholder="Início"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="time"
                            min="08:00"
                            max="18:00"
                            value={bookingData.endTime}
                            onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                            placeholder="Fim"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Horário de funcionamento: 08:00 às 18:00
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      if (!isSubmitting) {
                        setSelectedStationDetails(null)
                        setSelectedSeat('')
                        onModalStateChange?.(false)
                      }
                    }}
                    disabled={isSubmitting}
                    className={`px-6 py-3 rounded-lg text-base sm:text-lg font-medium transition-colors order-2 sm:order-1 min-h-[48px] ${
                      isSubmitting ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      if (selectedSeat && bookingData.startTime && bookingData.endTime && onBookingConfirm && !isSubmitting) {
                        setIsSubmitting(true)
                        setLoading(true)
                        try {
                          await onBookingConfirm({
                            stationId: selectedStation,
                            seat: selectedSeat,
                            date: bookingData.date,
                            startTime: bookingData.startTime,
                            endTime: bookingData.endTime
                          })
                          // Only close modal and reset if successful
                          setSelectedStationDetails(null)
                          setSelectedSeat('')
                          setBookingData({
                            date: new Date().toISOString().split('T')[0],
                            startTime: '',
                            endTime: ''
                          })
                          onModalStateChange?.(false)
                        } catch (error) {
                          console.error('Erro ao confirmar reserva:', error)
                          // Keep modal open on error so user can retry
                        } finally {
                          setLoading(false)
                          setIsSubmitting(false)
                        }
                      }
                    }}
                    disabled={!selectedSeat || !bookingData.startTime || !bookingData.endTime || loading || isSubmitting}
                    className={`px-6 sm:px-8 py-3 rounded-lg transition-colors text-base sm:text-lg font-semibold order-1 sm:order-2 min-h-[48px] ${
                      selectedSeat && bookingData.startTime && bookingData.endTime && !loading
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Processando...' : 
                     loading ? 'Confirmando...' : 
                     selectedSeat && bookingData.startTime && bookingData.endTime ? 'Confirmar Reserva' : 
                     !selectedSeat ? 'Selecione um Assento' : 'Preencha os horários'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}