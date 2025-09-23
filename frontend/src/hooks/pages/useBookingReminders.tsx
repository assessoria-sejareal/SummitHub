import { useEffect, useCallback, useRef } from 'react'
import { parseISO, differenceInMinutes, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Booking } from '../../@types/bookings'
import { useNotifications } from '../global/useNotifications'
import { sanitizeForNotification } from '../../utils/sanitize'

export const useBookingReminders = (bookings: Booking[]) => {
  const { showNotification, permission } = useNotifications()
  const timeoutsRef = useRef<number[]>([])

  const scheduleReminders = useCallback(() => {
    if (permission !== 'granted') return

    // Clear existing timeouts
    timeoutsRef.current.forEach(timeout => window.clearTimeout(timeout))
    timeoutsRef.current = []

    bookings.forEach(booking => {
      try {
        const bookingDateTime = parseISO(`${booking.date}T${booking.startTime}`)
        const now = new Date()
        const minutesUntilBooking = differenceInMinutes(bookingDateTime, now)

        // Lembrete 30 minutos antes
        if (minutesUntilBooking > 25 && minutesUntilBooking <= 35) {
          const timeout = window.setTimeout(() => {
            showNotification({
              title: 'Lembrete de Reserva',
              body: sanitizeForNotification(`Sua reserva na Estação ${booking.station?.number || 0} começa em 30 minutos (${format(bookingDateTime, 'HH:mm', { locale: ptBR })})`),
              tag: `reminder-30-${booking.id}`,
              requireInteraction: true
            })
          }, (minutesUntilBooking - 30) * 60 * 1000)
          timeoutsRef.current.push(timeout)
        }

        // Lembrete 10 minutos antes
        if (minutesUntilBooking > 5 && minutesUntilBooking <= 15) {
          const timeout = window.setTimeout(() => {
            showNotification({
              title: 'Reserva Começando',
              body: sanitizeForNotification(`Sua reserva na Estação ${booking.station?.number || 0} começa em 10 minutos!`),
              tag: `reminder-10-${booking.id}`,
              requireInteraction: true
            })
          }, (minutesUntilBooking - 10) * 60 * 1000)
          timeoutsRef.current.push(timeout)
        }

        // Notificação no momento da reserva
        if (minutesUntilBooking > 0 && minutesUntilBooking <= 5) {
          const timeout = window.setTimeout(() => {
            showNotification({
              title: 'Hora da Reserva!',
              body: sanitizeForNotification(`Sua reserva na Estação ${booking.station?.number || 0} está começando agora!`),
              tag: `start-${booking.id}`,
              requireInteraction: true
            })
          }, minutesUntilBooking * 60 * 1000)
          timeoutsRef.current.push(timeout)
        }
      } catch (err) {
        console.error('Erro ao processar lembrete:', err)
      }
    })
  }, [bookings, showNotification, permission])

  useEffect(() => {
    scheduleReminders()
    
    return () => {
      timeoutsRef.current.forEach(timeout => window.clearTimeout(timeout))
      timeoutsRef.current = []
    }
  }, [scheduleReminders])

  const notifyBookingCreated = useCallback((booking: Booking) => {
    if (permission !== 'granted') return

    const bookingDateTime = parseISO(`${booking.date}T${booking.startTime}`)
    
    showNotification({
      title: 'Reserva Confirmada!',
      body: `Estação ${booking.station?.number} reservada para ${format(bookingDateTime, 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}`,
      tag: `created-${booking.id}`
    })
  }, [showNotification, permission])

  const notifyBookingCancelled = useCallback((stationNumber: number) => {
    if (permission !== 'granted') return

    showNotification({
      title: 'Reserva Cancelada',
      body: `Sua reserva da Estação ${stationNumber} foi cancelada com sucesso.`,
      tag: 'cancelled'
    })
  }, [showNotification, permission])

  return {
    notifyBookingCreated,
    notifyBookingCancelled
  }
}