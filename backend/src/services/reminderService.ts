import * as cron from 'node-cron'
import prisma from '../config/database'
import { emailService } from './emailService'
import { safeLog } from '../utils/logger'

let scheduledTask: any = null

export const reminderService = {
  // Executa todo dia às 18:00 para enviar lembretes do dia seguinte
  startReminderScheduler() {
    if (scheduledTask) {
      return // Já está rodando
    }
    
    scheduledTask =
    cron.schedule('0 18 * * *', async () => {
      safeLog.info('Executando envio de lembretes...')
      
      try {
        // Buscar reservas para amanhã
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        
        const endOfTomorrow = new Date(tomorrow)
        endOfTomorrow.setHours(23, 59, 59, 999)
        
        const bookings = await prisma.booking.findMany({
          where: {
            date: {
              gte: tomorrow,
              lte: endOfTomorrow
            },
            status: 'ACTIVE'
          },
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            },
            station: {
              select: {
                number: true
              }
            }
          }
        })
        
        safeLog.info(`Enviando ${bookings.length} lembretes...`)
        
        // Enviar lembretes
        for (const booking of bookings) {
          try {
            await emailService.sendBookingReminder({
              userEmail: booking.user.email,
              userName: booking.user.name,
              stationNumber: booking.station.number,
              seatNumber: booking.seatNumber || undefined,
              date: booking.date.toISOString().split('T')[0],
              startTime: booking.startTime,
              endTime: booking.endTime,
              bookingId: booking.id
            })
            
            safeLog.info(`Lembrete enviado para ${booking.user.email}`)
          } catch (error) {
            safeLog.error(`Erro ao enviar lembrete para ${booking.user.email}`, error)
          }
        }
        
        safeLog.info('Lembretes enviados com sucesso!')
      } catch (error) {
        safeLog.error('Erro no serviço de lembretes', error)
      }
    })
    
    
    safeLog.info('Agendador de lembretes iniciado (18:00 diariamente)')
  },
  
  stopReminderScheduler() {
    if (scheduledTask) {
      scheduledTask.stop()
      scheduledTask = null
      safeLog.info('Agendador de lembretes parado')
    }
  }
}