import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, SendHorizontal, User, Sparkles, Trash2, BrainCircuit } from 'lucide-react'
import { chatService, extractApiError } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { historyService } from '../services/history'

// --- Sub-components ---

const MessageBubble = ({ message, isLast }) => {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[85%] lg:max-w-[70%] items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-black/5 dark:border-white/10 ${
          isUser ? 'bg-emerald-600 shadow-lg shadow-emerald-500/30 text-white' : 'bg-white/40 dark:bg-white/10 backdrop-blur-md text-emerald-600 dark:text-emerald-400'
        }`}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        <div className={`px-5 py-4 text-[13px] leading-relaxed font-medium transition-all ${
          isUser 
            ? 'rounded-3xl rounded-tr-sm bg-emerald-600/90 text-white shadow-xl shadow-emerald-900/40' 
            : 'rounded-3xl rounded-tl-sm bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-emerald-950 dark:text-gray-200 backdrop-blur-md'
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  )
}

const InputBar = ({ input, setInput, onSubmit, loading }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  return (
    <div className="p-6 lg:p-10 border-t border-black/5 dark:border-white/5 bg-slate-50/80 dark:bg-[#020617]/80 backdrop-blur-xl relative z-20">
      <div className="max-w-5xl mx-auto relative">
        <form onSubmit={onSubmit} className="flex items-end gap-3 p-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl focus-within:border-emerald-500/30 focus-within:bg-white/[0.07] transition-all duration-300 shadow-2xl">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Agrow AI about your crops, weather, or soil..."
            className="max-h-32 flex-1 resize-none bg-transparent px-4 py-3 text-sm text-emerald-950 dark:text-gray-200 outline-none placeholder:text-emerald-900/20 dark:placeholder:text-gray-600 font-medium custom-scrollbar"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 shrink-0"
          >
            <SendHorizontal className="h-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-emerald-900/40 dark:text-gray-600 text-center mt-3 font-bold uppercase tracking-widest">
          Agrow AI can make mistakes. Check important information.
        </p>
      </div>
    </div>
  )
}

// --- Main Assistant Page ---

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Agrow AI Engine initialized. I am ready to provide weather-based crop advice and sustainable farming insights. How can I help you today?',
}

const Assistant = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const sessionId = queryParams.get('session') || 'current'

  const [messages, setMessages] = useState(() => {
    if (sessionId === 'current') {
      const saved = localStorage.getItem(`agrow_chat_${user?.id || 'guest'}`)
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE]
    } else {
      const session = historyService.getSession(sessionId)
      return session ? session.messages : [INITIAL_MESSAGE]
    }
  })

  // Watch for sessionId changes (e.g. from sidebar clicks)
  useEffect(() => {
    if (sessionId === 'current') {
      const saved = localStorage.getItem(`agrow_chat_${user?.id || 'guest'}`)
      setMessages(saved ? JSON.parse(saved) : [INITIAL_MESSAGE])
    } else {
      const session = historyService.getSession(sessionId)
      if (session) {
        setMessages(session.messages)
      }
    }
    setError('')
  }, [sessionId, user?.id])
  
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  // Auto-save session
  useEffect(() => {
    if (messages.length > 1) {
      if (sessionId === 'current') {
        localStorage.setItem(`agrow_chat_${user?.id || 'guest'}`, JSON.stringify(messages))
        historyService.saveSession('current', messages)
      } else {
        historyService.saveSession(sessionId, messages)
      }
    }
  }, [messages, user?.id, sessionId])

  // 4. Auto-scroll to latest
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, loading])

  const historyForApi = useMemo(
    () =>
      messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-10) // Only last 10 for context
        .map((m) => ({
          role: m.role === 'assistant' ? 'ai' : m.role,
          content: m.content,
        })),
    [messages],
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const userMessage = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const response = await chatService.sendMessage(trimmed, historyForApi, user?.id ?? 'anonymous')
      
      const reply = response.data?.reply || 'I encountered an issue processing your request.'
      const status = response.data?.status
      
      if (status === 'fallback' || status === 'busy') {
        setError(reply)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      const msg = extractApiError(err, 'AI Intelligence Link severed.')
      setError(msg)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ Neural Sync Interrupted. Please check connectivity or wait a few seconds.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE])
    localStorage.removeItem(`agrow_chat_${user?.id || 'guest'}`)
    setError('')
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-[#020617] relative overflow-hidden transition-colors duration-300">
      {/* Header Overlay (Floating style) */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-50 dark:from-[#020617] to-transparent z-30 pointer-events-none" />
      
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-600/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-24 pb-10 px-6 md:px-12 lg:px-24 custom-scrollbar relative z-10 space-y-8"
      >
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Card (Only if only 1 message) */}
          {messages.length === 1 && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-700">
               <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-emerald-500/20 shadow-2xl shadow-emerald-500/20">
                  <BrainCircuit className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
               </div>
               <h3 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tighter mb-4">
                  Welcome to Agrow <span className="text-emerald-500">Intelligence</span>
               </h3>
               <p className="text-emerald-900/40 dark:text-gray-500 max-w-md font-medium text-sm leading-relaxed">
                  The world's most advanced agricultural AI. Optimized for sustainable farming, precision irrigation, and crop yield maximization.
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-2xl">
                  {['Suggest crops for Tamil Nadu summer', 'Explain organic pest control', 'Optimize tomato irrigation', 'Analyze Kharif weather trends'].map(tip => (
                    <button 
                      key={tip}
                      onClick={() => setInput(tip)}
                      className="p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-xs font-bold text-emerald-900/40 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/30 dark:hover:border-white/20 hover:bg-emerald-500/5 dark:hover:bg-white/[0.08] transition-all text-left"
                    >
                      "{tip}"
                    </button>
                  ))}
               </div>
            </div>
          )}

          {/* Messages List */}
          {messages.map((message, index) => (
            <MessageBubble 
              key={`${message.role}-${index}`} 
              message={message} 
              isLast={index === messages.length - 1} 
            />
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/10 text-emerald-500 dark:text-emerald-400 shadow-xl">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-3xl rounded-tl-sm bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 px-6 py-5 backdrop-blur-md shadow-lg">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,1)] [animation-delay:0.2s]"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,1)] [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-widest text-center animate-shake">
              ⚠️ {error}
            </div>
          )}
          
          {/* Scroll Anchor */}
          <div className="h-20" />
        </div>
      </div>

      {/* Fixed Actions (Floating top right) */}
      <div className="absolute top-6 right-8 z-40 flex items-center gap-3">
         <button 
            onClick={handleClearChat}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-xl text-[10px] font-bold text-emerald-900/40 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest shadow-xl"
            title="Clear Conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
      </div>

      {/* Input Bar */}
      <InputBar 
        input={input} 
        setInput={setInput} 
        onSubmit={handleSubmit} 
        loading={loading} 
      />
    </div>
  )
}

export default Assistant
