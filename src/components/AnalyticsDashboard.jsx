import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react'

const AnalyticsDashboard = ({ meals, weightHistory }) => {
  const [gutScore, setGutScore] = useState(0)
  const [weeklyGutScore, setWeeklyGutScore] = useState([])
  const [monthlyBloating, setMonthlyBloating] = useState([])
  const [correlations, setCorrelations] = useState([])

  useEffect(() => {
    calculateGutScore()
    calculateGutTrends()
    findCorrelations()
  }, [meals, weightHistory])

  const calculateDailyGutScore = (dayMeals, hasEntry) => {
    if (!hasEntry || dayMeals.length === 0) return 0
    
    const safeItems = dayMeals.filter(m => {
      const item = m.item.toLowerCase()
      const bloatRisks = [
        'soda', 'pop', 'coke', 'pepsi', 'carbonated', 'fizzy',
        'chips', 'fries', 'pizza', 'burger', 'fast food',
        'candy', 'sweets', 'alcohol', 'beer'
      ]
      return !bloatRisks.some(risk => item.includes(risk))
    })
    const dietScore = (safeItems.length / dayMeals.length) * 40
    
    const positiveFeelings = ['Normal', 'Energized']
    const negativeFeelings = ['Bloated', 'Gassy', 'Heavy', 'Reflux']
    const positiveCount = dayMeals.filter(m => positiveFeelings.includes(m.feeling)).length
    const negativeCount = dayMeals.filter(m => negativeFeelings.includes(m.feeling)).length
    const totalFeelings = positiveCount + negativeCount
    const feelingScore = totalFeelings > 0 ? (positiveCount / totalFeelings) * 40 : 20
    
    const consistencyScore = dayMeals.length > 0 ? 20 : 0
    
    return Math.round(dietScore + feelingScore + consistencyScore)
  }

  const calculateGutScore = () => {
    const today = new Date()
    const dailyScores = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const dayMeals = meals.filter(m => {
        const mealDate = new Date(m.timestamp)
        mealDate.setHours(0, 0, 0, 0)
        return mealDate.getTime() === date.getTime()
      })
      
      const hasEntry = dayMeals.length > 0 || meals.some(m => {
        const mealDate = new Date(m.timestamp)
        mealDate.setHours(0, 0, 0, 0)
        return mealDate.getTime() === date.getTime()
      })
      
      const score = calculateDailyGutScore(dayMeals, hasEntry)
      dailyScores.push(score)
    }
    
    const avgScore = dailyScores.length > 0 
      ? Math.round(dailyScores.reduce((a, b) => a + b, 0) / dailyScores.length)
      : 0
    setGutScore(avgScore)
  }

  const calculateGutTrends = () => {
    const today = new Date()
    const weeklyData = []
    const monthlyData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const dayMeals = meals.filter(m => {
        const mealDate = new Date(m.timestamp)
        mealDate.setHours(0, 0, 0, 0)
        return mealDate.getTime() === date.getTime()
      })

      const hasEntry = dayMeals.length > 0
      const gutScore = calculateDailyGutScore(dayMeals, hasEntry)
      
      const positiveFeelings = ['Normal', 'Energized']
      const negativeFeelings = ['Bloated', 'Gassy', 'Heavy', 'Reflux']
      const positiveCount = dayMeals.filter(m => positiveFeelings.includes(m.feeling)).length
      const negativeCount = dayMeals.filter(m => negativeFeelings.includes(m.feeling)).length
      const feelingScore = positiveCount - negativeCount
      
      weeklyData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        gutScore,
        feelingScore
      })
    }

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - (i * 7) - 6)
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(today)
      weekEnd.setDate(weekEnd.getDate() - (i * 7))
      weekEnd.setHours(23, 59, 59, 999)

      const weekMeals = meals.filter(m => {
        const mealDate = new Date(m.timestamp)
        return mealDate >= weekStart && mealDate <= weekEnd
      })

      const bloatedCount = weekMeals.filter(m => m.feeling === 'Bloated').length
      monthlyData.push({
        week: `Week ${4 - i}`,
        count: bloatedCount
      })
    }

    setWeeklyGutScore(weeklyData)
    setMonthlyBloating(monthlyData)
  }

  const findCorrelations = () => {
    const itemBloating = {}
    
    meals.forEach(meal => {
      const item = meal.item.toLowerCase()
      if (!itemBloating[item]) {
        itemBloating[item] = { total: 0, bloated: 0 }
      }
      itemBloating[item].total++
      if (meal.feeling === 'Bloated') {
        itemBloating[item].bloated++
      }
    })

    const correlations = Object.entries(itemBloating)
      .filter(([_, data]) => data.total >= 2 && data.bloated > 0)
      .map(([item, data]) => ({
        item,
        percentage: Math.round((data.bloated / data.total) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)

    setCorrelations(correlations)
  }

  const getScoreColor = () => {
    if (gutScore >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (gutScore >= 60) return 'text-teal-600 dark:text-teal-400'
    if (gutScore >= 40) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBackground = () => {
    if (gutScore >= 80) return 'bg-emerald-100 dark:bg-emerald-900/30'
    if (gutScore >= 60) return 'bg-teal-100 dark:bg-teal-900/30'
    if (gutScore >= 40) return 'bg-amber-100 dark:bg-amber-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  const renderDualLineChart = (data) => {
    const maxGutScore = 100
    const maxFeelingScore = Math.max(...data.map(d => Math.abs(d.feelingScore)), 1)
    
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-center gap-4 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-gray-600 dark:text-gray-400">Gut Score</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            <span className="text-gray-600 dark:text-gray-400">Feeling Score</span>
          </div>
        </div>
        
        <div className="flex-1 flex items-end justify-between gap-2">
          {data.map((d, i) => {
            const gutHeight = (d.gutScore / maxGutScore) * 100
            const feelingHeight = (Math.abs(d.feelingScore) / maxFeelingScore) * 60
            const feelingColor = d.feelingScore >= 0 ? 'bg-yellow-400' : 'bg-red-400'
            const feelingShadow = d.feelingScore >= 0 
              ? '0 0 15px rgba(250, 204, 21, 0.5)' 
              : '0 0 15px rgba(248, 113, 113, 0.5)'
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="flex items-end justify-center gap-1 w-full">
                  <div 
                    className="w-1/2 rounded-t transition-all duration-300"
                    style={{ 
                      height: `${gutHeight}%`,
                      minHeight: gutHeight === 0 ? '4px' : 'auto',
                      backgroundColor: '#10b981',
                      boxShadow: gutHeight > 0 ? '0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.3)' : 'none'
                    }}
                  />
                  <div 
                    className="w-1/2 rounded-t transition-all duration-300"
                    style={{ 
                      height: `${feelingHeight}%`,
                      minHeight: feelingHeight === 0 ? '4px' : 'auto',
                      backgroundColor: feelingColor,
                      boxShadow: feelingHeight > 0 ? feelingShadow : 'none'
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{d.date}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderChart = (data) => {
    const maxCount = Math.max(...data.map(d => d.count), 1)
    
    return (
      <div className="flex items-end justify-between gap-2 h-full">
        {data.map((d, i) => {
          const barHeight = (d.count / maxCount) * 100
          const hasData = d.count > 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full rounded-t transition-all duration-300 ${hasData ? 'shadow-[0_0_15px_rgba(16,185,129,0.6)] shadow-emerald-500/50' : ''}`}
                style={{ 
                  height: `${barHeight}%`,
                  minHeight: barHeight === 0 ? '4px' : 'auto',
                  backgroundColor: hasData ? '#10b981' : '#e2e8f0',
                  boxShadow: hasData ? '0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{d.date || d.week}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-white/5 overflow-hidden transition-colors duration-300">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Gut Score</h2>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className={`${getScoreBackground()} rounded-2xl p-6 text-center`}>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Diet Compliance Score</p>
            <p className={`text-5xl font-bold ${getScoreColor()}`}>{gutScore}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {gutScore >= 80 ? 'Excellent!' : gutScore >= 60 ? 'Good progress!' : 'Room for improvement'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-white/5 overflow-hidden transition-colors duration-300">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Weekly Gut Progress</h2>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="h-40">
            {renderDualLineChart(weeklyGutScore)}
          </div>
        </div>
      </div>

      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-white/5 overflow-hidden transition-colors duration-300">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Monthly Trend</h2>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="h-32">
            {renderChart(monthlyBloating)}
          </div>
        </div>
      </div>

      {correlations.length > 0 && (
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-white/5 overflow-hidden transition-colors duration-300">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-white" />
              <h2 className="text-xl font-bold text-white">Potential Trigger Foods</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {correlations.map((correlation, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 capitalize">{correlation.item}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${correlation.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">{correlation.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard
