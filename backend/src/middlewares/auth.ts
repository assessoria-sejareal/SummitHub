import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../helpers/jwt'
import { AppError } from '../helpers/errors'
import prisma from '../config/database'
import { userCache } from '../utils/cache'

export interface AuthRequest extends Request {
  userId?: string
  user?: any
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      throw new AppError('Token não fornecido', 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      throw new AppError('Token inválido', 401)
    }
    
    // Try cache first
    let user = userCache.get(decoded.userId)
    if (!user) {
      user = await prisma.user.findUnique({ where: { id: decoded.userId } })
      if (!user) {
        throw new AppError('Usuário não encontrado', 401)
      }
      userCache.set(decoded.userId, user, 300000) // 5 min cache
    }

    req.userId = decoded.userId
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
}

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso negado - Admin necessário' })
  }
  next()
}

// Aliases for admin routes
export const authenticateToken = authMiddleware
export const requireAdmin = adminMiddleware