export interface Station {
  id: string
  number: number
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
  createdAt: string
}