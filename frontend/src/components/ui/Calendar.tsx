import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Circle, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './Button'

interface CalendarProps {
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  bookedDates?: Date[]
}

export const Calendar = ({ selectedDate, onDateSelect, bookedDates = [] }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => isSameDay(bookedDate, date))
  }

  const getDayClasses = (day: Date) => {
    let classes = 'w-10 h-10 flex items-center justify-center rounded-lg text-sm cursor-pointer transition-colors '
    
    if (isToday(day)) {
      classes += 'bg-blue-100 text-blue-700 font-semibold '
    }
    
    if (selectedDate && isSameDay(day, selectedDate)) {
      classes += 'bg-blue-600 text-white '
    } else if (isDateBooked(day)) {
      classes += 'bg-red-100 text-red-700 '
    } else {
      classes += 'hover:bg-gray-100 '
    }
    
    return classes
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="secondary"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <h3 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        
        <Button
          variant="secondary"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => (
          <div
            key={day.toISOString()}
            className={getDayClasses(day)}
            onClick={() => onDateSelect(day)}
          >
            {format(day, 'd')}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
        <div className="flex items-center space-x-1">
          <CheckCircle className="w-3 h-3 text-blue-600" />
          <span>Selecionado</span>
        </div>
        <div className="flex items-center space-x-1">
          <Circle className="w-3 h-3 text-red-500" />
          <span>Ocupado</span>
        </div>
        <div className="flex items-center space-x-1">
          <AlertCircle className="w-3 h-3 text-blue-500" />
          <span>Hoje</span>
        </div>
      </div>
    </div>
  )
}