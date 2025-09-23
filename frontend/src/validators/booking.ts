import { z } from 'zod'

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '')
  if (cleanCPF.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i)
  }
  let digit1 = 11 - (sum % 11)
  if (digit1 > 9) digit1 = 0
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i)
  }
  let digit2 = 11 - (sum % 11)
  if (digit2 > 9) digit2 = 0
  
  return digit1 === parseInt(cleanCPF[9]) && digit2 === parseInt(cleanCPF[10])
}

export const createBookingSchema = z.object({
  stationId: z.string().min(1, 'Selecione uma estação'),
  date: z.string().refine(date => {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime()) && date.match(/^\d{4}-\d{2}-\d{2}$/)
  }, 'Data inválida'),
  startTime: z.string().refine(time => {
    const match = time.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
    return match !== null
  }, 'Hora de início inválida'),
  endTime: z.string().refine(time => {
    const match = time.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
    return match !== null
  }, 'Hora de fim inválida')
}).refine(data => timeToMinutes(data.startTime) < timeToMinutes(data.endTime), {
  message: 'Hora de início deve ser anterior à hora de fim',
  path: ['endTime']
})