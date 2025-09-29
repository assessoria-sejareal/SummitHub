import { Request, Response } from 'express'
import prisma from '../../config/database'
import { hashPassword, comparePassword } from '../../helpers/bcrypt'
import { generateToken } from '../../helpers/jwt'
import { AppError, handleError } from '../../helpers/errors'
import { loginSchema, registerSchema } from '../../validators/auth'

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      console.log('Register request body:', req.body)
      const { fullName, cpf, phone, company, email, password } = registerSchema.parse(req.body)

      // Verificar email duplicado
      const existingEmail = await prisma.user.findUnique({ where: { email } })
      if (existingEmail) {
        throw new AppError('Email já cadastrado', 400)
      }

      // Verificar CPF duplicado
      const existingCPF = await prisma.user.findUnique({ where: { cpf: cpf.replace(/\D/g, '') } })
      if (existingCPF) {
        throw new AppError('CPF já cadastrado', 400)
      }

      const hashedPassword = await hashPassword(password)
      
      const user = await prisma.user.create({
        data: { 
          name: fullName.split(' ')[0], // Primeiro nome para compatibilidade
          fullName,
          cpf: cpf.replace(/\D/g, ''),
          phone: phone.replace(/\D/g, ''),
          company,
          email, 
          password: hashedPassword 
        },
        select: { id: true, name: true, fullName: true, cpf: true, phone: true, company: true, email: true, role: true, createdAt: true }
      })

      const token = generateToken(user.id)

      res.status(201).json({ user, token })
    } catch (error: any) {
      console.error('Register error:', error)
      const { message, statusCode } = handleError(error)
      res.status(statusCode).json({ message })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body)

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        throw new AppError('Credenciais inválidas', 401)
      }

      const isValidPassword = await comparePassword(password, user.password)
      if (!isValidPassword) {
        throw new AppError('Credenciais inválidas', 401)
      }

      const token = generateToken(user.id)
      const { password: _, ...userWithoutPassword } = user

      res.json({ user: userWithoutPassword, token })
    } catch (error: any) {
      const { message, statusCode } = handleError(error)
      res.status(statusCode).json({ message })
    }
  }
}