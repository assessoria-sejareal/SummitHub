import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@summithub.com' },
    update: {},
    create: {
      name: 'Admin',
      fullName: 'Administrador do Sistema',
      cpf: '00000000000',
      phone: '(11) 99999-9999',
      company: 'Summit Hub',
      email: 'admin@summithub.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  })

  // Get existing trader for test bookings
  const trader = await prisma.user.findFirst({
    where: { role: 'TRADER' }
  })

  // Create stations
  const stations = []
  for (let i = 1; i <= 6; i++) {
    const station = await prisma.station.upsert({
      where: { number: i },
      update: {},
      create: {
        number: i,
        status: 'ACTIVE'
      }
    })
    stations.push(station)
  }

  // Create test bookings only if trader exists
  if (trader) {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    await prisma.booking.create({
      data: {
        userId: trader.id,
        stationId: stations[0].id,
        seatId: '1-1',
        seatNumber: 1,
        date: tomorrow,
        startTime: '09:00',
        endTime: '12:00',
        cpf: trader.cpf,
        fullName: trader.fullName,
        status: 'ACTIVE'
      }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user created successfully')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })