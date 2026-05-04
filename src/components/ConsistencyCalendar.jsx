import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'

const ConsistencyCalendar = ({ meals }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState([])

  useEffect(() => {
    generateCalendarDays()
  }, [currentDate, meals])

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startPadding = firstDay.getDay()
    const totalDays = lastDay.getDate()
    
    const days = []
    
    // Add padding for days before the first day of the month
    for (let i = 0; i < startPadding; i++) {
      days.push({ day: null, status: 'padding' })
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Add actual days
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day)
      date.setHours(0, 0, 0, 0)
      
      const isToday = date.getTime() === today.getTime()
      const isPast = date < today
      
      // Get meals for this day
      const dayMeals = meals.filter(meal => {
        const mealDate = new Date(meal.timestamp)
        mealDate.setHours(0, 0, 0, 0)
        return mealDate.getTime() === date.getTime()
      })
      
      let status = 'empty'
      
      if (dayMeals.length > 0) {
        // Check feelings
        const hasNegative = dayMeals.some(m => 
          m.feeling === 'Bloated' || m.feeling === 'Gassy' || m.feeling === 'Reflux'
        )
        const hasPositive = dayMeals.some(m => 
          m.feeling === 'Normal' || m.feeling === 'Energized'
        )
        
        if (hasNegative) {
          status = 'negative'
        } else if (hasPositive) {
          status = 'positive'
        } else {
          status = 'neutral'
        }
      } else if (isPast) {
        status = 'missing'
      }
      
      days.push({ day, status, date: date.toISOString(), isToday })
    }
    
    setCalendarDays(days)
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + direction)
      return newDate
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDayStyles = (day) => {
    if (day.status === 'padding') return 'opacity-0'
    if (day.isToday) return 'bg-white dark:bg-white border-2 border-emerald-500 text-gray-900 dark:text-gray-900'
    if (day.status === 'missing') return 'bg-gray-200 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500'
    if (day.status === 'positive') return 'bg-emerald-500 text-white'
    if (day.status === 'negative') return 'bg-red-500 text-white'
    if (day.status === 'neutral') return 'bg-emerald-200 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300'
    return 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-slate-700/50 overflow-hidden transition-colors duration-300">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(name => (
            <div key={name} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
              {name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-105 cursor-default ${getDayStyles(day)}`}
            >
              {day.status === 'missing' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                day.day
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-gray-600 dark:text-gray-400">Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Bad</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-800/50" />
            <span className="text-gray-600 dark:text-gray-400">Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700/50" />
            <span className="text-gray-600 dark:text-gray-400">Missing</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border-2 border-emerald-500" />
            <span className="text-gray-600 dark:text-gray-400">Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsistencyCalendar
