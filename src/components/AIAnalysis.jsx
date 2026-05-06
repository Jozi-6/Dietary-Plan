import { Brain, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react'

const AIAnalysis = ({ meals, symptomCorrelations = [] }) => {
  // Comprehensive trigger database
  const triggerDatabase = {
    highSodium: [
      'processed meats', 'soy sauce', 'canned soups', 'pickles', 'olives', 'chips', 'crackers',
      'cheese', 'bacon', 'ham', 'sausage', 'hot dogs', 'salami', 'deli meats', 'canned tuna',
      'instant noodles', 'ramen', 'pretzels', 'popcorn', 'nuts', 'seeds', 'jerky'
    ],
    fodmaps: [
      'onions', 'garlic', 'wheat', 'beans', 'lentils', 'chickpeas', 'kidney beans',
      'broccoli', 'cabbage', 'cauliflower', 'brussels sprouts', 'apples', 'pears',
      'mango', 'peaches', 'plums', 'cherries', 'apricots', 'watermelon', 'milk', 'yogurt',
      'ice cream', 'soft cheese', 'honey', 'agave', 'high fructose corn syrup', 'artificial sweeteners'
    ],
    carbonation: [
      'soda', 'pop', 'coke', 'pepsi', 'sprite', 'fanta', 'mountain dew', 'dr pepper',
      'carbonated', 'fizzy', 'sparkling water', 'seltzer', 'club soda', 'tonic water'
    ],
    irritants: [
      'alcohol', 'beer', 'wine', 'coffee', 'tea', 'chocolate', 'spicy', 'curry',
      'hot sauce', 'pepper', 'cinnamon', 'fatty foods', 'fried foods'
    ]
  }

  // Gut-friendly foods for relief mode
  const gutFriendlyFoods = [
    'bananas', 'rice', 'plain rice', 'white rice', 'papaya', 'pineapple', 'blueberries',
    'strawberries', 'potatoes', 'carrots', 'zucchini', 'cucumber', 'lettuce', 'spinach',
    'chicken', 'turkey', 'fish', 'eggs', 'tofu', 'quinoa', 'oats', 'gluten-free bread'
  ]

  const calculateBloatScore = () => {
    // Only count actual meal entries for compliance calculation
    const mealEntries = meals.filter(meal => meal.type === 'meal')
    if (mealEntries.length === 0) return 0

    // Count meals flagged as caution (from MealList.jsx analysis)
    const cautionMeals = mealEntries.filter(meal => {
      const item = meal.item?.toLowerCase() || ''

      // High sodium items
      const highSodium = ['greasy', 'fried', 'processed', 'chips', 'crackers', 'bacon', 'ham', 'sausage', 'hot dog', 'salami', 'deli meat', 'canned soup', 'instant noodle', 'ramen', 'pretzel', 'popcorn', 'jerky']

      // FODMAP items
      const fodmaps = ['onion', 'garlic', 'wheat', 'bean', 'lentil', 'chickpea', 'kidney bean', 'broccoli', 'cabbage', 'cauliflower', 'brussels sprout', 'apple', 'pear', 'mango', 'peach', 'plum', 'cherry', 'apricot', 'watermelon', 'milk', 'yogurt', 'ice cream', 'soft cheese', 'honey', 'agave', 'artificial sweetener']

      // Carbonation
      const carbonated = ['soda', 'pop', 'coke', 'pepsi', 'sprite', 'fanta', 'mountain dew', 'dr pepper', 'carbonated', 'fizzy', 'sparkling water', 'seltzer', 'club soda', 'tonic water']

      // Other irritants
      const irritants = ['alcohol', 'beer', 'wine', 'coffee', 'tea', 'chocolate', 'spicy', 'curry', 'hot sauce', 'pepper', 'cinnamon', 'fatty', 'greasy']

      const allCaution = [...highSodium, ...fodmaps, ...carbonated, ...irritants]
      return allCaution.some(risk => item.includes(risk))
    }).length

    // Count negative symptoms to penalize compliance
    const negativeSymptoms = meals.filter(meal => meal.type === 'symptom' &&
      (meal.feeling === 'Bloated' || meal.feeling === 'Heavy' || meal.feeling === 'Gassy' ||
       meal.feeling === 'Cramps' || meal.feeling === 'Reflux')).length

    let adjustedScore = Math.round((1 - cautionMeals / mealEntries.length) * 100)

    // Reduce score for negative symptoms - even if no "bad" foods were eaten
    if (negativeSymptoms > 0) {
      adjustedScore = Math.max(0, adjustedScore - (negativeSymptoms * 20))
    }

    return adjustedScore
  }

  const getUnsafeMealCount = () => {
    const bloatRisks = [
      'soda', 'pop', 'coke', 'pepsi', 'carbonated', 'fizzy',
      'chips', 'fries', 'pizza', 'burger', 'fast food',
      'candy', 'sweets', 'alcohol', 'beer',
      'beans', 'broccoli', 'cabbage', 'cauliflower',
      'dairy', 'milk', 'cheese', 'ice cream'
    ]
    
    return meals.filter(meal => 
      bloatRisks.some(risk => meal.item?.toLowerCase()?.includes(risk))
    ).length
  }

  const getTriggerFoods = () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentMeals = meals.filter(meal => new Date(meal.timestamp) >= thirtyDaysAgo)

    const itemBloating = {}

    recentMeals.forEach(meal => {
      const item = meal.item?.toLowerCase() || ''
      if (!itemBloating[item]) {
        itemBloating[item] = { total: 0, unsafe: 0 }
      }
      itemBloating[item].total++
      const allTriggers = [
        ...triggerDatabase.highSodium,
        ...triggerDatabase.fodmaps,
        ...triggerDatabase.carbonation,
        ...triggerDatabase.irritants
      ]
      if (allTriggers.some(risk => item.includes(risk))) {
        itemBloating[item].unsafe++
      }
    })

    const correlations = Object.entries(itemBloating)
      .filter(([_, data]) => data.total >= 2 && data.unsafe > 0)
      .map(([item, data]) => ({
        item,
        percentage: Math.round((data.unsafe / data.total) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)

    return correlations
  }

  // Analyze meals 2-4 hours before bloating symptoms
  const getRecentBloatingTriggers = () => {
    const todayMeals = meals.filter(meal =>
      new Date(meal.timestamp).toDateString() === new Date().toDateString()
    )

    const bloatingSymptoms = todayMeals.filter(meal =>
      meal.type === 'symptom' &&
      (meal.feeling === 'Bloated' || meal.feeling === 'Heavy' || meal.feeling === 'Gassy')
    )

    if (bloatingSymptoms.length === 0) return null

    const symptomTimes = bloatingSymptoms.map(s => new Date(s.timestamp))

    // Find meals logged 2-4 hours before any bloating symptom
    const triggerMeals = todayMeals.filter(meal => {
      if (meal.type !== 'meal') return false

      const mealTime = new Date(meal.timestamp)
      return symptomTimes.some(symptomTime => {
        const timeDiff = (symptomTime - mealTime) / (1000 * 60 * 60) // hours
        return timeDiff >= 2 && timeDiff <= 4
      })
    })

    // Categorize triggers
    const triggers = []
    triggerMeals.forEach(meal => {
      const item = meal.item?.toLowerCase() || ''

      // High FODMAPs
      const fodmapTriggers = triggerDatabase.fodmaps.filter(trigger => item.includes(trigger))
      if (fodmapTriggers.length > 0) {
        triggers.push({
          food: meal.item,
          category: 'High FODMAP',
          examples: fodmapTriggers.slice(0, 2).join(', '),
          type: 'fodmap'
        })
      }

      // Dairy
      const dairyTriggers = ['milk', 'cheese', 'yogurt', 'cream', 'butter', 'ice cream']
      if (dairyTriggers.some(trigger => item.includes(trigger))) {
        triggers.push({
          food: meal.item,
          category: 'Dairy',
          examples: 'lactose-containing',
          type: 'dairy'
        })
      }

      // Carbonation
      if (triggerDatabase.carbonation.some(trigger => item.includes(trigger))) {
        triggers.push({
          food: meal.item,
          category: 'Carbonation',
          examples: 'bubbles and gas',
          type: 'carbonation'
        })
      }

      // Cruciferous veggies
      const cruciferous = ['broccoli', 'cabbage', 'cauliflower', 'brussels sprouts']
      if (cruciferous.some(trigger => item.includes(trigger))) {
        triggers.push({
          food: meal.item,
          category: 'Cruciferous Vegetable',
          examples: 'sulfur compounds',
          type: 'cruciferous'
        })
      }
    })

    return triggers.length > 0 ? triggers[0] : null // Return the first trigger found
  }

  const getDailySummary = () => {
    const bloatScore = calculateBloatScore()
    const unsafeMeals = getUnsafeMealCount()
    const triggerFoods = getTriggerFoods()
    const recentTrigger = getRecentBloatingTriggers()

    let status, statusColor, recommendation

    // Check for recent bloating symptoms first - highest priority
    if (recentTrigger) {
      status = 'Bloating Detected'
      statusColor = 'red'

      const reliefDrinks = ['peppermint tea', 'ginger tea', 'chamomile tea', 'fennel tea', 'plain water']
      const nextMealFoods = ['grilled chicken', 'white rice', 'bananas', 'papaya', 'blueberries', 'eggs', 'fish']

      const randomDrink = reliefDrinks[Math.floor(Math.random() * reliefDrinks.length)]
      const randomFood = nextMealFoods[Math.floor(Math.random() * nextMealFoods.length)]

      recommendation = `Potential Culprit: You logged "${recentTrigger.food}" earlier, which contains ${recentTrigger.examples} that can often cause bloating.

      Immediate Relief: Try drinking ${randomDrink} or taking a short walk to help reduce discomfort.

      Next Meal Advice: Consider ${randomFood} for your next log - these are typically easier on the digestive system.`

      return { bloatScore, unsafeMeals, status, statusColor, recommendation, triggerFoods, timingPatterns: symptomCorrelations, recentTrigger }
    }

    // Default status based on compliance score
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

    // Check for caution meals in today's log
    const todayCautionMeals = meals.filter(meal => {
      if (meal.type !== 'meal') return false
      const item = meal.item?.toLowerCase() || ''
      const cautionFoods = ['greasy', 'fried', 'processed', 'chips', 'crackers', 'bacon', 'ham', 'sausage', 'hot dog', 'salami', 'deli meat', 'canned soup', 'instant noodle', 'ramen', 'pretzel', 'popcorn', 'jerky', 'onion', 'garlic', 'wheat', 'bean', 'lentil', 'chickpea', 'kidney bean', 'broccoli', 'cabbage', 'cauliflower', 'brussels sprout', 'apple', 'pear', 'mango', 'peach', 'plum', 'cherry', 'apricot', 'watermelon', 'milk', 'yogurt', 'ice cream', 'soft cheese', 'honey', 'agave', 'artificial sweetener', 'soda', 'pop', 'coke', 'pepsi', 'sprite', 'fanta', 'mountain dew', 'dr pepper', 'carbonated', 'fizzy', 'sparkling water', 'seltzer', 'club soda', 'tonic water', 'alcohol', 'beer', 'wine', 'coffee', 'tea', 'chocolate', 'spicy', 'curry', 'hot sauce', 'pepper', 'cinnamon', 'fatty', 'greasy']
      return cautionFoods.some(risk => item.includes(risk))
    })

    if (todayCautionMeals.length > 0) {
      const cautionItem = todayCautionMeals[0].item
      const alternatives = {
        'greasy meat': 'grilled chicken or baked fish',
        'fried food': 'baked or steamed vegetables',
        'processed food': 'fresh vegetables or lean protein',
        'chips': 'fresh fruit or nuts',
        'soda': 'water or herbal tea',
        'dairy': 'lactose-free alternatives',
        'onion': 'celery or cucumber',
        'garlic': 'herbs like basil or oregano',
        'wheat': 'rice or quinoa',
        'bean': 'rice or potatoes'
      }

      const alternative = Object.keys(alternatives).find(key => cautionItem.toLowerCase().includes(key)) ?
        alternatives[Object.keys(alternatives).find(key => cautionItem.toLowerCase().includes(key))] :
        'a lighter, whole-food alternative'

      recommendation = `I noticed you logged "${cautionItem}" which can be tough on digestion. For your next meal, consider trying ${alternative} to see if it feels better.`
    }

    // Check for high-percentage trigger foods (long-term patterns)
    else if (triggerFoods.length > 0 && triggerFoods[0].percentage >= 50) {
      recommendation = `I noticed your Gut Score drops and your Feeling Score gets worse (yellow line in your chart) every time you log "${triggerFoods[0].item}". Try eliminating that for a week to see improvement.`
    }

    // Check for timing patterns (existing symptom correlations)
    const timingPatterns = symptomCorrelations.filter(c =>
      c.feeling === 'Bloated' || c.feeling === 'Heavy' || c.feeling === 'Gassy'
    )

    if (timingPatterns.length > 0) {
      const pattern = timingPatterns[0]
      const timeStr = pattern.avgTimeMinutes < 60
        ? `${pattern.avgTimeMinutes} minutes`
        : `${Math.round(pattern.avgTimeMinutes / 60)} hours`

      recommendation = `Hey, you usually feel ${pattern.feeling.toLowerCase()} about ${timeStr} after eating ${pattern.mealItem}. Check your Feelings Trends to see patterns over time.`
    }

    return { bloatScore, unsafeMeals, status, statusColor, recommendation, triggerFoods, timingPatterns }
  }

  const summary = getDailySummary()

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-slate-700/50 overflow-hidden transition-colors duration-300">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold text-white">AI Analysis</h2>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Bloat Score */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mb-3">
            <span className="text-3xl font-bold text-white">{summary.bloatScore}%</span>
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white transition-colors duration-300">Diet Compliance</h3>
          <p className={`text-sm font-medium mt-1 ${
            summary.statusColor === 'green' ? 'text-green-600 dark:text-green-400' :
            summary.statusColor === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
            summary.statusColor === 'amber' ? 'text-amber-600 dark:text-amber-400' :
            'text-red-600 dark:text-red-400'
          } transition-colors duration-300`}>
            {summary.status}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 text-center transition-colors duration-300">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-colors duration-300" />
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 transition-colors duration-300">{meals.length}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">Meals Logged</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 text-center transition-colors duration-300">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 transition-colors duration-300" />
              <span className="text-2xl font-bold text-red-600 dark:text-red-400 transition-colors duration-300">{summary.unsafeMeals}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">Symptom Warnings</p>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800 transition-colors duration-300">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-1 transition-colors duration-300">Next Steps</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">{summary.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Insights */}
        {meals.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 transition-colors duration-300">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-colors duration-300" />
              Today's Insights
            </h4>
            
            {meals.some(m => m.item?.toLowerCase()?.includes('soda')) && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-red-500 dark:text-red-400">⚠️</span>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Carbonated drinks like soda can cause bloating. Try sparkling water instead.</p>
              </div>
            )}
            
            {meals.some(m => m.item?.toLowerCase()?.includes('dairy') && m.feeling === 'Bloated') && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-amber-500 dark:text-amber-400">💡</span>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">You felt bloated after dairy. Consider lactose-free alternatives.</p>
              </div>
            )}
            
            {summary.bloatScore >= 80 && meals.length >= 3 && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-500 dark:text-green-400">✓</span>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Excellent food choices today! Your stomach will thank you.</p>
              </div>
            )}

            {/* Trigger Foods Insights */}
            {summary.triggerFoods.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 transition-colors duration-300 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 transition-colors duration-300" />
                  Potential Trigger Foods (30 days)
                </h4>
                {summary.triggerFoods.map((trigger, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm mb-2">
                    <span className="text-red-500 dark:text-red-400">•</span>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      <span className="font-medium capitalize">{trigger.item}</span>: {trigger.percentage}% flagged as unsafe
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AIAnalysis
