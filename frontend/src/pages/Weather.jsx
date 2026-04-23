import { useState } from 'react'
import { CloudSun, Droplets, Search, Thermometer, Wind } from 'lucide-react'
import PageShell from '../components/PageShell'
import { weatherService } from '../services/api'

const Weather = () => {
  const [location, setLocation] = useState('New Delhi')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await weatherService.getWeather(location)
      setWeather(res.data)
    } catch (submitError) {
      setError('Unable to load weather data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="Weather Intelligence"
      description="Live agricultural weather monitoring and field condition analysis."
      loading={false}
      error={error}
      actions={
        <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Search field location..."
              className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-white/5 rounded-xl text-xs font-semibold text-gray-200 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/30"
          >
            {loading ? '...' : 'Check'}
          </button>
        </form>
      }
    >
      <div className="grid gap-4 lg:grid-cols-12 relative">
        <section className="lg:col-span-8 dashboard-card p-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/10 transition-colors"></div>
          {loading ? (
            <div className="flex flex-col gap-8 animate-pulse relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl"></div>
                <div className="space-y-3">
                  <div className="h-2 w-20 bg-white/10 rounded"></div>
                  <div className="h-10 w-32 bg-white/10 rounded"></div>
                  <div className="h-3 w-16 bg-white/10 rounded"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="h-16 bg-white/5 rounded-xl"></div>
                <div className="h-16 bg-white/5 rounded-xl"></div>
                <div className="h-16 bg-white/5 rounded-xl"></div>
                <div className="h-16 bg-white/5 rounded-xl"></div>
              </div>
            </div>
          ) : weather ? (
            <>
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/20 border border-white/10 transition-transform duration-500 hover:rotate-6">
                  <CloudSun className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">{weather.location || location}</p>
                  <h2 className="mt-0.5 text-5xl font-black text-gray-100 tracking-tight group-hover:text-emerald-400 transition-colors">
                    {weather.temperature != null ? Math.round(weather.temperature) : '--'}°C
                  </h2>
                  <p className="text-sm font-bold text-emerald-400 capitalize">{weather.condition ?? 'Clear'}</p>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                 {[
                   { label: 'Temp', value: `${weather.temperature != null ? Math.round(weather.temperature) : '--'}°C`, icon: Thermometer, color: 'text-orange-400' },
                   { label: 'Humidity', value: `${weather.humidity ?? '--'}%`, icon: Droplets, color: 'text-blue-400' },
                   { label: 'Wind', value: `${weather.wind ?? '--'} m/s`, icon: Wind, color: 'text-emerald-400' },
                   { label: 'Rain', value: `${weather.rain ?? '0'} mm`, icon: Search, color: 'text-indigo-400' },
                 ].map(item => (
                   <div key={item.label} className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 hover:border-white/10 transition-all hover:scale-[1.05]">
                      <item.icon className={`w-3.5 h-3.5 mb-2 ${item.color}`} />
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</p>
                      <p className="text-base font-bold text-gray-200">{item.value}</p>
                   </div>
                 ))}
              </div>
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em] gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/5 backdrop-blur-md">
                <CloudSun className="w-6 h-6" />
              </div>
              Syncing Satellite Feed...
            </div>
          )}
        </section>
 
        <section className="lg:col-span-4 space-y-4 relative z-10">
           <div className="dashboard-card p-5 bg-emerald-600/90 text-white border-none shadow-2xl shadow-emerald-900/30">
              <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-90">Tactical Advice</h3>
              <p className="mt-3 text-xs leading-relaxed font-medium">
                Conditions are optimal for irrigation in the early morning. Wind speeds are moderate, suitable for pest control spraying.
              </p>
              <div className="mt-4 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_#fff]"></div>
                 <span className="text-[9px] font-bold uppercase opacity-80 tracking-widest">Active Monitoring</span>
              </div>
           </div>
           
           <div className="dashboard-card p-5">
              <h3 className="text-[10px] font-bold text-gray-200 uppercase tracking-widest mb-4">Satellite Log</h3>
              <div className="space-y-3">
                 {[
                   { date: 'Yesterday', temp: '32°C', cond: 'Sunny' },
                   { date: '22 Apr', temp: '31°C', cond: 'Cloudy' },
                   { date: '21 Apr', temp: '29°C', cond: 'Rain' },
                 ].map(item => (
                   <div key={item.date} className="flex justify-between items-center text-[10px] font-bold border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500">{item.date}</span>
                      <span className="text-gray-200">{item.temp}</span>
                      <span className="text-emerald-400 uppercase tracking-widest">{item.cond}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      </div>
    </PageShell>
  )
}

export default Weather
