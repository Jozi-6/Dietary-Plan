import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'

const YearlyProgress = ({ meals, weightHistory }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [yearData, setYearData] = useState([])

  useEffect(() => {
    generateYearData()
  }, [currentYear, meals, weightHistory])

  const generateYearData = () => {
    const year = currentYear
    const data = []
    
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1)
      const monthEnd = new Date(year, month + 1, 0)
      
      const monthMeals = meals.filter(meal => {
        const mealDate = new Date(meal.timestamp)
        return mealDate >= monthStart && mealDate <= monthEnd
      })
      
      const totalMeals = monthMeals.length
      const bloatedMeals = monthMeals.filter(m => m.feeling === 'Bloated').length
      const complianceScore = totalMeals > 0 
        ? Math.round(((totalMeals - bloatedMeals) / totalMeals) * 100)
        : 0
      
      // Get average weight for the month
      const monthWeights = weightHistory.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= monthStart && entryDate <= monthEnd
      })
      
      const avgWeight = monthWeights.length > 0
        ? (monthWeights.reduce((sum, w) => sum + w.weight, 0) / monthWeights.length).toFixed(1)
        : null
      
      const weightChange = monthWeights.length > 1
        ? (monthWeights[monthWeights.length - 1].weight - monthWeights[0].weight).toFixed(1)
        : null
      
      // Calculate BMI for the month using historical height
      let avgBMI = null
      if (monthWeights.length > 0 && avgWeight && monthWeights[0].height) {
        const avgHeight = (monthWeights.reduce((sum, w) => sum + (w.height || 0), 0) / monthWeights.length)
        if (avgHeight > 0) {
          const heightInMeters = avgHeight / 100
          const bmiValue = parseFloat(avgWeight) / (heightInMeters * heightInMeters)
          avgBMI = isFinite(bmiValue) ? bmiValue.toFixed(1) : null
        }
      }
      
      data.push({
        month,
        monthName: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short' }),
        totalMeals,
        bloatedMeals,
        complianceScore,
        avgWeight,
        weightChange,
        avgBMI,
        hasData: totalMeals > 0
      })
    }
    
    setYearData(data)
  }

  const getComplianceColor = (score) => {
    if (score >= 80) return 'bg-emerald-500'
    if (score >= 60) return 'bg-emerald-400'
    if (score >= 40) return 'bg-amber-400'
    if (score > 0) return 'bg-red-400'
    return 'bg-gray-200 dark:bg-slate-700'
  }

  const navigateYear = (direction) => {
    setCurrentYear(prev => prev + direction)
  }

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-slate-700/50 overflow-hidden transition-colors duration-300">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Yearly Progress</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateYear(-1)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
            >
              ←
            </button>
            <span className="text-white font-semibold">{currentYear}</span>
            <button
              onClick={() => navigateYear(1)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Year at a Glance Grid */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Diet Compliance by Month</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
            {yearData.map((month, i) => (
              <div key={i} className="relative group">
                <div
                  className={`aspect-square rounded-lg ${getComplianceColor(month.complianceScore)} transition-all hover:scale-110 cursor-pointer`}
                  title={`${month.monthName}: ${month.complianceScore}% compliance`}
                />
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {month.monthName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Details Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400 font-medium">Month</th>
                <th className="text-center py-2 px-2 text-gray-600 dark:text-gray-400 font-medium">Meals</th>
                <th className="text-center py-2 px-2 text-gray-600 dark:text-gray-400 font-medium">Bloated</th>
                <th className="text-center py-2 px-2 text-gray-600 dark:text-gray-400 font-medium">Compliance</th>
                <th className="text-center py-2 px-2 text-gray-600 dark:text-gray-400 font-medium">Avg Weight</th>
                <th className="text-center py-2 px-2 text-gray-600 dark:text-gray-400 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {yearData.map((month, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-slate-800">
                  <td className="py-2 px-2 text-gray-700 dark:text-gray-300 font-medium">{month.monthName}</td>
                  <td className="py-2 px-2 text-center text-gray-600 dark:text-gray-400">{month.totalMeals}</td>
                  <td className="py-2 px-2 text-center text-gray-600 dark:text-gray-400">{month.bloatedMeals}</td>
                  <td className="py-2 px-2 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-white text-xs ${
                      month.complianceScore >= 80 ? 'bg-emerald-500' :
                      month.complianceScore >= 60 ? 'bg-emerald-400' :
                      month.complianceScore >= 40 ? 'bg-amber-400' :
                      month.complianceScore > 0 ? 'bg-red-400' : 'bg-gray-400'
                    }`}>
                      {month.complianceScore}%
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center text-gray-600 dark:text-gray-400">
                    {month.avgWeight || '-'}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {month.weightChange !== null && (
                      <span className={`${
                        parseFloat(month.weightChange) > 0 ? 'text-red-500' : 
                        parseFloat(month.weightChange) < 0 ? 'text-emerald-500' : 'text-gray-500'
                      }`}>
                        {parseFloat(month.weightChange) > 0 ? '+' : ''}{month.weightChange}kg
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-gray-600 dark:text-gray-400">80%+ Excellent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-400" />
            <span className="text-gray-600 dark:text-gray-400">60-79% Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-gray-600 dark:text-gray-400">40-59% Fair</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-400" />
            <span className="text-gray-600 dark:text-gray-400">&lt;40% Poor</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-200 dark:bg-slate-700" />
            <span className="text-gray-600 dark:text-gray-400">No Data</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default YearlyProgress
