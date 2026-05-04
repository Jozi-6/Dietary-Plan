import { useState, useEffect } from 'react'
import { Plus, Leaf, Flame, AlertTriangle, MessageCircle, Clock, Calendar } from 'lucide-react'
import QuickLog from './components/QuickLog'
import MealList from './components/MealList'
import AIAnalysis from './components/AIAnalysis'
import AIChat from './components/AIChat'

function App() {
  const [meals, setMeals] = useState([])
  const [activeView, setActiveView] = useState('dashboard')

  // Load meals from localStorage on mount
  useEffect(() => {
    const savedMeals = localStorage.getItem('gutcheck_meals')
    if (savedMeals) {
      setMeals(JSON.parse(savedMeals))
    }
  }, [])

  // Save meals to localStorage whenever they change
  useEffect(() => {
    if (meals.length > 0) {
      localStorage.setItem('gutcheck_meals', JSON.stringify(meals))
    }
  }, [meals])

  const addMeal = (mealData) => {
    const newMeal = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...mealData
    }
    setMeals([newMeal, ...meals])
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">GutCheck</h1>
                <p className="text-sm text-gray-500">Track your intake, achieve a flat stomach</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeView === 'dashboard' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('chat')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeView === 'chat' 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                AI Chat
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeView === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Quick Log and Meal List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Log */}
              <QuickLog onAddMeal={addMeal} />

              {/* Today's Meals */}
              <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-white" />
                    <h2 className="text-xl font-bold text-white">Today's Intake</h2>
                    <span className="text-emerald-100 text-sm ml-auto">
                      {getTodayMeals().length} meals logged
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
    <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border-2 border-emerald-200 p-6 max-w-sm z-50 animate-bounce-in">
      <div className="flex items-start gap-3">
        <div className="bg-amber-100 p-2 rounded-full">
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">How is your stomach feeling?</h3>
          <p className="text-sm text-gray-600 mb-3">
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
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
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
            className="mt-3 text-sm text-gray-400 hover:text-gray-600"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
