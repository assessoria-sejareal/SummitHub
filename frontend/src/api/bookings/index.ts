import api from '../../utils/api'
import { Booking, Station, CreateBookingData } from '../../@types/bookings'

export const bookingsApi = {
  create: async (data: CreateBookingData): Promise<Booking> => {
    const response = await api.post('/bookings', data)
    return response.data
  },

  list: async (): Promise<Booking[]> => {
    const response = await api.get('/bookings')
    return response.data
  },

  listAll: async (): Promise<Booking[]> => {
    const response = await api.get('/bookings/all')
    return response.data
  },

  cancel: async (id: string): Promise<void> => {
    await api.delete(`/bookings/${id}`)
  },

  getStations: async (): Promise<Station[]> => {
    const response = await api.get('/bookings/stations')
    return response.data
  }
}