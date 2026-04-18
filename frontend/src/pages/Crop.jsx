import { useState } from 'react'
import { Droplets, Leaf, MapPin, Thermometer } from 'lucide-react'
import PageShell from '../components/PageShell'
import { FALLBACK_RECOMMENDATION, getAndSaveRecommendation } from '../services/recommendationService'
import { useAuth } from '../context/AuthContext'

const Crop = () => {
  const { user } = useAuth()
  const [form, setForm] = useState({ humidity: 65, location: 'New Delhi', soilType: 'Loamy', temperature: 28 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(FALLBACK_RECOMMENDATION)

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await getAndSaveRecommendation({
        ...form,
        humidity: Number(form.humidity),
        temperature: Number(form.temperature),
        userId: user?.id ?? 'agrow-user',
      })
      setResult(response)
      if (response.note) {
        setError(response.note)
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to generate recommendation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="Crop Recommendation"
      description="Combine weather, soil, and location data to produce resilient crop guidance with backend and fallback support."
      loading={false}
      error={error}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/30">
          {[
            { field: 'location', label: 'Location', icon: MapPin, type: 'text' },
            { field: 'soilType', label: 'Soil Type', icon: Leaf, type: 'text' },
            { field: 'temperature', label: 'Temperature', icon: Thermometer, type: 'number' },
            { field: 'humidity', label: 'Humidity', icon: Droplets, type: 'number' },
          ].map((item) => (
            <label key={item.field} className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
                <item.icon className="h-4 w-4 text-indigo-300" />
                {item.label}
              </span>
              <input
                type={item.type}
                value={form[item.field]}
                onChange={updateField(item.field)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-400/50"
              />
            </label>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-500 px-5 py-3 font-medium text-white transition hover:bg-indigo-400 disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Get Recommendation'}
          </button>
        </form>

        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/50 p-8 shadow-2xl shadow-slate-950/30">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/80">Recommended Crop</p>
          <h2 className="mt-4 text-4xl font-semibold text-white">{result.recommendedCrop}</h2>
          <p className="mt-6 text-sm leading-7 text-slate-300">{result.explanation}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Irrigation Advice</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">{result.irrigation_advice}</p>
            </div>
            <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-rose-200">Risk Alerts</p>
              <p className="mt-3 text-sm leading-7 text-rose-100">{result.risk_alerts}</p>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}

export default Crop
