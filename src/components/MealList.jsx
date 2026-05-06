import { format } from 'date-fns'
import { Leaf, Flame, AlertTriangle, Clock, Trash2, Heart } from 'lucide-react'

const MealList = ({ meals, onUpdateMeal }) => {
  const formatTimeSince = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  const analyzeSafety = (item) => {
    const lowerItem = item?.toLowerCase() || ''
    
    // Bloat risk items (carbonated, high-sodium, high-sugar)
    const bloatRisks = [
      'soda', 'pop', 'coke', 'pepsi', 'sprite', 'fanta',
      'carbonated', 'fizzy', 'sparkling',
      'chips', 'fries', 'fast food', 'processed',
      'pizza', 'burger', 'hot dog',
      'candy', 'chocolate', 'sweets', 'dessert',
      'alcohol', 'beer', 'wine',
      'beans', 'broccoli', 'cabbage', 'cauliflower',
      'dairy', 'milk', 'cheese', 'ice cream'
    ]

    const safeItems = [
      'water', 'tea', 'coffee', 'herbal',
      'chicken', 'fish', 'salad', 'vegetables',
      'fruits', 'oatmeal', 'quinoa', 'rice',
      'yogurt', 'nuts', 'seeds'
    ]

    if (bloatRisks.some(risk => lowerItem.includes(risk))) {
      return { status: 'avoid', label: 'Bloat Risk', icon: Flame, color: 'red' }
    }
    
    if (safeItems.some(safe => lowerItem.includes(safe))) {
      return { status: 'safe', label: 'Safe', icon: Leaf, color: 'green' }
    }

    return { status: 'caution', label: 'Caution', icon: AlertTriangle, color: 'amber' }
  }

  const getSeverityColor = (severity) => {
    if (severity >= 8) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    if (severity >= 5) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
  }

  const getFeelingsColor = (feeling) => {
    const colors = {
      'Bloated': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      'Energized': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'Heavy': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      'Reflux': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      'Normal': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'Gassy': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      'Cramping': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      'Happy': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    }
    return colors[feeling] || 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
  }

  if (meals.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="bg-emerald-50 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
          <Clock className="w-8 h-8 text-emerald-400 dark:text-emerald-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">No entries today</h3>
        <p className="text-gray-400 dark:text-gray-500 transition-colors duration-300">Log meals or check-ins to see your timeline here</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-slate-800">
      {meals.map((meal, index) => {
        const isSymptom = meal.type === 'symptom'
        const safety = isSymptom ? null : analyzeSafety(meal.item)
        const SafetyIcon = safety ? safety.icon : Heart

        return (
          <div key={meal.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all">
            <div className="flex items-start gap-4">
              {index !== meals.length - 1 && (
                <div className="absolute left-8 mt-12 w-0.5 h-full bg-emerald-200 dark:bg-emerald-800" />
              )}

              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isSymptom ? 'bg-purple-100 dark:bg-purple-900/30' :
                safety.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                safety.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                'bg-amber-100 dark:bg-amber-900/30'
              } transition-colors duration-300`}>
                <SafetyIcon className={`w-5 h-5 ${
                  isSymptom ? 'text-purple-600 dark:text-purple-400' :
                  safety.color === 'green' ? 'text-green-600 dark:text-green-400' :
                  safety.color === 'red' ? 'text-red-600 dark:text-red-400' :
                  'text-amber-600 dark:text-amber-400'
                } transition-colors duration-300`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">
                      {isSymptom ? 'Check-in' : meal.item}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                      <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {format(new Date(meal.timestamp), 'h:mm a')}
                      </span>
                      {isSymptom ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 transition-colors duration-300">
                          Symptom Log
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          safety.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          safety.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        } transition-colors duration-300`}>
                          {safety.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isSymptom && (
                  <>
                    {meal.feeling && (
                      <div className="mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFeelingsColor(meal.feeling)}`}>
                          {meal.feeling}
                        </span>
                      </div>
                    )}
                    {meal.severity && (
                      <div className="mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(meal.severity)}`}>
                          Severity: {meal.severity}/10
                        </span>
                      </div>
                    )}
                    {meal.timeSinceLastMeal && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeSince(meal.timeSinceLastMeal.minutes)} after: {meal.timeSinceLastMeal.mealItem}
                        </span>
                      </div>
                    )}
                    {meal.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic transition-colors duration-300">
                          {meal.notes}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {!isSymptom && (
                  <>
                    {meal.feeling && (
                      <div className="mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFeelingsColor(meal.feeling)}`}>
                          Feeling: {meal.feeling}
                        </span>
                      </div>
                    )}
                    {meal.customFeeling && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400 italic transition-colors duration-300">
                          "{meal.customFeeling}"
                        </span>
                      </div>
                    )}
                    {meal.feeling === 'Bloated' && (
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors duration-300">
                        <p className="text-sm text-amber-800 dark:text-amber-300 transition-colors duration-300">
                          💡 You feel bloated after this meal. Try ginger tea and avoid similar foods for the next 24 hours.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MealList
