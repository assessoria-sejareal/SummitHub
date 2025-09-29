import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, parseISO } from 'date-fns'
import { Header } from '../../templates/Header'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Calendar } from '../../components/ui/Calendar'
import { StationCatalog } from '../../components/ui/StationCatalog'
import { StationStatusCard } from '../../components/ui/StationStatusCard'
import { QuickStats } from '../../components/ui/QuickStats'
import { UpcomingBookings } from '../../components/ui/UpcomingBookings'
import { StatusIndicator } from '../../components/ui/StatusIndicator'
import { NotificationBanner } from '../../components/ui/NotificationBanner'
import { ToastContainer } from '../../components/ui/ToastNotification'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { CardSkeleton, BookingSkeleton, StationSkeleton, StatsSkeleton } from '../../components/ui/Skeleton'
import { useRealTimeStatus } from '../../hooks/pages/useRealTimeStatus'
import { useConfirm } from '../../hooks/ui/useConfirm'
import { useNotifications } from '../../hooks/global/useNotifications'
import { useBookingReminders } from '../../hooks/pages/useBookingReminders'
import { useToast } from '../../hooks/global/useToast'
import { bookingsApi } from '../../api/bookings'
import { Booking, CreateBookingData } from '../../@types/bookings'
import { createBookingSchema } from '../../validators/booking'
import { formatDate, formatTime } from '../../utils/date'

import { Add, Assignment, CalendarToday, AccessTime, CheckCircle, Close } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

export const Dashboard = () => {
  const [userBookings, setUserBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedStation, setSelectedStation] = useState('')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { bookings, stations, lastUpdate, isLoading, refresh } = useRealTimeStatus(420000, isModalOpen) // 7 minutes
  const { isSupported, permission, requestPermission } = useNotifications()
  const { notifyBookingCreated, notifyBookingCancelled } = useBookingReminders(userBookings)
  const { toasts, removeToast, success, error: showError } = useToast()
  const { confirm, isOpen, options, handleConfirm, handleCancel: handleConfirmCancel } = useConfirm()

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CreateBookingData>({
    resolver: zodResolver(createBookingSchema)
  })
  


  // Set initial date
  useEffect(() => {
    setValue('date', format(selectedDate, 'yyyy-MM-dd'))
  }, [selectedDate, setValue])

  useEffect(() => {
    loadUserBookings()
  }, [])

  const loadUserBookings = async () => {
    try {
      const bookingsData = await bookingsApi.list()
      // Se a API retornar objeto com paginação, extrair o array
      const bookingsArray = Array.isArray(bookingsData) ? bookingsData : bookingsData.bookings || []
      setUserBookings(bookingsArray)
    } catch (err) {
      console.error('Erro ao carregar reservas do usuário:', err)
      setUserBookings([])
    }
  }

  const onSubmit = async (data: CreateBookingData) => {
    try {
      setLoading(true)
      setError('')

      const booking = await bookingsApi.create({
        ...data,
        stationId: selectedStation || data.stationId
      })
      await loadUserBookings()
      refresh()
      reset()
      setSelectedStation('')
      
      // Feedback visual melhorado
      success('Reserva Confirmada!', `Estação ${stations.find(s => s.id === (selectedStation || data.stationId))?.number} reservada com sucesso!`)
      notifyBookingCreated(booking)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar reserva'
      setError(message)
      showError('Erro na Reserva', message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      setCancellingId(id)
      const booking = userBookings.find(b => b.id === id)
      await bookingsApi.cancel(id)
      await loadUserBookings()
      refresh()
      
      success('Reserva Cancelada', 'Sua reserva foi cancelada com sucesso.')
      if (booking?.station?.number) {
        notifyBookingCancelled(booking.station.number)
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao cancelar reserva'
      setError(message)
      showError('Erro ao Cancelar', message)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8">
        <NotificationBanner
          isSupported={isSupported}
          permission={permission}
          onRequestPermission={requestPermission}
        />
        
        <StatusIndicator 
          lastUpdate={lastUpdate}
          isLoading={isLoading}
          onRefresh={refresh}
        />
        
        {isLoading ? <StatsSkeleton /> : <QuickStats stations={stations} userBookings={userBookings} />}
        
        <motion.div 
          className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          
          {/* Calendário */}
          <motion.div 
            className="xl:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date)
                setValue('date', format(date, 'yyyy-MM-dd'))
              }}
              bookedDates={(Array.isArray(bookings) ? bookings : [])
                .filter(b => b.status === 'ACTIVE')
                .map(b => parseISO(b.date))
              }
            />
          </motion.div>

          {/* Estações com Status */}
          <motion.div 
            className="xl:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Estações de Trading</h2>
                  <p className="text-sm text-gray-600">Status em tempo real • Atualizado {lastUpdate.toLocaleTimeString('pt-BR')}</p>
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Disponível</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span>Ocupada</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Manutenção</span>
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5].map(i => <StationSkeleton key={i} />)}
                </div>
              ) : (
                <StationCatalog
                  stations={stations}
                  selectedStation={selectedStation}
                  onStationSelect={(stationId) => {
                    setSelectedStation(stationId)
                    setValue('stationId', stationId)
                  }}
                  onSeatSelect={(stationId, seatId) => {
                    console.log('Seat selected:', { stationId, seatId })
                  }}
                  onBookingConfirm={async (bookingData) => {
                    try {
                      const seatParts = bookingData.seat.split('-')
                      if (seatParts.length !== 2) {
                        throw new Error('Formato de assento inválido')
                      }
                      const seatNumber = parseInt(seatParts[1])
                      if (isNaN(seatNumber)) {
                        throw new Error('Número do assento inválido')
                      }
                      const booking = await bookingsApi.create({
                        stationId: bookingData.stationId,
                        date: bookingData.date,
                        startTime: bookingData.startTime,
                        endTime: bookingData.endTime,
                        seatNumber: seatNumber
                      })
                      await loadUserBookings()
                      refresh()
                      success('Reserva Confirmada!', `Assento ${seatNumber} reservado com sucesso!`)
                    } catch (err: any) {
                      const message = err.response?.data?.message || 'Erro ao criar reserva'
                      showError('Erro na Reserva', message)
                      throw err
                    }
                  }}
                  showStatus={true}
                  onModalStateChange={setIsModalOpen}
                />
              )}
              
              {selectedStation && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Estação {stations.find(s => s.id === selectedStation)?.number} selecionada
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Preencha os dados abaixo para confirmar sua reserva
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          <div className="xl:col-span-1">
            <UpcomingBookings bookings={userBookings} />
          </div>
          
          <motion.div 
            className="xl:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >

          {/* Minhas Reservas */}
          <motion.div 
            className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-t-4 border-t-blue-500"
            whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Assignment className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Minhas Reservas</h2>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                {userBookings.length} ativa{userBookings.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence>
                {loading ? (
                  [1, 2, 3].map(i => <BookingSkeleton key={i} />)
                ) : userBookings.length === 0 ? (
                  <motion.div 
                    key="empty"
                    className="text-center py-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CalendarToday sx={{ fontSize: 64, color: 'rgb(209 213 219)', margin: '0 auto 16px' }} />
                    <p className="text-gray-500 text-lg mb-2">Nenhuma reserva encontrada</p>
                    <p className="text-gray-400 text-sm">Faça sua primeira reserva ao lado!</p>
                  </motion.div>
                ) : (
                  userBookings.map((booking, index) => (
                    <motion.div 
                      key={booking.id} 
                      className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                            Estação {booking.station?.number}{booking.seatNumber ? ` - Assento ${booking.seatNumber}` : ''}
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center space-x-1">
                            <CheckCircle sx={{ fontSize: 12 }} />
                            <span>Ativa</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm font-medium text-gray-900 mb-1">
                          <CalendarToday sx={{ fontSize: 16, color: 'rgb(107 114 128)' }} />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <AccessTime sx={{ fontSize: 16, color: 'rgb(107 114 128)' }} />
                          <span>{formatTime(booking.startTime)} às {formatTime(booking.endTime)}</span>
                        </div>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                      >
                        <Button
                          variant="secondary"
                          loading={cancellingId === booking.id}
                          disabled={cancellingId === booking.id}
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Cancelar Reserva',
                              message: `Tem certeza que deseja cancelar a reserva da Estação ${booking.station?.number}${booking.seatNumber ? ` - Assento ${booking.seatNumber}` : ''}?`,
                              confirmText: 'Sim, cancelar',
                              cancelText: 'Não, manter',
                              confirmVariant: 'danger'
                            })
                            if (confirmed) {
                              handleCancel(booking.id)
                            }
                          }}
                          className="text-red-600 hover:bg-red-100 border-red-200 text-sm px-4 py-2 w-full sm:w-auto font-medium transition-colors flex items-center justify-center space-x-1"
                        >
                          {cancellingId === booking.id ? (
                            <span>Cancelando...</span>
                          ) : (
                            <>
                              <Close sx={{ fontSize: 16 }} />
                              <span>Cancelar</span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          </motion.div>
          </div>
      </div>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleConfirmCancel}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        confirmVariant={options.confirmVariant}
      />
    </div>
  )
}