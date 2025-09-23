import { useState, useEffect } from 'react'
import { adminApi, StationOccupancy, BookingsByPeriod, RealTimeOccupancy, PeakHour } from '../../api/admin'

export const useAnalytics = () => {
  const [stationOccupancy, setStationOccupancy] = useState<StationOccupancy[]>([])
  const [bookingsByPeriod, setBookingsByPeriod] = useState<BookingsByPeriod[]>([])
  const [realTimeOccupancy, setRealTimeOccupancy] = useState<RealTimeOccupancy | null>(null)
  const [peakHours, setPeakHours] = useState<PeakHour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = async (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    try {
      setLoading(true)
      setError(null)
      
      const [occupancy, bookings, realTime, peaks] = await Promise.all([
        adminApi.getStationOccupancy(),
        adminApi.getBookingsByPeriod(period),
        adminApi.getRealTimeOccupancy(),
        adminApi.getPeakHours()
      ])
      
      setStationOccupancy(occupancy)
      setBookingsByPeriod(bookings)
      setRealTimeOccupancy(realTime)
      setPeakHours(peaks)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar analytics')
    } finally {
      setLoading(false)
    }
  }

  const refreshRealTime = async () => {
    try {
      const realTime = await adminApi.getRealTimeOccupancy()
      setRealTimeOccupancy(realTime)
    } catch (err) {
      console.error('Erro ao atualizar dados em tempo real:', err)
    }
  }

  return {
    stationOccupancy,
    bookingsByPeriod,
    realTimeOccupancy,
    peakHours,
    loading,
    error,
    loadAnalytics,
    refreshRealTime
  }
}