import { useState } from 'react'
import { CloudSun, Droplets, Search, Thermometer, Wind } from 'lucide-react'
import PageShell from '../components/PageShell'
import { fetchWeather } from '../services/weather'

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
      const data = await fetchWeather(location)
      setWeather(data)
      if (data.note) {
        setError(data.note)
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to load weather data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="Weather Intelligence"
      description="Search any location and review live temperature, humidity, and field conditions with resilient fallback handling."
      loading={false}
      error={error}
      actions={
        <form onSubmit={handleSubmit} className="flex w-full max-w-xl gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Enter a city or village"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 py-3 pl-11 pr-4 text-slate-100 outline-none transition focus:border-indigo-400/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Check'}
          </button>
        </form>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950 to-slate-900 p-8 shadow-2xl shadow-slate-950/40">
          {weather ? (
            <>
              <div className="flex items-center gap-4">
                <div className="rounded-3xl bg-indigo-500/15 p-4 text-indigo-200">
                  <CloudSun className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-indigo-300/80">{weather.location}</p>
                  <h2 className="mt-3 text-5xl font-semibold text-white">{Math.round(weather.temp)}°C</h2>
                  <p className="mt-2 text-lg capitalize text-slate-300">{weather.condition}</p>
                </div>
              </div>
              <p className="mt-6 text-sm leading-7 text-slate-300">{weather.description}</p>
            </>
          ) : (
            <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/5 text-center text-slate-400">
              Search a location to load weather insights.
            </div>
          )}
        </section>

        <section className="grid gap-4">
          {[
            { icon: Thermometer, label: 'Temperature', value: weather ? `${weather.temp}°C` : '--' },
            { icon: Droplets, label: 'Humidity', value: weather ? `${weather.humidity}%` : '--' },
            { icon: Wind, label: 'Wind Speed', value: weather ? `${weather.windSpeed} m/s` : '--' },
          ].map((item) => (
            <div key={item.label} className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-slate-950/20">
              <div className="flex items-center gap-3 text-slate-300">
                <item.icon className="h-5 w-5 text-indigo-300" />
                <span className="text-sm uppercase tracking-[0.25em]">{item.label}</span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </section>
      </div>
    </PageShell>
  )
}

export default Weather
