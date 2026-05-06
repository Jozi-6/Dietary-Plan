import { useState, useEffect } from 'react'
import { Ruler, Weight, TrendingUp, TrendingDown } from 'lucide-react'

const BiologicalMetrics = ({ onMetricsUpdate }) => {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bmi, setBMI] = useState(null)
  const [bmiCategory, setBMICategory] = useState('')
  const [weightHistory, setWeightHistory] = useState([])

  useEffect(() => {
    try {
      const savedHeight = localStorage.getItem('gutcheck_height')
      const savedWeight = localStorage.getItem('gutcheck_weight')
      const savedHistory = localStorage.getItem('gutcheck_weight_history')
      
      if (savedHeight) setHeight(savedHeight)
      if (savedWeight) setWeight(savedWeight)
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        if (Array.isArray(parsedHistory)) {
          setWeightHistory(parsedHistory)
        }
      }
    } catch (error) {
      console.error('Error loading metrics from localStorage:', error)
    }
  }, [])

  useEffect(() => {
    if (height && weight) {
      calculateBMI()
    }
  }, [height, weight])

  const calculateBMI = () => {
    if (!height || !weight) {
      setBMI(null)
      setBMICategory('')
      return
    }
    
    const heightInMeters = parseFloat(height) / 100
    const weightInKg = parseFloat(weight)
    
    if (!heightInMeters || !weightInKg || heightInMeters <= 0 || weightInKg <= 0) {
      setBMI(null)
      setBMICategory('')
      return
    }
    
    const bmiValue = weightInKg / (heightInMeters * heightInMeters)
    
    if (!isFinite(bmiValue)) {
      setBMI(null)
      setBMICategory('')
      return
    }
    
    setBMI(bmiValue.toFixed(1))
    
    let category = ''
    if (bmiValue < 18.5) category = 'Underweight'
    else if (bmiValue < 25) category = 'Normal'
    else if (bmiValue < 30) category = 'Overweight'
    else category = 'Obese'
    
    setBMICategory(category)
  }

  const handleSave = () => {
    try {
      const newEntry = {
        date: new Date().toISOString()
      }

      // Allow saving either height or weight individually
      if (weight) {
        newEntry.weight = parseFloat(weight)
      }
      if (height) {
        newEntry.height = parseFloat(height)
      }

      // Only add to history if at least one metric is provided
      if (weight || height) {
        const updatedHistory = [...weightHistory, newEntry]
        setWeightHistory(updatedHistory)
        localStorage.setItem('gutcheck_weight_history', JSON.stringify(updatedHistory))
      }

      // Save individual metrics to localStorage
      if (height) {
        localStorage.setItem('gutcheck_height', height)
      }
      if (weight) {
        localStorage.setItem('gutcheck_weight', weight)
      }

      // Notify parent component
      onMetricsUpdate && onMetricsUpdate({
        weightHistory: weightHistory
      })

      alert('Metrics saved successfully!')
    } catch (error) {
      console.error('Error saving metrics:', error)
    }
  }

  const getBMIColor = () => {
    if (!bmi) return { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-600 dark:text-gray-400' }
    const bmiValue = parseFloat(bmi)
    if (bmiValue < 18.5) return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' }
    if (bmiValue < 25) return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' }
    if (bmiValue < 30) return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' }
    return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' }
  }

  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null
    const recent = weightHistory.slice(-7)
    const firstWeight = recent[0].weight
    const lastWeight = recent[recent.length - 1].weight
    const diff = lastWeight - firstWeight
    
    if (diff > 0.5) return { trend: 'up', value: diff.toFixed(1) }
    if (diff < -0.5) return { trend: 'down', value: Math.abs(diff).toFixed(1) }
    return null
  }

  const weightTrend = getWeightTrend()

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-slate-700/50 overflow-hidden transition-colors duration-300">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <Weight className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold text-white">Biological Metrics</h2>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* BMI Display */}
        {bmi && (
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-emerald-100 dark:border-slate-600">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your BMI</p>
              <p className={`text-4xl font-bold ${getBMIColor().text}`}>{bmi}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getBMIColor().bg} ${getBMIColor().text}`}>
                {bmiCategory}
              </span>
            </div>
          </div>
        )}

        {/* Weight Trend */}
        {weightTrend && (
          <div className="flex items-center justify-center gap-2 text-sm">
            {weightTrend.trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-purple-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-purple-500" />
            )}
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              Weight {weightTrend.trend === 'up' ? 'up' : 'down'} {weightTrend.value}kg this week
            </span>
          </div>
        )}

        {/* Height Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Height (cm)
            </div>
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g., 175"
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all backdrop-blur placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Weight Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            <div className="flex items-center gap-2">
              <Weight className="w-4 h-4" />
              Weight (kg)
            </div>
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g., 70"
            step="0.1"
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all backdrop-blur placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
        >
          Save Metrics
        </button>
      </div>
    </div>
  )
}

export default BiologicalMetrics
