import { useEffect, useState } from 'react'
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  CloudRain, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sprout,
  AlertCircle,
  Activity,
  Calendar,
  Layers
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts'
import { weatherService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import CustomTooltip from '../components/CustomTooltip'

// Glass theme colors for charts
const COLORS = {
  primary: '#10B981', // Emerald 500
  secondary: '#3B82F6', // Blue 500
  accent: '#F59E0B', // Amber 500
  danger: '#EF4444', // Red 500
  muted: '#94A3B8', // Slate 400
  grid: { light: '#e5e7eb', dark: '#374151' },
  text: { light: '#111827', dark: '#e5e7eb' },
  tooltip: { light: '#ffffff', dark: '#1f2937' }
}

// Mock data
const yieldData = [
  { name: 'Jan', value: 45 },
  { name: 'Feb', value: 52 },
  { name: 'Mar', value: 48 },
  { name: 'Apr', value: 61 },
  { name: 'May', value: 55 },
  { name: 'Jun', value: 67 },
]

const donutData = [
  { name: 'Organic', value: 65, color: COLORS.primary },
  { name: 'Inorganic', value: 25, color: COLORS.secondary },
  { name: 'Hybrid', value: 10, color: COLORS.accent },
]

const weatherTrendData = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  temp: 24 + Math.floor(Math.random() * 6),
  humidity: 45 + Math.floor(Math.random() * 15)
}))

const utilizationData = [
  { name: 'Sector A', value: 88 },
  { name: 'Sector B', value: 64 },
  { name: 'Sector C', value: 92 },
  { name: 'Sector D', value: 47 },
]

const KPICard = ({ title, value, icon: Icon, trend, trendValue }) => (
  <div className="dashboard-card p-4 flex flex-col justify-between group">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-all duration-300">
        <Icon className="w-4 h-4" />
      </div>
      <div className={`flex items-center text-[10px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
        {trendValue}%
      </div>
    </div>
    <div>
      <p className="text-[10px] font-medium text-emerald-900/40 dark:text-gray-500 uppercase tracking-widest">{title}</p>
      <h3 className="text-lg font-bold text-emerald-950 dark:text-gray-100 mt-0.5 group-hover:text-emerald-500 transition-colors duration-300">{value}</h3>
    </div>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    const fetchWeather = async () => {
      try {
        setError(false)
        const res = await weatherService.getWeather('Madurai')
        setWeather(res.data)
      } catch (err) {
        console.error('Weather fetch error:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
    return () => observer.disconnect()
  }, [])

  const activeGrid = isDark ? COLORS.grid.dark : COLORS.grid.light
  const activeText = isDark ? COLORS.text.dark : COLORS.text.light

  return (
    <div className="relative">
      {/* Internal Page Glow Elements */}
      <div className="glow-overlay w-64 h-64 bg-emerald-500/20 top-[20%] left-[30%]"></div>
      <div className="glow-overlay w-80 h-80 bg-blue-500/10 bottom-[20%] right-[10%]"></div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
        
        {/* --- TOP ROW --- */}
        {/* Weather Card */}
        <div className="md:col-span-4 dashboard-card p-4 flex flex-col justify-between overflow-hidden relative min-h-[180px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          
          {loading ? (
            <div className="flex flex-col gap-4 animate-pulse">
              <div className="flex justify-between">
                <div>
                  <div className="h-2 w-20 bg-white/10 rounded mb-2"></div>
                  <div className="h-10 w-24 bg-white/10 rounded"></div>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl"></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 bg-white/5 rounded-xl"></div>
                <div className="h-12 bg-white/5 rounded-xl"></div>
                <div className="h-12 bg-white/5 rounded-xl"></div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <AlertCircle className="w-8 h-8 text-red-400/50 mb-2" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Satellite Link Down</p>
              <p className="text-xs text-gray-400 mt-1">Weather data unavailable</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Live Field Sync</p>
                  <h2 className="text-4xl font-black text-emerald-950 dark:text-gray-100 mt-1 transition-all duration-500">
                    {weather?.temperature != null ? Math.round(weather.temperature) : '--'}°C
                  </h2>
                  <p className="text-xs font-medium text-emerald-900/40 dark:text-gray-400">{weather?.location || 'Madurai, IN'}</p>
                </div>
                <div className="p-3 bg-white/10 dark:bg-white/5 rounded-2xl backdrop-blur-md border border-emerald-500/10 dark:border-white/10 shadow-inner shadow-emerald-500/10 dark:shadow-emerald-500/20">
                  <CloudSun className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 relative z-10">
                {[
                  { icon: Droplets, label: 'Humid', value: `${weather?.humidity ?? '--'}%`, color: 'text-blue-500 dark:text-blue-400' },
                  { icon: Wind, label: 'Wind', value: `${weather?.wind ?? '--'}m/s`, color: 'text-emerald-600 dark:text-emerald-400' },
                  { icon: CloudRain, label: 'Rain', value: `${weather?.rain ?? '0'}mm`, color: 'text-blue-600 dark:text-blue-300' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/40 dark:bg-white/5 rounded-xl p-2 text-center border border-black/5 dark:border-white/5 hover:border-emerald-500/10 dark:hover:border-white/10 transition-all duration-300 hover:scale-[1.02]">
                    <stat.icon className={`w-3 h-3 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-[9px] uppercase font-bold text-emerald-900/40 dark:text-gray-500">{stat.label}</p>
                    <p className="text-xs font-bold text-emerald-950 dark:text-gray-200">{stat.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* KPI Metrics Row */}
        <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Soil Health" value="84/100" icon={Activity} trend="up" trendValue="4.2" />
          <KPICard title="Crop Growth" value="+12.4%" icon={TrendingUp} trend="up" trendValue="1.5" />
          <KPICard title="Water Level" value="2,450L" icon={Droplets} trend="down" trendValue="2.1" />
          <KPICard title="Next Harvest" value="14 Days" icon={Calendar} trend="up" trendValue="0.0" />
          
          {/* Compact Crop Insights Integration */}
          <div className="col-span-full dashboard-card p-4 overflow-hidden relative group">
            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-all duration-500"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-2.5 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/30 animate-pulse">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-emerald-950 dark:text-gray-100 uppercase tracking-widest">Predictive Recommendation</h4>
                <div className="flex gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
                    <p className="text-[11px] text-emerald-900/40 dark:text-gray-400">PH Level: <span className="text-emerald-600 dark:text-emerald-400 font-bold">7.2</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
                    <p className="text-[11px] text-emerald-900/40 dark:text-gray-400">Moisture: <span className="text-emerald-600 dark:text-emerald-400 font-bold">40%</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
                    <p className="text-[11px] text-emerald-900/40 dark:text-gray-400">Action: <span className="text-blue-600 dark:text-blue-400 font-bold underline underline-offset-4">Nitrogen Boost</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MIDDLE ROW --- */}
        {/* Yield Performance Line Chart */}
        <div className="md:col-span-8 dashboard-card p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-emerald-950 dark:text-gray-200 flex items-center gap-2 uppercase tracking-widest">
              <Activity className="w-4 h-4 text-emerald-500" />
              Yield Metrics
            </h3>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="w-2 h-2 rounded-full bg-black/10 dark:bg-white/10"></div>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={activeGrid} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: COLORS.muted }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: COLORS.muted }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={COLORS.primary} 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: COLORS.primary }}
                  filter="url(#glow)"
                />
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Allocation Donut Chart */}
        <div className="md:col-span-4 dashboard-card p-4">
          <h3 className="text-xs font-bold text-emerald-950 dark:text-gray-200 mb-6 uppercase tracking-widest">Resource Split</h3>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-emerald-950 dark:text-gray-100">85%</span>
              <span className="text-[9px] text-emerald-900/40 dark:text-gray-500 font-bold uppercase tracking-tighter">Peak Opt</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {donutData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}></div>
                  <span className="text-[10px] font-bold text-emerald-900/60 dark:text-gray-400 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-emerald-950 dark:text-gray-200">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- BOTTOM ROW --- */}
        {/* Weather Trend Chart */}
        <div className="md:col-span-8 dashboard-card p-4">
          <h3 className="text-xs font-bold text-emerald-950 dark:text-gray-200 mb-6 flex items-center gap-2 uppercase tracking-widest">
            <CloudSun className="w-4 h-4 text-emerald-500" />
            Climatic Trend
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weatherTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={activeGrid} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: COLORS.muted }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: COLORS.muted }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="temp" stroke={COLORS.danger} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="humidity" stroke={COLORS.secondary} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Utilization Bars */}
        <div className="md:col-span-4 dashboard-card p-4">
          <h3 className="text-xs font-bold text-emerald-950 dark:text-gray-200 mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Layers className="w-4 h-4 text-emerald-500" />
            Sector Load
          </h3>
          <div className="space-y-5">
            {utilizationData.map(item => (
              <div key={item.name}>
                <div className="flex justify-between text-[10px] font-bold text-emerald-900/40 dark:text-gray-500 mb-2 uppercase tracking-[0.15em]">
                  <span>{item.name}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{item.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-1000" 
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl group cursor-help">
             <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] text-emerald-900/60 dark:text-gray-400 leading-relaxed font-medium">
                  Automation node <span className="text-emerald-600 dark:text-emerald-400 font-bold">active</span>. System redistributing hydration to <span className="text-emerald-600 dark:text-emerald-400 font-bold">Sector D</span>.
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
