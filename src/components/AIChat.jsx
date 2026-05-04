import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'

const AIChat = ({ meals }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Nutritionist. I can see your meal history and help you with meal recommendations, explain why you might be feeling bloated, or answer any nutrition questions. What would you like to know?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    const todayMeals = meals.filter(m => 
      new Date(m.timestamp).toDateString() === new Date().toDateString()
    )

    // Simple rule-based responses (in production, this would call an actual LLM API)
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('eat')) {
      return "Based on your goal of a flat stomach, I recommend:\n\n• Grilled chicken with steamed vegetables\n• Greek yogurt with berries\n• Quinoa salad with lemon dressing\n• Herbal tea (peppermint or ginger)\n\nThese are low in sodium, non-carbonated, and gentle on the digestive system."
    }

    if (lowerMessage.includes('bloat') || lowerMessage.includes('bloated')) {
      if (todayMeals.some(m => m.feeling === 'Bloated')) {
        const bloatedItems = todayMeals.filter(m => m.feeling === 'Bloated').map(m => m.item)
        return `I see you felt bloated after: ${bloatedItems.join(', ')}. Common triggers include carbonated drinks, high-sodium foods, dairy, and cruciferous vegetables. Try drinking ginger tea and staying hydrated. Would you like specific alternatives for any of these items?`
      }
      return "To reduce bloating, avoid: carbonated drinks, high-sodium processed foods, excessive dairy, and cruciferous vegetables like broccoli if you're sensitive. Instead, try: peppermint tea, ginger, probiotics, and staying hydrated with water."
    }

    if (lowerMessage.includes('soda') || lowerMessage.includes('carbonated')) {
      return "Carbonated drinks like soda are major bloat triggers! The carbon dioxide gas gets trapped in your digestive system. Better alternatives: still water, herbal tea, or infused water with lemon/cucumber."
    }

    if (lowerMessage.includes('today') || lowerMessage.includes('ate')) {
      if (todayMeals.length === 0) {
        return "You haven't logged any meals today yet. Start logging to get personalized insights!"
      }
      const mealList = todayMeals.map(m => `• ${m.item} (${new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`).join('\n')
      return `Today you've logged:\n${mealList}\n\nOverall, you're doing ${todayMeals.length > 0 ? 'great' : 'okay'}! ${todayMeals.some(m => m.item.toLowerCase().includes('soda')) ? 'I noticed some carbonated drinks - consider swapping those for water to reduce bloating.' : 'Keep up the good work with whole foods!'}`
    }

    if (lowerMessage.includes('flat stomach') || lowerMessage.includes('goal')) {
      return "To achieve a flat stomach, focus on:\n\n1. Avoid carbonated drinks (soda, sparkling water)\n2. Reduce high-sodium foods (chips, processed foods)\n3. Limit dairy if you're sensitive\n4. Eat smaller, more frequent meals\n5. Stay hydrated with still water\n6. Include probiotics and fiber\n7. Try ginger or peppermint tea for digestion\n\nI'm tracking your meals and will give you personalized feedback based on what you log!"
    }

    return "I'm here to help with nutrition advice! You can ask me about:\n\n• Meal recommendations for a flat stomach\n• Why you might be feeling bloated\n• Analysis of your food choices\n• Tips to reduce water retention\n\nI have access to your meal history, so I can give personalized advice!"
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateResponse(userMessage)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-emerald-100 dark:border-white/10 overflow-hidden transition-colors duration-300 max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/80 to-teal-500/80 backdrop-blur-md px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Nutritionist</h2>
              <p className="text-emerald-100 text-sm">Powered by your meal history</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-slate-800 transition-colors duration-300">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-emerald-500/50 text-white'
                    : 'bg-white/10 dark:bg-slate-700/50 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-600'
                } transition-colors duration-300`}
              >
                <p className="whitespace-pre-line text-sm">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 dark:bg-slate-600 rounded-full flex items-center justify-center transition-colors duration-300">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300 transition-colors duration-300" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/10 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-2xl px-4 py-3 transition-colors duration-300">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce transition-colors duration-300" />
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about meal recommendations, bloating, or nutrition tips..."
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AIChat
