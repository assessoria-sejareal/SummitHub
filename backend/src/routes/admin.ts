import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, requireAdmin } from '../middlewares/auth'
import { csrfProtection } from '../middlewares/csrf'
import { z } from 'zod'

const router = Router()
const prisma = new PrismaClient()

// Analytics - Ocupação por estação
router.get('/analytics/station-occupancy', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const occupancy = await prisma.booking.groupBy({
      by: ['stationId'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    })

    const stations = await prisma.station.findMany()
    
    const result = stations.map(station => {
      const bookingCount = occupancy.find(o => o.stationId === station.id)?._count.id || 0
      return {
        stationId: station.id,
        stationNumber: station.number,
        bookingCount,
        occupancyRate: (bookingCount / 24) * 100 // Assumindo 24 slots por dia
      }
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar ocupação por estação' })
  }
})

// Analytics - Reservas por período
router.get('/analytics/bookings-by-period', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = 'daily', days = 7 } = req.query
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(days))

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'ACTIVE'
      },
      select: { createdAt: true, date: true }
    })

    const groupedData = bookings.reduce((acc: any, booking) => {
      let key: string
      const date = new Date(booking.createdAt)
      
      if (period === 'daily') {
        key = date.toISOString().split('T')[0]
      } else if (period === 'weekly') {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }
      
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const result = Object.entries(groupedData).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date))

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar reservas por período' })
  }
})

// Analytics - Taxa de ocupação em tempo real
router.get('/analytics/real-time-occupancy', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentHour = now.getHours()

    const activeBookings = await prisma.booking.count({
      where: {
        date: { gte: new Date(today) },
        status: 'ACTIVE',
        startTime: { lte: `${String(currentHour).padStart(2, '0')}:59` },
        endTime: { gte: `${String(currentHour).padStart(2, '0')}:00` }
      }
    })

    const totalStations = await prisma.station.count({ where: { status: 'ACTIVE' } })
    const occupancyRate = totalStations > 0 ? (activeBookings / totalStations) * 100 : 0

    res.json({
      activeBookings,
      totalStations,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      timestamp: now.toISOString()
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar ocupação em tempo real' })
  }
})

// Analytics - Horários de pico
router.get('/analytics/peak-hours', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { status: 'ACTIVE' },
      select: { startTime: true, endTime: true }
    })

    const hourCounts: { [key: number]: number } = {}
    
    bookings.forEach(booking => {
      const startHour = parseInt(booking.startTime.split(':')[0])
      const endHour = parseInt(booking.endTime.split(':')[0])
      
      for (let hour = startHour; hour <= endHour; hour++) {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      }
    })

    const result = Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
        label: `${String(hour).padStart(2, '0')}:00`
      }))
      .sort((a, b) => b.count - a.count)

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar horários de pico' })
  }
})

// Cancelar reserva (admin)
router.delete('/bookings/:id', authenticateToken, requireAdmin, csrfProtection, async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    await prisma.booking.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason || 'Cancelado pelo administrador'
      }
    })

    // Log da ação administrativa
    await prisma.adminAction.create({
      data: {
        userId: req.user!.id,
        action: 'CANCEL_BOOKING',
        targetId: id,
        reason: reason || 'Cancelado pelo administrador'
      }
    })

    res.json({ message: 'Reserva cancelada com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cancelar reserva' })
  }
})

// Bloquear/desbloquear estação
const stationStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'MAINTENANCE']),
  reason: z.string().optional()
})

router.patch('/stations/:id/status', authenticateToken, requireAdmin, csrfProtection, async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = stationStatusSchema.parse(req.body)

    await prisma.station.update({
      where: { id },
      data: { status }
    })

    // Log da ação administrativa
    await prisma.adminAction.create({
      data: {
        userId: req.user!.id,
        action: status === 'ACTIVE' ? 'ACTIVATE_STATION' : 'BLOCK_STATION',
        targetId: id,
        reason: reason || `Estação ${status === 'ACTIVE' ? 'ativada' : 'bloqueada'}`
      }
    })

    res.json({ message: `Estação ${status === 'ACTIVE' ? 'ativada' : 'bloqueada'} com sucesso` })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao alterar status da estação' })
  }
})

// Histórico de ações administrativas
router.get('/actions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const actions = await prisma.adminAction.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    })

    const total = await prisma.adminAction.count()

    res.json({
      actions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar histórico de ações' })
  }
})

// Exportar relatórios
router.get('/reports/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type = 'bookings', format = 'csv' } = req.query

    if (type === 'bookings') {
      const bookings = await prisma.booking.findMany({
        include: {
          user: { select: { name: true, email: true, cpf: true, phone: true, company: true } },
          station: { select: { number: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

      if (format === 'csv') {
        const csv = [
          'Data Reserva,Trader,Email,CPF,Telefone,Empresa,Estação,Data Uso,Horário,Status',
          ...bookings.map(b => [
            new Date(b.createdAt).toLocaleDateString('pt-BR'),
            b.user?.name || b.fullName,
            b.user?.email || '',
            b.user?.cpf || b.cpf,
            b.user?.phone || '',
            b.user?.company || '',
            `Estação ${b.station?.number}`,
            new Date(b.date).toLocaleDateString('pt-BR'),
            `${b.startTime} - ${b.endTime}`,
            b.status === 'ACTIVE' ? 'Ativa' : 'Cancelada'
          ].join(','))
        ].join('\n')

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename=reservas.csv')
        res.send(csv)
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao exportar relatório' })
  }
})

export default router