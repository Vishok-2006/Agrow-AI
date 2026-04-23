import { Bell, Check, Info, AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Field Sync Complete', message: 'Madurai Sector A data updated successfully.', type: 'success', read: false, time: '2m ago' },
    { id: 2, title: 'Low Moisture Alert', message: 'Sector D requires immediate irrigation.', type: 'warning', read: false, time: '15m ago' },
    { id: 3, title: 'System Update', message: 'New AI model v4.2 deployed.', type: 'info', read: true, time: '1h ago' },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-16 right-0 w-80 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
        <h4 className="text-xs font-black text-emerald-950 dark:text-white uppercase tracking-widest">Notifications</h4>
        {unreadCount > 0 && (
          <button 
            onClick={markAllRead}
            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2 opacity-20" />
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">All caught up</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 hover:bg-emerald-500/5 dark:hover:bg-white/5 transition-colors cursor-pointer group relative ${!n.read ? 'bg-emerald-500/5 dark:bg-white/[0.02]' : ''}`}
                onClick={() => markAsRead(n.id)}
              >
                {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-full"></div>}
                <div className="flex gap-3">
                  <div className={`mt-1 p-1.5 rounded-lg shrink-0 ${
                    n.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' :
                    n.type === 'warning' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500' :
                    'bg-blue-500/10 text-blue-600 dark:text-blue-500'
                  }`}>
                    {n.type === 'success' ? <Check className="w-3 h-3" /> :
                     n.type === 'warning' ? <AlertTriangle className="w-3 h-3" /> :
                     <Info className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${n.read ? 'text-emerald-900/40 dark:text-gray-400' : 'text-emerald-950 dark:text-gray-100'}`}>{n.title}</p>
                    <p className="text-[10px] text-emerald-900/30 dark:text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[9px] text-emerald-900/20 dark:text-gray-600 mt-2 font-bold uppercase tracking-tighter">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-black/5 dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 text-center">
        <button className="text-[9px] text-emerald-900/40 dark:text-gray-500 font-bold uppercase tracking-widest hover:text-emerald-600 dark:hover:text-gray-300 transition-colors">
          View all notifications
        </button>
      </div>
    </div>
  )
}

export default NotificationDropdown
