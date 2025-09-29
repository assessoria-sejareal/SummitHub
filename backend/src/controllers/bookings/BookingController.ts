import { Response } from 'express'
import prisma from '../../config/database'
import { AuthRequest } from '../../middlewares/auth'
import { AppError, handleError } from '../../helpers/errors'
import { createBookingSchema } from '../../validators/booking'
import { emailService } from '../../services/emailService'

export class BookingController {
  async create(req: AuthRequest, res: Response) {
    try {
      console.log('Creating booking with data:', req.body)
      const validatedData = createBookingSchema.parse(req.body)
      const { stationId, date, startTime, endTime, seatNumber } = validatedData
      const userId = req.userId!
      console.log('Validated data:', { stationId, date, startTime, endTime, seatNumber, userId })
      
      // Buscar dados do usuário
      console.log('Fetching user data for:', userId)
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { fullName: true, cpf: true }
      })
      console.log('User found:', user ? 'yes' : 'no')
      
      if (!user) {
        throw new AppError('Usuário não encontrado', 404)
      }

      // Verificar se a estação existe e está ativa
      console.log('Checking station:', stationId)
      const station = await prisma.station.findUnique({ where: { id: stationId } })
      console.log('Station found:', station ? `${station.number} (${station.status})` : 'no')
      if (!station || station.status !== 'ACTIVE') {
        throw new AppError('Estação não disponível', 400)
      }

      // Verificar conflitos de assento específico
      if (seatNumber) {
        console.log('Checking conflicts for seat:', seatNumber)
        const conflictingBooking = await prisma.booking.findFirst({
          where: {
            stationId,
            seatNumber: seatNumber,
            date: new Date(date + 'T12:00:00.000Z'),
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
        console.log('Conflict found:', conflictingBooking ? 'yes' : 'no')

        if (conflictingBooking) {
          throw new AppError(`Assento ${seatNumber} já está reservado neste horário`, 400)
        }
      }

      console.log('Creating booking in database...')
      const booking = await prisma.booking.create({
        data: {
          userId,
          stationId,
          seatId: seatNumber ? `${station.number}-${seatNumber}` : null,
          seatNumber: seatNumber || null,
          date: new Date(date + 'T12:00:00.000Z'),
          startTime,
          endTime,
          cpf: user.cpf,
          fullName: user.fullName
        },
        include: {
          station: { select: { number: true } },
          user: { select: { email: true, name: true } }
        }
      })

      // Email service temporarily disabled for debugging
      console.log('Booking created, skipping email for now')

      console.log('Booking created successfully:', booking.id)
      res.status(201).json(booking)
    } catch (error: any) {
      console.error('Booking creation error:', error)
      const { message, statusCode } = handleError(error)
      res.status(statusCode).json({ message })
    }
  }

  async list(req: AuthRequest, res: Response) {
    try {
      const bookings = await prisma.booking.findMany({
        where: { userId: req.userId, status: 'ACTIVE' },
        include: {
          station: { select: { number: true } }
        },
        orderBy: { date: 'asc' }
      })

      res.json(bookings)
    } catch (error: any) {
      const { message, statusCode } = handleError(error)
      res.status(statusCode).json({ message })
    }
  }

  async cancel(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      
      const booking = await prisma.booking.findUnique({ where: { id } })
      if (!booking || booking.userId !== req.userId) {
        throw new AppError('Reserva não encontrada', 404)
      }

      await prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' }
      })

      res.json({ message: 'Reserva cancelada com sucesso' })
    } catch (error: any) {
      const { message, statusCode } = handleError(error)
      res.status(statusCode).json({ message })
    }
  }

  async listAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
      const skip = (page - 1) * limit

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          skip,
          take: limit,
          include: {
            user: { select: { name: true, fullName: true, cpf: true, phone: true, company: true, email: true } },
            station: { select: { number: true } }
          },
          orderBy: [{ date: 'desc' }, { startTime: 'asc' }]
        }),
        prisma.booking.count()
      ])

      res.json({
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (error: any) {
      const { message, statusCode } = handleError(error)
      res.status(statusCode).json({ message })
    }
  }

  async getStations(req: AuthRequest, res: Response) {
    try {
      const stations = await prisma.station.findMany({
        orderBy: { number: 'asc' }
      })

      res.json(stations)
    } catch (error: any) {
      const { message, statusCode } = handleError(error)
      res.status(statusCode).json({ message })
    }
  }
}