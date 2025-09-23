export interface Station {
  id: string
  number: number
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
  createdAt: string
}

export interface Booking {
  id: string
  userId: string
  stationId: string
  seatId?: string
  seatNumber?: number
  date: string
  startTime: string
  endTime: string
  cpf: string
  fullName: string
  status: 'ACTIVE' | 'CANCELLED'
  createdAt: string
  user?: {
    name: string
    fullName: string
    cpf: string
    phone: string
    company: string
    email: string
  }
  station?: {
    number: number
  }
}

export interface CreateBookingData {
  stationId: string
  date: string
  startTime: string
  endTime: string
  seatNumber?: number
}