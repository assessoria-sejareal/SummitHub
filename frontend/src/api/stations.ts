import api from '../utils/api'

export interface Station {
  id: string
  number: number
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
  createdAt: string
}

export const stationsApi = {
  list: async (): Promise<Station[]> => {
    const response = await api.get('/stations')
    return response.data
  },

  getSeats: async (stationId: string, date: string, startTime?: string, endTime?: string): Promise<{
    stationId: string
    stationNumber: number
    stationName: string
    date: string
    seats: Array<{
      id: string
      number: number
      available: boolean
      bookings: Array<{
        seatNumber: number
        startTime: string
        endTime: string
        user: { name: string }
      }>
    }>
  }> => {
    let url = `/stations/${stationId}/seats?date=${date}`
    if (startTime && endTime) {
      url += `&startTime=${startTime}&endTime=${endTime}`
    }
    const response = await api.get(url)
    return response.data
  },

  checkSeatAvailability: async (stationId: string, seatNumber: number, date: string, startTime: string, endTime: string): Promise<{
    available: boolean
    conflicts: number
  }> => {
    const response = await api.post(`/stations/${stationId}/seats/check`, {
      seatNumber,
      date,
      startTime,
      endTime
    })
    return response.data
  }
}