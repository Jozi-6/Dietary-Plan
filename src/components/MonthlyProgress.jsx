import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar } from 'lucide-react'

const MonthlyProgress = ({ meals, weightHistory }) => {
  const getBMIColor = (weight, height) => {
    if (!weight || !height) return '#8b5cf6' // Default purple if no data
    
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    
    if (bmi < 18.5) return '#eab308' // Yellow - Underweight
    if (bmi < 25) return '#22c55e' // Green - Normal
    if (bmi < 30) return '#f97316' // Orange - Overweight
    return '#ef4444' // Red - Obese
  }

  const generateMonthData = () => {
    const today = new Date()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const data = []
    
    // Get the most recent height from weightHistory
    const latestHeight = weightHistory.length > 0 
      ? weightHistory[weightHistory.length - 1].height 
      : null
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day)
      
      const dayMeals = meals.filter(m => {
        const mealDate = new Date(m.timestamp)
        return mealDate.getDate() === day && 
               mealDate.getMonth() === today.getMonth() &&
               mealDate.getFullYear() === today.getFullYear()
      })
      
      const dayWeightEntry = weightHistory.find(w => {
        const weightDate = new Date(w.date)
        return weightDate.getDate() === day && 
               weightDate.getMonth() === today.getMonth() &&
               weightDate.getFullYear() === today.getFullYear()
      })
      
      const weight = dayWeightEntry?.weight || null
      const height = dayWeightEntry?.height || latestHeight
      
      // Calculate Meal Safety %
      const bloatRisks = [
        'soda', 'pop', 'coke', 'pepsi', 'carbonated', 'fizzy',
        'chips', 'fries', 'pizza', 'burger', 'fast food',
        'candy', 'sweets', 'alcohol', 'beer',
        'beans', 'broccoli', 'cabbage', 'cauliflower',
        'dairy', 'milk', 'cheese', 'ice cream'
      ]
      const unsafeMeals = dayMeals.filter(m => 
        bloatRisks.some(risk => m.item.toLowerCase().includes(risk))
      ).length
      const mealSafety = dayMeals.length > 0 
        ? Math.round(((dayMeals.length - unsafeMeals) / dayMeals.length) * 100)
        : null
      
      // Calculate Feelings Score from symptom logs
      const daySymptoms = meals.filter(m => 
        m.type === 'symptom' && 
        new Date(m.timestamp).getDate() === day &&
        new Date(m.timestamp).getMonth() === today.getMonth() &&
        new Date(m.timestamp).getFullYear() === today.getFullYear()
      )
      const positiveFeelings = ['Normal', 'Energized', 'Happy']
      const negativeFeelings = ['Bloated', 'Gassy', 'Heavy', 'Reflux', 'Cramping']
      const positiveCount = daySymptoms.filter(m => positiveFeelings.includes(m.feeling)).length
      const negativeCount = daySymptoms.filter(m => negativeFeelings.includes(m.feeling)).length
      const feelingsScore = (positiveCount + negativeCount) > 0
        ? Math.round((positiveCount / (positiveCount + negativeCount)) * 10)
        : null
      
      data.push({
        day,
        feelingsScore,
        mealSafety,
        weight,
        height,
        weightColor: getBMIColor(weight, height)
      })
    }
    
    return data
  }

  const data = generateMonthData()

  // Get the latest weight color for the line
  const latestWeightColor = data.filter(d => d.weight).length > 0
    ? data.filter(d => d.weight).reverse()[0]?.weightColor
    : '#8b5cf6'

  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    if (payload.weight === null) return null
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={payload.weightColor}
        stroke={payload.weightColor}
        strokeWidth={2}
      />
    )
  }

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-white/10 overflow-hidden transition-colors duration-300">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold text-white">Monthly Progress</h2>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#6b7280"
                fontSize={12}
                domain={[0, 100]}
                label={{ value: '% / Score', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Weight (kg)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value, name, props) => {
                  if (name === 'Weight (kg)' && props.payload.weight !== null) {
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
                    return [`${value} kg (${bmiStatus})`, name]
                  }
                  return [value, name]
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="mealSafety" 
                stroke="#14b8a6" 
                strokeWidth={2}
                name="Meal Safety %"
                dot={{ r: 4 }}
                connectNullPoints={false}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="feelingsScore" 
                stroke="#f97316" 
                strokeWidth={2}
                name="Feelings Score (1-10)"
                dot={{ r: 4 }}
                connectNullPoints={false}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="weight" 
                stroke={latestWeightColor}
                strokeWidth={2}
                name="Weight (kg) - BMI Status"
                dot={<CustomDot />}
                connectNullPoints={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Underweight (&lt;18.5)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Normal (18.5-24.9)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-600 dark:text-gray-400">Overweight (25-29.9)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Obese (≥30)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonthlyProgress
