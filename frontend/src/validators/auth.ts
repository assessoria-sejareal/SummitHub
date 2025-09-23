import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

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

export const registerSchema = z.object({
  fullName: z.string().min(5, 'Nome completo é obrigatório').max(100, 'Nome muito longo'),
  cpf: z.string().refine(validateCPF, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido').max(15, 'Telefone inválido'),
  company: z.string().min(2, 'Empresa/Corretora é obrigatória').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
})