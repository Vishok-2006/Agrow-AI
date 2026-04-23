import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import NotificationDropdown from './NotificationDropdown'
import SettingsModal from './SettingsModal'

const Layout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const isAssistant = location.pathname === '/assistant'
  const notificationRef = useRef(null)

  // Handle clicks outside notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#020617] text-[#020617] dark:text-gray-100 overflow-hidden relative">
      {/* Background Glow Blobs */}
      <div className="glow-overlay w-[500px] h-[500px] bg-emerald-600 top-[-10%] right-[-10%] opacity-[0.05] pointer-events-none" />
      <div className="glow-overlay w-[500px] h-[500px] bg-blue-700 bottom-[-10%] left-[10%] opacity-[0.05] pointer-events-none" />

      {/* Sidebar Component */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-transparent">
        {/* Top Navbar */}
        <header className="h-20 flex-none bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border-b border-black/5 dark:border-white/10 flex items-center justify-between px-8 z-50 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="w-1.5 h-10 bg-emerald-500 rounded-full hidden sm:block shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
             <div>
                <h2 className="text-sm font-black text-emerald-950 dark:text-white tracking-[0.2em] uppercase leading-none mb-1">
                   Mission <span className="text-emerald-500 opacity-80">Control</span>
                </h2>
                <p className="text-[9px] text-emerald-800/40 dark:text-gray-500 font-bold uppercase tracking-[0.3em]">Quantum Stack v4.0</p>
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full border border-emerald-500/20 dark:border-emerald-500/10 text-[10px] font-black text-emerald-600 dark:text-emerald-500 tracking-widest">
               <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,1)] animate-pulse"></div>
               SYSTEM ENCRYPTED
            </div>
            
            <div className="flex items-center gap-4 pl-6 border-l border-black/5 dark:border-white/10 relative">
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`p-2.5 rounded-xl transition-all relative group ${
                    isNotificationsOpen ? 'bg-emerald-500/10 text-emerald-400' : 'text-emerald-700/50 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-gray-200 hover:bg-emerald-500/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#020617] shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                </button>
                <NotificationDropdown isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-emerald-950 dark:text-gray-100 uppercase tracking-widest">{user?.email?.split('@')[0] || 'ADMIN'}</p>
                <p className="text-[9px] text-emerald-600 dark:text-emerald-500/60 font-black uppercase tracking-[0.2em] text-glow">Root Level</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700 border border-white/20 flex items-center justify-center text-white font-black shadow-xl shadow-emerald-500/20 transform hover:scale-105 transition-transform cursor-pointer">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <main className={`flex-1 overflow-hidden relative ${isAssistant ? 'p-0' : 'p-8'} bg-transparent`}>
           <div className={`${isAssistant ? 'w-full h-full' : 'max-w-7xl mx-auto min-h-full'}`}>
             <Outlet />
           </div>
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}

export default Layout
