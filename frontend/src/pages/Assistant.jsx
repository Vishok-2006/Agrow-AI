import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, SendHorizontal, User } from 'lucide-react'
import PageShell from '../components/PageShell'
import { chatService, extractApiError } from '../services/api'
import { useAuth } from '../context/AuthContext'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Agrow AI is ready. Ask about crops, irrigation, weather planning, or soil care.',
}

const Assistant = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const history = useMemo(
    () =>
      messages
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .map((message) => ({
          role: message.role === 'assistant' ? 'ai' : message.role,
          content: message.content,
        })),
    [messages],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) {
      return
    }

    const nextMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const response = await chatService.sendMessage(trimmed, history, user?.id ?? 'agrow-user')
      const reply = response.data?.response || 'No response received from Agrow AI.'
      setMessages([...nextMessages, { role: 'assistant', content: reply }])
    } catch (submitError) {
      const message = extractApiError(submitError, 'Unable to reach the chat service.')
      setError(message)
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: 'The assistant is temporarily unavailable. Please review the console panel for details.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="AI Assistant"
      description="Chat with Agrow AI in a persistent conversation layout with typing feedback, auto-scroll, and backend logging."
      loading={false}
      error={error}
    >
      <section className="flex h-[calc(100vh-15rem)] min-h-[520px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 shadow-2xl shadow-slate-950/30">
        <div className="border-b border-white/10 px-6 py-4">
          <p className="text-sm text-slate-300">Field operations copilot for weather, crop, and irrigation decisions.</p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 md:px-6">
          {messages.map((message, index) => {
            const isUser = message.role === 'user'
            return (
              <div key={`${message.role}-${index}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-3xl items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-2xl ${isUser ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-200'}`}>
                    {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div className={`rounded-[24px] px-5 py-4 text-sm leading-7 ${isUser ? 'rounded-tr-md bg-indigo-500 text-white' : 'rounded-tl-md border border-white/10 bg-slate-900 text-slate-100'}`}>
                    {message.content}
                  </div>
                </div>
              </div>
            )
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-[24px] rounded-tl-md border border-white/10 bg-slate-900 px-5 py-4 text-sm text-slate-300">
                Agrow AI is typing...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-white/10 bg-slate-950/90 p-4">
          <div className="flex items-end gap-3 rounded-[28px] border border-white/10 bg-slate-900/80 px-4 py-3">
            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Message Agrow AI..."
              className="max-h-32 flex-1 resize-none bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:opacity-60"
            >
              <SendHorizontal className="h-5 w-5" />
            </button>
          </div>
        </form>
      </section>
    </PageShell>
  )
}

export default Assistant
