import bcrypt from 'bcryptjs'
import prisma from '../config/database'
import { safeLog } from './logger'

export async function createAdminIfNeeded() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@summithub.com' }
    })

    if (existingAdmin) {
      safeLog.info('✅ Admin user already exists')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@summithub.com',
        password: hashedPassword,
        cpf: '00000000000',
        phone: '(00) 00000-0000',
        company: 'Summit Hub',
        role: 'ADMIN'
      }
    })

    safeLog.info('✅ Admin user created successfully!')
    safeLog.info('📧 Email: admin@summithub.com')
    safeLog.info('🔑 Password: admin123')
    
  } catch (error) {
    safeLog.error('❌ Error creating admin user:', error)
  }
}