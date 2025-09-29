import { useState, useEffect, useCallback } from 'react'
import { bookingsApi } from '../../api/bookings'
import { Booking, Station } from '../../@types/bookings'

interface StationWithStatus extends Station {
  currentBooking?: Booking
  nextAvailable?: string
  occupiedUntil?: string
  averageUsage?: number
  isAvailableNow?: boolean
}

export const useRealTimeStatus = (intervalMs: number = 30000, paused: boolean = false) => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stations, setStations] = useState<StationWithStatus[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  const fetchData = useCallback(async () => {
    // Debounce: prevent calls within 5 seconds of each other
    const now = Date.now()
    if (now - lastFetchTime < 5000) {
      return
    }
    setLastFetchTime(now)
    
    try {
      setIsLoading(true)
      let user = {}
      try {
        user = JSON.parse(localStorage.getItem('user') || '{}')
      } catch {
        user = {}
      }
      
      const [bookingsResponse, stationsData] = await Promise.all([
        user.role === 'ADMIN' 
          ? bookingsApi.listAll().catch(() => [])
          : bookingsApi.list().catch(() => []),
        bookingsApi.getStations()
      ])
      
      // Se a API retornar objeto com paginação, extrair o array
      const bookingsData = Array.isArray(bookingsResponse) ? bookingsResponse : bookingsResponse.bookings || []
      
      setBookings(bookingsData)
      setStations(enhanceStationsWithStatus(stationsData, bookingsData))
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }, [lastFetchTime])

  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  useEffect(() => {
    if (!paused) {
      const interval = setInterval(fetchData, intervalMs)
      return () => clearInterval(interval)
    }
  }, [fetchData, intervalMs, paused])

  return {
    bookings,
    stations,
    lastUpdate,
    isLoading,
    refresh: fetchData
  }
}

const enhanceStationsWithStatus = (stations: Station[], bookings: Booking[]): StationWithStatus[] => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const currentTime = now.toTimeString().slice(0, 5)
  
  // Garantir que bookings é um array
  const bookingsArray = Array.isArray(bookings) ? bookings : []

  return stations.map(station => {
    const stationBookings = bookingsArray.filter(b => 
      b.stationId === station.id && 
      b.status === 'ACTIVE' &&
      b.date.split('T')[0] === today
    )

    // Current booking
    const currentBooking = stationBookings.find(b => 
      b.startTime <= currentTime && b.endTime >= currentTime
    )

    // Next available slot
    const futureBookings = stationBookings
      .filter(b => b.startTime > currentTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    let nextAvailable = ''
    let occupiedUntil = ''

    if (currentBooking) {
      occupiedUntil = currentBooking.endTime
      const nextBooking = futureBookings[0]
      if (nextBooking) {
        nextAvailable = nextBooking.startTime
      } else {
        nextAvailable = currentBooking.endTime
      }
    } else if (futureBookings.length > 0) {
      nextAvailable = 'Agora'
    } else {
      nextAvailable = 'Disponível'
    }

    // Calculate average usage (mock data for now)
    const averageUsage = Math.floor(Math.random() * 4) + 2 // 2-6 hours
    
    // Calculate insights
    const todayBookingsCount = stationBookings.length
    const totalSlotsToday = 10 // 8h-18h
    const occupancyRate = todayBookingsCount > 0 ? Math.round((todayBookingsCount / totalSlotsToday) * 100) : 0
    const remainingSlots = Math.max(0, totalSlotsToday - todayBookingsCount)
    
    // Generate personalized tips
    const tips = {
      1: 'Ideal para day trading com múltiplos monitores',
      2: 'Perfeito para análises técnicas em ambiente privativo', 
      3: 'Excelente para foco total em operações complexas',
      4: 'Ambiente silencioso ideal para swing trading',
      5: 'Flexível para diferentes estratégias de trading'
    }
    
    // Generate urgency message
    let urgencyMessage = ''
    if (todayBookingsCount > 0) {
      if (remainingSlots <= 2 && remainingSlots > 0) {
        urgencyMessage = `Apenas ${remainingSlots} horário${remainingSlots > 1 ? 's' : ''} livre${remainingSlots > 1 ? 's' : ''} hoje`
      } else if (remainingSlots === 0) {
        urgencyMessage = 'Lotado hoje - reserve para amanhã'
      }
    }

    return {
      ...station,
      currentBooking,
      nextAvailable,
      occupiedUntil,
      averageUsage,
      isAvailableNow: !currentBooking && station.status === 'ACTIVE',
      insights: {
        occupancyRate,
        bestTimeSlot: '14:00',
        remainingSlots,
        personalizedTip: tips[station.number as keyof typeof tips] || 'Ótima opção para trading',
        urgencyMessage,
        isPopular: todayBookingsCount > 0 && occupancyRate > 70,
        isAvailableNow: remainingSlots > 0
      }
    }
  })
}