import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Activity, Target, Calendar } from 'lucide-react'
import { chartConfig } from '../utils/chartConfig'

const AnalyticsDashboard = ({ meals, weightHistory }) => {
  const [gutScore, setGutScore] = useState(0)
  const [weeklyGutScore, setWeeklyGutScore] = useState([])
  const [correlations, setCorrelations] = useState([])

  const getBMIColor = (weight, height) => {
    if (!weight || !height) return '#8b5cf6'
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    if (bmi < 18.5) return '#eab308'
    if (bmi < 25) return '#22c55e'
    if (bmi < 30) return '#f97316'
    return '#ef4444'
  }

  useEffect(() => {
    calculateGutScore()
    calculateGutTrends()
    findCorrelations()
  }, [meals, weightHistory])

  const calculateDailyGutScore = (dayMeals, hasEntry) => {
    if (!hasEntry || dayMeals.length === 0) return 0
    const safeItems = dayMeals.filter(m => {
      const item = m.item?.toLowerCase() || ''
      const bloatRisks = ['soda', 'pop', 'coke', 'pepsi', 'carbonated', 'fizzy', 'chips', 'fries', 'pizza', 'burger', 'fast food', 'candy', 'sweets', 'alcohol', 'beer']
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
    const avgScore = dailyScores.length > 0 ? Math.round(dailyScores.reduce((a, b) => a + b, 0) / dailyScores.length) : 0
    setGutScore(avgScore)
  }

  const calculateGutTrends = () => {
    const today = new Date()
    const weeklyData = []
    const latestHeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].height : null

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
      const bloatRisks = ['soda', 'pop', 'coke', 'pepsi', 'carbonated', 'fizzy', 'chips', 'fries', 'pizza', 'burger', 'fast food', 'candy', 'sweets', 'alcohol', 'beer', 'beans', 'broccoli', 'cabbage', 'cauliflower', 'dairy', 'milk', 'cheese', 'ice cream']
      const unsafeMeals = dayMeals.filter(m => bloatRisks.some(risk => m.item?.toLowerCase()?.includes(risk))).length
      const mealSafety = dayMeals.length > 0 ? Math.round(((dayMeals.length - unsafeMeals) / dayMeals.length) * 100) : 0
      const daySymptoms = meals.filter(m => m.type === 'symptom' && new Date(m.timestamp).toDateString() === date.toDateString())
      const positiveFeelings = ['Normal', 'Energized', 'Happy']
      const negativeFeelings = ['Bloated', 'Gassy', 'Heavy', 'Reflux', 'Cramping']
      const positiveCount = daySymptoms.filter(m => positiveFeelings.includes(m.feeling)).length
      const negativeCount = daySymptoms.filter(m => negativeFeelings.includes(m.feeling)).length
      const feelingsScore = (positiveCount + negativeCount) > 0 ? Math.round((positiveCount / (positiveCount + negativeCount)) * 10) : 5
      const dayWeightEntry = weightHistory.find(w => new Date(w.date).toDateString() === date.toDateString())
      const dayWeight = dayWeightEntry?.weight || null
      const dayHeight = dayWeightEntry?.height || latestHeight
      weeklyData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        gutScore,
        feelingScore: feelingsScore,
        mealSafety,
        weight: dayWeight,
        height: dayHeight,
        weightColor: getBMIColor(dayWeight, dayHeight)
      })
    }
    setWeeklyGutScore(weeklyData)
  }

  const findCorrelations = () => {
    const itemBloating = {}
    meals.forEach(meal => {
      const item = meal.item?.toLowerCase() || ''
      if (!itemBloating[item]) {
        itemBloating[item] = { total: 0, bloated: 0 }
      }
      itemBloating[item].total++
      if (meal.feeling === 'Bloated') {
        itemBloating[item].bloated++
      }
    })
    const correlations = Object.entries(itemBloating).filter(([_, data]) => data.total >= 2 && data.bloated > 0).map(([item, data]) => ({ item, percentage: Math.round((data.bloated / data.total) * 100) })).sort((a, b) => b.percentage - a.percentage).slice(0, 5)
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

  const renderTripleLineChart = (data) => {
    const latestWeightColor = data.filter(d => d.weight).length > 0 ? data.filter(d => d.weight).reverse()[0]?.weightColor : '#8b5cf6'
    const CustomDot = (props) => {
      const { cx, cy, payload } = props
      if (payload.weight === null) return null
      return <circle cx={cx} cy={cy} r={4} fill={payload.weightColor} stroke={payload.weightColor} strokeWidth={2} />
    }
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
          <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
          <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} domain={[0, 100]} />
          <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(value, name, props) => {
            if (name === 'Weight (kg) - BMI Status' && props.payload.weight !== null) {
              const height = props.payload.height
              const weight = props.payload.weight
              let bmiStatus = 'Unknown'
              if (height && weight) {
                const bmi = weight / ((height / 100) ** 2)
                if (bmi < 18.5) bmiStatus = 'Underweight'
                else if (bmi < 25) bmiStatus = 'Normal'
                else if (bmi < 30) bmiStatus = 'Overweight'
                else bmiStatus = 'Obese'
              }
              return [value + ' kg (' + bmiStatus + ')', name]
            }
            return [value, name]
          }} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="mealSafety" stroke="#14b8a6" strokeWidth={2} name="Meal Safety %" dot={{ r: 4 }} />
          <Line yAxisId="left" type="monotone" dataKey="feelingScore" stroke="#f97316" strokeWidth={2} name="Feelings Score (1-10)" dot={{ r: 4 }} />
          <Line yAxisId="right" type="monotone" dataKey="weight" stroke={latestWeightColor} strokeWidth={2} name="Weight (kg) - BMI Status" dot={<CustomDot />} connectNullPoints={false} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-white/10 overflow-hidden transition-colors duration-300">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Gut Health Score</h2>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="text-center">
            <div className={'inline-flex items-center justify-center w-24 h-24 rounded-full ' + getScoreBackground() + ' mb-3'}>
              <span className={'text-3xl font-bold ' + getScoreColor()}>{gutScore}</span>
            </div>
            <p className={'text-sm font-medium ' + getScoreColor()}>
              {gutScore >= 80 ? 'Excellent' : gutScore >= 60 ? 'Good' : gutScore >= 40 ? 'Fair' : 'Needs Improvement'}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-white/10 overflow-hidden transition-colors duration-300">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Weekly Progress</h2>
          </div>
        </div>
        <div className="p-4 sm:p-6 min-h-[300px]">
          <div className="h-64">{renderTripleLineChart(weeklyGutScore)}</div>
        </div>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /><span className="text-gray-600 dark:text-gray-400">Underweight (&lt;18.5)</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-gray-600 dark:text-gray-400">Normal (18.5-24.9)</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500" /><span className="text-gray-600 dark:text-gray-400">Overweight (25-29.9)</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-gray-600 dark:text-gray-400">Obese (≥30)</span></div>
          </div>
        </div>
      </div>
      {correlations.length > 0 && (
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-white/10 overflow-hidden transition-colors duration-300">
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
                      <div className="h-full bg-red-500 rounded-full" style={{ width: correlation.percentage + '%' }} />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{correlation.percentage}%</span>
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
