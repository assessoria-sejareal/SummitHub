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

export const useRealTimeStatus = (intervalMs: number = 30000) => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stations, setStations] = useState<StationWithStatus[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchData()
    
    const interval = setInterval(fetchData, intervalMs)
    
    return () => clearInterval(interval)
  }, [fetchData, intervalMs])

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

    return {
      ...station,
      currentBooking,
      nextAvailable,
      occupiedUntil,
      averageUsage,
      isAvailableNow: !currentBooking && station.status === 'ACTIVE'
    }
  })
}