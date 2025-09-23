import api from '../utils/api'

export interface StationOccupancy {
  stationId: string
  stationNumber: number
  bookingCount: number
  occupancyRate: number
}

export interface BookingsByPeriod {
  date: string
  count: number
}

export interface RealTimeOccupancy {
  activeBookings: number
  totalStations: number
  occupancyRate: number
  timestamp: string
}

export interface PeakHour {
  hour: number
  count: number
  label: string
}

export interface AdminAction {
  id: string
  userId: string
  action: string
  targetId: string
  reason?: string
  createdAt: string
  user: {
    name: string
    email: string
  }
}

export const adminApi = {
  // Analytics
  getStationOccupancy: async (): Promise<StationOccupancy[]> => {
    const response = await api.get('/admin/analytics/station-occupancy')
    return response.data
  },

  getBookingsByPeriod: async (period: 'daily' | 'weekly' | 'monthly' = 'daily', days: number = 7): Promise<BookingsByPeriod[]> => {
    const response = await api.get(`/admin/analytics/bookings-by-period?period=${period}&days=${days}`)
    return response.data
  },

  getRealTimeOccupancy: async (): Promise<RealTimeOccupancy> => {
    const response = await api.get('/admin/analytics/real-time-occupancy')
    return response.data
  },

  getPeakHours: async (): Promise<PeakHour[]> => {
    const response = await api.get('/admin/analytics/peak-hours')
    return response.data
  },

  // Management
  cancelBooking: async (id: string, reason?: string): Promise<void> => {
    await api.delete(`/admin/bookings/${id}`, { data: { reason } })
  },

  updateStationStatus: async (id: string, status: 'ACTIVE' | 'MAINTENANCE', reason?: string): Promise<void> => {
    await api.patch(`/admin/stations/${id}/status`, { status, reason })
  },

  getAdminActions: async (page: number = 1, limit: number = 50): Promise<{
    actions: AdminAction[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> => {
    const response = await api.get(`/admin/actions?page=${page}&limit=${limit}`)
    return response.data
  },

  exportReport: async (type: 'bookings' = 'bookings', format: 'csv' = 'csv'): Promise<Blob> => {
    const response = await api.get(`/admin/reports/export?type=${type}&format=${format}`, {
      responseType: 'blob'
    })
    return response.data
  }
}