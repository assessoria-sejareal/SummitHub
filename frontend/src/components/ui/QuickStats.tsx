import { motion } from 'framer-motion'
import { TrendingUp, Clock, Users, Activity } from 'lucide-react'

interface QuickStatsProps {
  stations: any[]
  userBookings: any[]
}

export const QuickStats = ({ stations, userBookings }: QuickStatsProps) => {
  const availableStations = stations.filter(s => s.isAvailableNow).length
  const totalStations = stations.filter(s => s.status === 'ACTIVE').length
  const activeBookings = userBookings.filter(b => b.status === 'ACTIVE').length
  const thisMonthBookings = userBookings.filter(b => {
    const bookingMonth = new Date(b.createdAt).getMonth()
    const currentMonth = new Date().getMonth()
    return bookingMonth === currentMonth
  }).length

  const stats = [
    {
      label: 'Estações Disponíveis',
      value: `${availableStations}/${totalStations}`,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Próxima Disponível',
      value: getNextAvailableTime(stations),
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Suas Reservas Ativas',
      value: activeBookings.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Reservas Este Mês',
      value: thisMonthBookings.toString(),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white p-4 rounded-lg shadow border"
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${stat.bgColor} mr-3`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

const getNextAvailableTime = (stations: any[]): string => {
  const availableNow = stations.find(s => s.isAvailableNow)
  if (availableNow) return 'Agora'
  
  const nextTimes = stations
    .filter(s => s.nextAvailable && s.nextAvailable !== 'Disponível' && s.nextAvailable !== 'Agora')
    .map(s => s.nextAvailable)
    .sort()
  
  return nextTimes[0] || 'N/A'
}