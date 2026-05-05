import { useState } from 'react'
import { Heart, Send } from 'lucide-react'

const QuickCheckIn = ({ onAddSymptom }) => {
  const [feeling, setFeeling] = useState('')
  const [severity, setSeverity] = useState(5)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!feeling) return

    onAddSymptom({
      feeling,
      severity,
      notes: notes.trim() || null
    })

    setFeeling('')
    setSeverity(5)
    setNotes('')
  }

  const feelings = [
    { value: 'Bloated', label: 'Bloated', color: 'red' },
    { value: 'Energized', label: 'Energized', color: 'green' },
    { value: 'Cramping', label: 'Cramping', color: 'orange' },
    { value: 'Happy', label: 'Happy', color: 'blue' },
    { value: 'Heavy', label: 'Heavy', color: 'amber' },
    { value: 'Reflux', label: 'Reflux', color: 'purple' },
    { value: 'Normal', label: 'Normal', color: 'teal' },
    { value: 'Gassy', label: 'Gassy', color: 'yellow' }
  ]

  const getFeelingColor = (color) => {
    const colors = {
      'red': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      'green': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
      'orange': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      'blue': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      'amber': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      'purple': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      'teal': 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
      'yellow': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
    }
    return colors[color] || 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'
  }

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-white/10 overflow-hidden transition-colors duration-300">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold text-white">Quick Check-in</h2>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        {/* Feeling Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            How are you feeling right now?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {feelings.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFeeling(f.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                  feeling === f.value
                    ? `${getFeelingColor(f.color)}`
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity Scale */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            Severity: {severity}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={severity}
            onChange={(e) => setSeverity(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Severe</span>
          </div>
        </div>

        {/* Notes Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details about how you're feeling..."
            rows="3"
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Send className="w-4 h-4" />
          Log Check-in
        </button>
      </form>
    </div>
  )
}

export default QuickCheckIn
