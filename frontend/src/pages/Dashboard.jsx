import { useEffect, useState } from 'react'
import { ArrowRight, CloudSun, MessageSquareText, Sprout, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageShell from '../components/PageShell'
import { FALLBACK_RECOMMENDATION, getAndSaveRecommendation } from '../services/recommendationService'
import { FALLBACK_WEATHER, fetchWeather } from '../services/weather'
import { statusService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [weather, setWeather] = useState(FALLBACK_WEATHER)
  const [recommendation, setRecommendation] = useState(FALLBACK_RECOMMENDATION)
  const [status, setStatus] = useState({ backend: 'checking', weather: 'checking', endee: 'checking' })

  useEffect(() => {
    let mounted = true

    const loadDashboard = async () => {
      setLoading(true)
      setError('')

      try {
        const [healthResponse, weatherData] = await Promise.all([
          statusService.getHealth(),
          fetchWeather('New Delhi'),
        ])

        if (!mounted) {
          return
        }

        const recommendationData = await getAndSaveRecommendation({
          humidity: weatherData.humidity,
          location: weatherData.location,
          soilType: 'Loamy',
          temperature: weatherData.temp,
          userId: user?.id ?? 'agrow-user',
        })

        if (!mounted) {
          return
        }

        setStatus(healthResponse.data)
        setWeather(weatherData)
        setRecommendation(recommendationData)

        if (weatherData.note || recommendationData.note) {
          setError([weatherData.note, recommendationData.note].filter(Boolean).join(' '))
        }
      } catch {
        if (!mounted) {
          return
        }

        setError('Backend services are temporarily unavailable. Sample insights are displayed.')
        setWeather(FALLBACK_WEATHER)
        setRecommendation(FALLBACK_RECOMMENDATION)
        setStatus({ backend: 'disconnected', weather: 'disconnected', endee: 'disconnected' })
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      mounted = false
    }
  }, [user?.id])

  return (
    <PageShell
      title="Farm Operations Dashboard"
      description="Monitor core services, current field weather, and smart crop guidance from a production-ready control center."
      loading={loading}
      error={error}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Backend', value: status.backend },
              { label: 'Weather API', value: status.weather },
              { label: 'Vector DB', value: status.endee },
            ].map((item) => (
              <article key={item.label} className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-slate-950/20">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                <p className={`mt-4 text-2xl font-semibold ${item.value === 'connected' ? 'text-emerald-300' : 'text-amber-200'}`}>
                  {item.value}
                </p>
              </article>
            ))}
          </div>

          <article className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 p-8 shadow-2xl shadow-slate-950/30">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/80">Current Weather</p>
                <h2 className="mt-4 text-5xl font-semibold text-white">{Math.round(weather.temp)}°C</h2>
                <p className="mt-2 text-lg text-slate-300">{weather.location} · {weather.condition}</p>
              </div>
              <CloudSun className="h-14 w-14 text-indigo-300" />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Humidity</p>
                <p className="mt-3 text-3xl font-semibold text-white">{weather.humidity}%</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Wind Speed</p>
                <p className="mt-3 text-3xl font-semibold text-white">{weather.windSpeed} m/s</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Rain Chance</p>
                <p className="mt-3 text-3xl font-semibold text-white">{weather.rainChance}</p>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6">
          <article className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-300/80">Crop Insight</p>
                <h3 className="mt-3 text-3xl font-semibold text-white">{recommendation.recommendedCrop}</h3>
              </div>
              <Sprout className="h-8 w-8 text-indigo-300" />
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-300">{recommendation.explanation}</p>
            <div className="mt-6 rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
              {recommendation.risk_alerts}
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            {[
              {
                title: 'Weather Page',
                description: 'Search conditions by location and inspect live metrics.',
                icon: CloudSun,
                link: '/weather',
              },
              {
                title: 'Crop Page',
                description: 'Generate recommendations from field data inputs.',
                icon: Waves,
                link: '/crop',
              },
              {
                title: 'Assistant Page',
                description: 'Chat with Agrow AI in a dedicated workspace.',
                icon: MessageSquareText,
                link: '/assistant',
              },
            ].map((item) => (
              <Link key={item.link} to={item.link} className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5 transition hover:border-indigo-400/40 hover:bg-slate-900/80">
                <div className="flex items-center justify-between">
                  <item.icon className="h-6 w-6 text-indigo-300" />
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </div>
                <h4 className="mt-5 text-lg font-semibold text-white">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  )
}

export default Dashboard
