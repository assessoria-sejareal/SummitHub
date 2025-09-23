import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middlewares/auth'
import { csrfProtection } from '../middlewares/csrf'

const router = Router()
const prisma = new PrismaClient()

// Station configurations matching frontend
const stationConfigs = {
  1: { name: 'Estação 1', seats: 12 },
  2: { name: 'Estação 2', seats: 4 },
  3: { name: 'Estação 3', seats: 1 },
  4: { name: 'Estação 4', seats: 1 },
  5: { name: 'Estação 5', seats: 6 }
}

// Get all stations
router.get('/', async (req, res) => {
  try {
    const stations = await prisma.station.findMany({
      orderBy: { number: 'asc' }
    })
    res.json(stations)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estações' })
  }
})

// Get seat availability for a station on a specific date
router.get('/:stationId/seats', authenticateToken, async (req, res) => {
  try {
    const { stationId } = req.params
    const { date } = req.query

    if (!date) {
      return res.status(400).json({ message: 'Data é obrigatória' })
    }

    const station = await prisma.station.findUnique({
      where: { id: stationId }
    })

    if (!station) {
      return res.status(404).json({ message: 'Estação não encontrada' })
    }

    const config = stationConfigs[station.number as keyof typeof stationConfigs]
    if (!config) {
      return res.status(404).json({ message: 'Configuração da estação não encontrada' })
    }

    // Get all bookings for this station on this date
    // Get all bookings for this station to debug dates
    const allBookings = await prisma.booking.findMany({
      where: {
        stationId,
        status: 'ACTIVE'
      },
      select: {
        seatNumber: true,
        startTime: true,
        endTime: true,
        date: true,
        user: {
          select: {
            name: true
          }
        }
      }
    })
    

    
    // Filter by date string comparison
    const dateStr = date as string
    const filteredBookings = allBookings.filter(b => {
      const bookingDateStr = b.date.toISOString().split('T')[0]
      return bookingDateStr === dateStr
    })

    // Generate seat availability
    const seats = []
    for (let i = 1; i <= config.seats; i++) {
      const seatBookings = filteredBookings.filter(b => b.seatNumber === i)
      seats.push({
        id: `${station.number}-${i}`,
        number: i,
        available: seatBookings.length === 0,
        bookings: seatBookings
      })
    }

    res.json({
      stationId,
      stationNumber: station.number,
      stationName: config.name,
      date,
      seats
    })
  } catch (error) {
    console.error('Erro ao buscar assentos:', error)
    res.status(500).json({ message: 'Erro ao buscar disponibilidade de assentos' })
  }
})

// Check seat availability for specific time range
router.post('/:stationId/seats/check', authenticateToken, csrfProtection, async (req, res) => {
  try {
    const { stationId } = req.params
    const { seatNumber, date, startTime, endTime } = req.body

    const conflicts = await prisma.booking.findMany({
      where: {
        stationId,
        seatNumber: parseInt(seatNumber),
        date: new Date(date),
        status: 'ACTIVE',
        OR: [
          {
            AND: [
              { startTime: { lte: endTime } },
              { endTime: { gte: startTime } }
            ]
          }
        ]
      }
    })

    res.json({
      available: conflicts.length === 0,
      conflicts: conflicts.length
    })
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error)
    res.status(500).json({ message: 'Erro ao verificar disponibilidade' })
  }
})

export default router