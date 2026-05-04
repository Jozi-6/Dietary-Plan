import { useState } from 'react'
import { Plus, Send } from 'lucide-react'

const QuickLog = ({ onAddMeal }) => {
  const [item, setItem] = useState('')
  const [feeling, setFeeling] = useState('')
  const [customFeeling, setCustomFeeling] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!item.trim()) return

    onAddMeal({
      item: item.trim(),
      feeling: feeling || null,
      customFeeling: customFeeling.trim() || null
    })

    setItem('')
    setFeeling('')
    setCustomFeeling('')
  }

  const feelings = ['Bloated', 'Energized', 'Heavy', 'Reflux', 'Normal', 'Gassy']

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <Plus className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold text-white">Quick Log</h2>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Item Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            What did you eat or drink?
          </label>
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="e.g., Grilled chicken salad, Soda, Greek yogurt..."
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
            autoFocus
          />
        </div>

        {/* Feeling Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            How do you feel? (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {feelings.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFeeling(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  feeling === f
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Feeling Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            Other feelings... (optional)
          </label>
          <input
            type="text"
            value={customFeeling}
            onChange={(e) => setCustomFeeling(e.target.value)}
            placeholder="Describe how you feel physically or emotionally..."
            className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <Send className="w-4 h-4" />
          Log Meal
        </button>
      </form>
    </div>
  )
}

export default QuickLog
