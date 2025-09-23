export interface Station {
  id: string
  number: number
  status: 'ACTIVE' | 'MAINTENANCE'
  createdAt: Date
}

export interface Booking {
  id: string
  userId: string
  stationId: string
  date: Date
  startTime: string
  endTime: string
  status: 'ACTIVE' | 'CANCELLED'
  createdAt: Date
  user?: {
    name: string
    email: string
  }
  station?: {
    number: number
  }
}

export interface CreateBookingRequest {
  stationId: string
  date: string
  startTime: string
  endTime: string
}