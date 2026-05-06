import { useState, useEffect } from 'react'
import { Plus, Leaf, Flame, AlertTriangle, MessageCircle, Clock, Calendar, Moon, Sun, LayoutGrid, BarChart3, Heart } from 'lucide-react'
import QuickLog from './components/QuickLog'
import QuickCheckIn from './components/QuickCheckIn'
import MealList from './components/MealList'
import AIAnalysis from './components/AIAnalysis'
import AIChat from './components/AIChat'
import ConsistencyCalendar from './components/ConsistencyCalendar'
import BiologicalMetrics from './components/BiologicalMetrics'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import MonthlyProgress from './components/MonthlyProgress'
import YearlyProgress from './components/YearlyProgress'
import { ThemeProvider, useTheme } from './context/ThemeContext'

function AppContent() {
  const [meals, setMeals] = useState([])
  const [activeView, setActiveView] = useState('dashboard')
  const [weightHistory, setWeightHistory] = useState([])
  const { theme, toggleTheme } = useTheme()

  // Load meals and weight history from localStorage on mount
  useEffect(() => {
    try {
      const savedMeals = localStorage.getItem('gutcheck_meals')
      if (savedMeals) {
        const parsedMeals = JSON.parse(savedMeals)
        if (Array.isArray(parsedMeals)) {
          setMeals(parsedMeals)
        }
      }
      
      const savedWeightHistory = localStorage.getItem('gutcheck_weight_history')
      if (savedWeightHistory) {
        const parsedHistory = JSON.parse(savedWeightHistory)
        if (Array.isArray(parsedHistory)) {
          setWeightHistory(parsedHistory)
        }
      }

      // Check for logging gaps and create placeholders
      checkLoggingGaps()
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
    }
  }, [])

  // Save meals to localStorage whenever they change
  useEffect(() => {
    try {
      if (meals.length > 0) {
        localStorage.setItem('gutcheck_meals', JSON.stringify(meals))
      }
    } catch (error) {
      console.error('Error saving meals to localStorage:', error)
    }
  }, [meals])

  const addMeal = (mealData) => {
    const newMeal = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: 'meal',
      ...mealData
    }
    setMeals([newMeal, ...meals])
  }

  const addSymptomLog = (symptomData) => {
    // Calculate time since last meal
    const lastMeal = meals.find(m => m.type === 'meal' && !m.isPlaceholder)
    const timeSinceLastMeal = lastMeal ? {
      minutes: Math.round((Date.now() - new Date(lastMeal.timestamp).getTime()) / 60000),
      mealItem: lastMeal.item
    } : null

    const newSymptom = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: 'symptom',
      timeSinceLastMeal,
      ...symptomData
    }
    setMeals([newSymptom, ...meals])
  }

  const updateMeal = (id, updates) => {
    setMeals(meals.map(meal => 
      meal.id === id ? { ...meal, ...updates } : meal
    ))
  }

  const getTodayMeals = () => {
    const today = new Date().toDateString()
    return meals.filter(meal => new Date(meal.timestamp).toDateString() === today)
  }

  const getSymptomMealCorrelations = () => {
    const symptomLogs = meals.filter(m => m.type === 'symptom' && m.timeSinceLastMeal)
    
    const correlations = {}
    
    symptomLogs.forEach(symptom => {
      if (!symptom.timeSinceLastMeal) return
      
      const mealItem = symptom.timeSinceLastMeal.mealItem
      const timeMinutes = symptom.timeSinceLastMeal.minutes
      const feeling = symptom.feeling
      
      const key = `${mealItem}-${feeling}`
      if (!correlations[key]) {
        correlations[key] = {
          mealItem,
          feeling,
          times: [],
          count: 0
        }
      }
      
      correlations[key].times.push(timeMinutes)
      correlations[key].count++
    })
    
    return Object.values(correlations).map(correlation => ({
      mealItem: correlation.mealItem,
      feeling: correlation.feeling,
      avgTimeMinutes: Math.round(correlation.times.reduce((a, b) => a + b, 0) / correlation.times.length),
      count: correlation.count
    })).filter(c => c.count >= 2)
  }

  const handleMetricsUpdate = (metrics) => {
    if (metrics.weightHistory) {
      setWeightHistory(metrics.weightHistory)
    }
  }

  const checkLoggingGaps = () => {
    try {
      const savedMeals = localStorage.getItem('gutcheck_meals')
      if (!savedMeals) return

      const meals = JSON.parse(savedMeals)
      if (!meals || meals.length === 0) return

      // Filter out placeholders when checking for last real meal
      const realMeals = meals.filter(m => !m.isPlaceholder)
      if (realMeals.length === 0) return

      // Get the most recent meal date
      const lastMealDate = new Date(realMeals[0].timestamp)
      if (isNaN(lastMealDate.getTime())) return
      
      lastMealDate.setHours(0, 0, 0, 0)
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Calculate the gap in days
      const gapInDays = Math.floor((today - lastMealDate) / (1000 * 60 * 60 * 24))

      // If there's a gap of more than 1 day, create placeholder entries
      if (gapInDays > 1) {
        const placeholders = []
        for (let i = 1; i < gapInDays; i++) {
          const placeholderDate = new Date(lastMealDate)
          placeholderDate.setDate(placeholderDate.getDate() + i)
          
          placeholders.push({
            id: `placeholder-${Date.now()}-${i}`,
            timestamp: placeholderDate.toISOString(),
            item: 'No meals logged',
            feeling: 'Missed',
            isPlaceholder: true
          })
        }

        if (placeholders.length > 0) {
          const updatedMeals = [...placeholders, ...meals]
          localStorage.setItem('gutcheck_meals', JSON.stringify(updatedMeals))
          setMeals(updatedMeals)
        }
      }
    } catch (error) {
      console.error('Error checking logging gaps:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm dark:shadow-slate-900/50 border-b border-emerald-100 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">GutCheck</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Track your intake, achieve a flat stomach</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`p-2 rounded-lg font-medium transition-all ${
                  activeView === 'dashboard'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
                aria-label="Dashboard"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveView('stats')}
                className={`p-2 rounded-lg font-medium transition-all ${
                  activeView === 'stats'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
                aria-label="Stats"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveView('chat')}
                className={`p-2 rounded-lg font-medium transition-all ${
                  activeView === 'chat'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
                aria-label="AI Chat"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>{getSymptomMealCorrelations()} 
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-6 sm:pb-8">
        {activeView === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Quick Log and Meal List */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Quick Check-in Button */}
              <button
                onClick={() => setActiveView('checkin')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Heart className="w-5 h-5" />
                How are you feeling right now?
              </button>

              {/* Quick Log */}
              <QuickLog onAddMeal={addMeal} />

              {/* Today's Meals */}
              <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-slate-700/50 overflow-hidden transition-colors duration-300">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-white" />
                    <h2 className="text-xl font-bold text-white">Today's Timeline</h2>
                    <span className="text-emerald-100 text-sm ml-auto">
                      {getTodayMeals().length} entries
                    </span>
                  </div>
                </div>
                <MealList meals={getTodayMeals()} onUpdateMeal={updateMeal} />
              </div>
            </div>

            {/* Right Column - AI Analysis */}
            <div className="lg:col-span-1">
              <AIAnalysis meals={getTodayMeals()} />
            </div>
          </div>
        ) : activeView === 'checkin' ? (
          <QuickCheckIn onAddSymptom={addSymptomLog} />
        ) : activeView === 'stats' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Analytics */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <MonthlyProgress meals={meals} weightHistory={weightHistory} />
              <AnalyticsDashboard meals={meals} weightHistory={weightHistory} />
              <YearlyProgress meals={meals} weightHistory={weightHistory} />
            </div>

            {/* Right Column - Calendar and Metrics */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <ConsistencyCalendar meals={meals} />
              <BiologicalMetrics onMetricsUpdate={handleMetricsUpdate} />
            </div>
          </div>
        ) : (
          <AIChat meals={meals} />
        )}
      </main>

      {/* Feelings Trigger Notification */}
      <FeelingsTrigger meals={meals} onUpdateMeal={updateMeal} />
    </div>
  )
}

// Feelings Trigger Component - shows prompt 30 minutes after meal
function FeelingsTrigger({ meals, onUpdateMeal }) {
  const [pendingMeal, setPendingMeal] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const checkPendingFeelings = () => {
      const now = new Date()
      meals.forEach(meal => {
        if (!meal.feeling) {
          const mealTime = new Date(meal.timestamp)
          const minutesSinceMeal = (now - mealTime) / (1000 * 60)
          
          // Show prompt between 25-35 minutes after meal
          if (minutesSinceMeal >= 25 && minutesSinceMeal <= 35) {
            setPendingMeal(meal)
            setShowPrompt(true)
          }
        }
      })
    }

    const interval = setInterval(checkPendingFeelings, 60000) // Check every minute
    checkPendingFeelings()

    return () => clearInterval(interval)
  }, [meals])

  const feelings = ['Bloated', 'Energized', 'Heavy', 'Reflux', 'Normal', 'Gassy']

  if (!showPrompt || !pendingMeal) return null

  return (
    <div className="fixed bottom-6 right-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-slate-900/50 border-2 border-emerald-200 dark:border-slate-600 p-6 max-w-sm z-50 transition-colors duration-300">
      <div className="flex items-start gap-3">
        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 dark:text-white mb-1 transition-colors duration-300">How is your stomach feeling?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 transition-colors duration-300">
            You logged "{pendingMeal.item}" about 30 minutes ago.
          </p>
          <div className="flex flex-wrap gap-2">
            {feelings.map(feeling => (
              <button
                key={feeling}
                onClick={() => {
                  onUpdateMeal(pendingMeal.id, { feeling })
                  setShowPrompt(false)
                  setPendingMeal(null)
                }}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all text-gray-700 dark:text-gray-300"
              >
                {feeling}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setShowPrompt(false)
              setPendingMeal(null)
            }}
            className="mt-3 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
