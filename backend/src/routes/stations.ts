import { Router } from 'express'
import prisma from '../config/database'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

// Get stations with intelligent insights
router.get('/', authMiddleware, async (req, res) => {
  try {
    const stations = await prisma.station.findMany({
      include: {
        bookings: {
          where: {
            status: 'ACTIVE',
            date: {
              gte: new Date(new Date().toDateString()) // Today onwards
            }
          }
        }
      }
    })

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentHour = now.getHours()

    const stationsWithInsights = await Promise.all(stations.map(async (station) => {
      // Calculate today's occupancy - only count bookings for TODAY
      const todayBookings = await prisma.booking.count({
        where: {
          stationId: station.id,
          status: 'ACTIVE',
          date: {
            gte: new Date(today + 'T00:00:00.000Z'),
            lt: new Date(today + 'T23:59:59.999Z')
          }
        }
      })
      
      console.log(`Station ${station.number}: ${todayBookings} bookings for ${today}`)

      // Calculate available slots today (assuming 10 hours: 8h-18h)
      const totalSlotsToday = 10
      const occupancyRate = todayBookings > 0 ? Math.round((todayBookings / totalSlotsToday) * 100) : 0

      // Find best time slots (least occupied hours) - only if there are bookings
      let bestTimeSlot = '14:00' // Default best time
      
      if (todayBookings > 0) {
        const hourlyBookings = await prisma.booking.groupBy({
          by: ['startTime'],
          where: {
            stationId: station.id,
            status: 'ACTIVE',
            date: { gte: new Date(new Date().setDate(now.getDate() - 7)) } // Last 7 days
          },
          _count: { id: true },
          orderBy: { _count: { id: 'asc' } }
        })
        
        bestTimeSlot = hourlyBookings[0]?.startTime || '14:00'
      }
      
      // Calculate remaining slots today
      const remainingSlots = Math.max(0, totalSlotsToday - todayBookings)

      // Generate personalized tip based on station characteristics
      const tips = {
        1: 'Ideal para day trading com múltiplos monitores',
        2: 'Perfeito para análises técnicas em ambiente privativo', 
        3: 'Excelente para foco total em operações complexas',
        4: 'Ambiente silencioso ideal para swing trading',
        5: 'Flexível para diferentes estratégias de trading'
      }

      // Generate urgency message only if there are actual bookings
      let urgencyMessage = ''
      if (todayBookings > 0) {
        if (remainingSlots <= 2 && remainingSlots > 0) {
          urgencyMessage = `Apenas ${remainingSlots} horário${remainingSlots > 1 ? 's' : ''} livre${remainingSlots > 1 ? 's' : ''} hoje`
        } else if (remainingSlots === 0) {
          urgencyMessage = 'Lotado hoje - reserve para amanhã'
        }
      }

      return {
        ...station,
        insights: {
          occupancyRate,
          bestTimeSlot,
          remainingSlots,
          personalizedTip: tips[station.number as keyof typeof tips] || 'Ótima opção para trading',
          urgencyMessage,
          isPopular: todayBookings > 0 && occupancyRate > 70,
          isAvailableNow: remainingSlots > 0 && currentHour >= 8 && currentHour < 18
        }
      }
    }))

    res.json(stationsWithInsights)
  } catch (error) {
    console.error('Error fetching stations with insights:', error)
    res.status(500).json({ message: 'Erro ao buscar estações' })
  }
})

export default router