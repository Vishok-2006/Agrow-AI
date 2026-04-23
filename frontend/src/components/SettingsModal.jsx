import { X, Moon, Sun, Monitor, Zap, ZapOff, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { historyService } from '../services/history'

const SettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('agrow_settings')
    const savedTheme = localStorage.getItem('theme') || 'system'
    const parsed = savedSettings ? JSON.parse(savedSettings) : { animations: true }
    return { ...parsed, theme: savedTheme }
  })

  useEffect(() => {
    const { theme, ...rest } = settings
    localStorage.setItem('agrow_settings', JSON.stringify(rest))
    localStorage.setItem('theme', theme)
    
    // Apply theme
    const root = window.document.documentElement
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Apply animations toggle
    if (settings.animations) {
      root.classList.remove('no-animations')
    } else {
      root.classList.add('no-animations')
    }
  }, [settings])

  if (!isOpen) return null

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to delete all chat history?')) {
      historyService.clearHistory()
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
          <h3 className="text-lg font-bold text-emerald-950 dark:text-white tracking-tight">Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-emerald-500/5 dark:hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-emerald-900/40 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Theme Switch */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-emerald-900/40 dark:text-gray-500 uppercase tracking-widest">Appearance</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
              {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
                { id: 'system', icon: Monitor, label: 'System' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSettings({ ...settings, theme: t.id })}
                  className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all ${
                    settings.theme === t.id 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'text-emerald-900/40 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-gray-300 hover:bg-emerald-500/5 dark:hover:bg-white/5'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Animations Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-emerald-950 dark:text-gray-200">System Animations</label>
              <p className="text-[10px] text-emerald-900/40 dark:text-gray-500 font-medium">Toggle smooth transitions and effects</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, animations: !settings.animations })}
              className={`p-2 rounded-xl transition-all ${
                settings.animations ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {settings.animations ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
            </button>
          </div>

          {/* Chat History Management */}
          <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-emerald-900/40 dark:text-gray-500 uppercase tracking-widest">Chat History</label>
              <button 
                onClick={handleClearHistory}
                className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {historyService.getSessions().length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[10px] text-emerald-900/30 dark:text-gray-500 font-bold uppercase">No history found</p>
                </div>
              ) : (
                historyService.getSessions().map(session => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl group border border-black/5 dark:border-white/5">
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="block text-[11px] font-bold text-emerald-950 dark:text-gray-200 truncate">{session.preview}</span>
                      <span className="block text-[9px] text-emerald-900/30 dark:text-gray-500 mt-0.5">{new Date(session.lastUpdate).toLocaleString()}</span>
                    </div>
                    <button 
                      onClick={() => {
                        historyService.deleteSession(session.id);
                        // Force re-render by updating dummy state if needed, or just reload
                        window.location.reload();
                      }}
                      className="p-1.5 text-red-500/40 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-black/5 dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 text-center">
          <p className="text-[9px] text-emerald-900/20 dark:text-gray-600 font-bold uppercase tracking-[0.2em]">Agrow AI Dashboard v4.0.2</p>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
