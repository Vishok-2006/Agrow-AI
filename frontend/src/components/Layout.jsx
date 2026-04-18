import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  CloudSun,
  Sprout,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Leaf,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { checkEndeeHealth } from '../services/endee'
import { statusService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import ConsolePanel from './ConsolePanel'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [endeeStatus, setEndeeStatus] = useState('checking')
  const [backendStatus, setBackendStatus] = useState('checking')
  const navigate = useNavigate()
  const { signOut, user } = useAuth()

  useEffect(() => {
    let isMounted = true

    const checkHealth = async () => {
      try {
        const response = await statusService.getHealth()
        if (isMounted) {
          setBackendStatus(response.data?.backend === 'connected' ? 'connected' : 'disconnected')
          setEndeeStatus(response.data?.endee === 'connected' ? 'connected' : 'disconnected')
        }
      } catch (error) {
        if (isMounted) {
          setBackendStatus('disconnected')
          setEndeeStatus('disconnected')
        }
      }

      try {
        const isHealthy = await checkEndeeHealth()
        if (isMounted) {
          setEndeeStatus(isHealthy ? 'connected' : 'disconnected')
        }
      } catch {
        if (isMounted) {
          setEndeeStatus('disconnected')
        }
      }
    }

    checkHealth()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Weather', icon: CloudSun, path: '/weather' },
    { name: 'Crop Recommendation', icon: Sprout, path: '/crop' },
    { name: 'AI Assistant', icon: MessageSquare, path: '/assistant' },
  ]

  return (
    <div className="flex h-screen bg-[#0b1020] text-agrow-text transition-colors duration-300">
      <aside className={`
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        flex flex-col h-full bg-[#11162a] border-r border-white/10 transition-all duration-300 z-50
      `}>
        <div className="p-6 flex items-center gap-3">
          <Leaf className="w-8 h-8 text-indigo-300 flex-shrink-0" />
          {isSidebarOpen && <span className="text-xl font-bold tracking-tight text-white">AGROW AI</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-200
                ${isActive
                  ? 'bg-indigo-500/20 text-white font-semibold shadow-lg shadow-indigo-500/10'
                  : 'text-agrow-text/60 hover:bg-white/5 hover:text-agrow-text'}
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-agrow-primary/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-3 w-full rounded-2xl text-agrow-text/60 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-[#0b1020]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 z-40">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 text-agrow-text"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.email ?? 'Agrow Farmer'}</p>
              <p className="text-xs text-slate-400 uppercase tracking-[0.25em]">
                Backend {backendStatus} · Endee {endeeStatus}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold border border-indigo-300/30 shadow-lg shadow-indigo-500/20">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_rgba(11,16,32,0.98)_46%)] p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
            <ConsolePanel />
          </div>
        </section>
      </main>
    </div>
  )
}

export default Layout
