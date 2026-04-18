import { TerminalSquare, Trash2 } from 'lucide-react'
import { useLogs } from '../context/LogContext'

const formatPayload = (payload) => {
  if (payload == null) {
    return ''
  }

  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return String(payload)
  }
}

const ConsolePanel = () => {
  const { logs, clearLogs } = useLogs()

  return (
    <section className="overflow-hidden rounded-[28px] border border-emerald-500/20 bg-black shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-emerald-500/20 px-4 py-3">
        <div className="flex items-center gap-2 text-emerald-300">
          <TerminalSquare className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.3em]">System Console</span>
        </div>
        <button
          type="button"
          onClick={clearLogs}
          className="rounded-full border border-emerald-500/20 p-2 text-emerald-300 transition hover:bg-emerald-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto px-4 py-3 font-mono text-xs text-emerald-300">
        {logs.length === 0 ? (
          <p className="text-emerald-500/80">[idle] Waiting for API activity...</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-400">
                  <span>{log.level}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-emerald-200">{log.message}</p>
                {log.payload != null && (
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-emerald-500/90">
                    {formatPayload(log.payload)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ConsolePanel
