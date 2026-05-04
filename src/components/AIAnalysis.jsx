import { Brain, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react'

const AIAnalysis = ({ meals }) => {
  const calculateBloatScore = () => {
    if (meals.length === 0) return 0
    
    const bloatRiskMeals = meals.filter(meal => {
      const item = meal.item.toLowerCase()
      const bloatRisks = [
        'soda', 'pop', 'coke', 'pepsi', 'carbonated', 'fizzy',
        'chips', 'fries', 'pizza', 'burger', 'fast food',
        'candy', 'sweets', 'alcohol', 'beer'
      ]
      return bloatRisks.some(risk => item.includes(risk))
    })

    return Math.round((1 - bloatRiskMeals.length / meals.length) * 100)
  }

  const getDailySummary = () => {
    const bloatScore = calculateBloatScore()
    const bloatedMeals = meals.filter(m => m.feeling === 'Bloated').length
    
    let status, statusColor, recommendation
    
    if (bloatScore >= 80) {
      status = 'Excellent'
      statusColor = 'green'
      recommendation = 'Great job! Your diet is very clean. Keep it up!'
    } else if (bloatScore >= 60) {
      status = 'Good'
      statusColor = 'emerald'
      recommendation = 'Doing well! Try to reduce processed foods for even better results.'
    } else if (bloatScore >= 40) {
      status = 'Fair'
      statusColor = 'amber'
      recommendation = 'Consider swapping soda for water and reducing processed snacks.'
    } else {
      status = 'Needs Improvement'
      statusColor = 'red'
      recommendation = 'Focus on whole foods and avoid carbonated drinks to reduce bloating.'
    }

    return { bloatScore, bloatedMeals, status, statusColor, recommendation }
  }

  const summary = getDailySummary()

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold text-white">AI Analysis</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Bloat Score */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mb-3">
            <span className="text-3xl font-bold text-white">{summary.bloatScore}%</span>
          </div>
          <h3 className="font-semibold text-gray-800">Diet Compliance</h3>
          <p className={`text-sm font-medium mt-1 ${
            summary.statusColor === 'green' ? 'text-green-600' :
            summary.statusColor === 'emerald' ? 'text-emerald-600' :
            summary.statusColor === 'amber' ? 'text-amber-600' :
            'text-red-600'
          }`}>
            {summary.status}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-600">{meals.length}</span>
            </div>
            <p className="text-xs text-gray-600">Meals Logged</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{summary.bloatedMeals}</span>
            </div>
            <p className="text-xs text-gray-600">Bloated Episodes</p>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Next Steps</h4>
              <p className="text-sm text-gray-600">{summary.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Insights */}
        {meals.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Today's Insights
            </h4>
            
            {meals.some(m => m.item.toLowerCase().includes('soda')) && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-red-500">⚠️</span>
                <p className="text-gray-600">Carbonated drinks like soda can cause bloating. Try sparkling water instead.</p>
              </div>
            )}
            
            {meals.some(m => m.item.toLowerCase().includes('dairy') && m.feeling === 'Bloated') && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-amber-500">💡</span>
                <p className="text-gray-600">You felt bloated after dairy. Consider lactose-free alternatives.</p>
              </div>
            )}
            
            {summary.bloatScore >= 80 && meals.length >= 3 && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <p className="text-gray-600">Excellent food choices today! Your stomach will thank you.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AIAnalysis
