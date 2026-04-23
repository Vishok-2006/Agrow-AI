import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CloudSun,
  Sprout,
  MessageSquare,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  History
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { historyService } from '../services/history'

const Sidebar = ({ isCollapsed, setIsCollapsed, onOpenSettings }) => {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    setSessions(historyService.getSessions())
  }, [])

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Weather', icon: CloudSun, path: '/weather' },
    { name: 'Crop', icon: Sprout, path: '/crop' },
    { name: 'Assistant', icon: MessageSquare, path: '/assistant' },
  ]

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 ease-in-out flex-none flex flex-col h-full bg-slate-50 dark:bg-white/[0.02] backdrop-blur-3xl border-r border-black/5 dark:border-white/10 z-[60] relative shadow-2xl`}
    >
      {/* Header Area with Collapse Toggle */}
      <div className="h-20 flex-none flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5 overflow-hidden">
        <div className="flex items-center gap-4 min-w-max">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-black text-lg tracking-tighter text-emerald-950 dark:text-white whitespace-nowrap">
              AGROW <span className="text-emerald-500">AI</span>
            </span>
          )}
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-2 text-emerald-800/40 dark:text-gray-500 hover:text-emerald-500 hover:bg-emerald-500/5 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* For Collapsed state, the toggle is at the top center */}
      {isCollapsed && (
        <div className="flex justify-center py-4 border-b border-black/5 dark:border-white/5">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="p-2 text-emerald-800/40 dark:text-gray-500 hover:text-emerald-500 hover:bg-emerald-500/5 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative
              ${isActive 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' 
                : 'text-emerald-900/40 dark:text-gray-500 hover:text-emerald-700 dark:hover:text-gray-200 hover:bg-emerald-500/5 dark:hover:bg-white/5'
              }
            `}
          >
            <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isCollapsed ? 'mx-auto' : ''}`} />
            {!isCollapsed && <span className="text-sm font-bold tracking-tight">{item.name}</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-20 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-white/10 font-bold uppercase tracking-widest shadow-xl">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}

        {!isCollapsed && sessions.length > 0 && (
          <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between px-4 mb-4">
              <span className="text-[10px] font-black text-emerald-900/40 dark:text-gray-500 uppercase tracking-widest">Recent Chats</span>
              <History className="w-3 h-3 text-emerald-900/20 dark:text-gray-600" />
            </div>
            <div className="space-y-1">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="group/session relative">
                  <button
                    onClick={() => navigate(`/assistant?session=${session.id}`)}
                    className="w-full flex flex-col items-start px-4 py-3 rounded-xl hover:bg-emerald-500/5 dark:hover:bg-white/5 transition-all group text-left"
                  >
                    <span className="text-[11px] font-bold text-emerald-900/60 dark:text-gray-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 pr-4">{session.preview}</span>
                    <span className="text-[9px] text-emerald-900/30 dark:text-gray-600 mt-1 font-medium">{new Date(session.lastUpdate).toLocaleDateString()}</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      historyService.deleteSession(session.id);
                      setSessions(historyService.getSessions());
                      if (window.location.search.includes(session.id)) {
                        navigate('/assistant');
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-red-500/0 group-hover/session:text-red-500/40 hover:!text-red-500 transition-all rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="flex-none p-4 border-t border-black/5 dark:border-white/5 space-y-2">
        {/* Settings Button */}
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-emerald-900/40 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/5 dark:hover:bg-white/5 transition-all group relative"
        >
          <Settings className={`w-5 h-5 shrink-0 transition-transform group-hover:rotate-90 duration-500 ${isCollapsed ? 'mx-auto' : ''}`} />
          {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Settings</span>}
          {isCollapsed && (
            <div className="absolute left-20 px-3 py-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-white/10 font-bold uppercase tracking-widest shadow-xl">
              Settings
            </div>
          )}
        </button>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-emerald-900/40 dark:text-gray-500 hover:text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-all group relative"
        >
          <LogOut className={`w-5 h-5 shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
          {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>}
          {isCollapsed && (
            <div className="absolute left-20 px-3 py-2 bg-red-600 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-white/10 font-bold uppercase tracking-widest shadow-xl">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
