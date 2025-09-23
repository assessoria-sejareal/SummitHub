import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const formatDate = (date: string | Date) => {
  try {
    let dateObj: Date
    if (typeof date === 'string') {
      // Se a string contém apenas a data (YYYY-MM-DD), adiciona horário UTC
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dateObj = new Date(date + 'T12:00:00.000Z')
      } else {
        dateObj = parseISO(date)
      }
    } else {
      dateObj = date
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida'
    }
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR })
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return 'Data inválida'
  }
}

export const formatDateTime = (date: string | Date) => {
  try {
    let dateObj: Date
    if (typeof date === 'string') {
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dateObj = new Date(date + 'T12:00:00.000Z')
      } else {
        dateObj = parseISO(date)
      }
    } else {
      dateObj = date
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida'
    }
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR })
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error)
    return 'Data inválida'
  }
}

export const formatTime = (time: string) => {
  if (!time || !time.match(/^\d{2}:\d{2}$/)) {
    return 'Hora inválida'
  }
  return time
}