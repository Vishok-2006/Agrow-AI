import { useState } from 'react'
import { Droplets, Leaf, MapPin, Thermometer, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import PageShell from '../components/PageShell'
import { cropService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Crop = () => {
  const { user } = useAuth()
  const [form, setForm] = useState({ humidity: 65, location: 'New Delhi', soilType: 'Loamy', temperature: 28 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await cropService.getRecommendation({
        ...form,
        humidity: Number(form.humidity),
        temperature: Number(form.temperature),
        userId: user?.id ?? 'agrow-user',
      })
      setResult(res.data)
    } catch (submitError) {
      setError('Unable to generate recommendation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="Crop Recommendation"
      description="Data-driven intelligence to select the most profitable crop for your field."
      loading={false}
      error={error}
    >
      <div className="grid gap-4 lg:grid-cols-12 relative">
        <form onSubmit={handleSubmit} className="lg:col-span-4 dashboard-card p-5 space-y-4">
          <h3 className="text-[10px] font-bold text-emerald-400 mb-2 uppercase tracking-[0.2em]">Field Parameters</h3>
          {[
            { field: 'location', label: 'Location', icon: MapPin, type: 'text' },
            { field: 'soilType', label: 'Soil Type', icon: Leaf, type: 'text' },
            { field: 'temperature', label: 'Temperature (°C)', icon: Thermometer, type: 'number' },
            { field: 'humidity', label: 'Humidity (%)', icon: Droplets, type: 'number' },
          ].map((item) => (
            <div key={item.field}>
              <label className="flex items-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                <item.icon className="h-3 w-3 text-emerald-500" />
                {item.label}
              </label>
              <input
                type={item.type}
                value={form[item.field]}
                onChange={updateField(item.field)}
                className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-xs font-semibold text-gray-200 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500 shadow-xl shadow-emerald-900/30 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : 'Run Neural Analysis'}
          </button>
        </form>

        <section className="lg:col-span-8 dashboard-card p-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/10 transition-colors"></div>
          
          {result ? (
            <div className="space-y-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Prediction Resolved</p>
                  <h2 className="mt-1 text-4xl font-black text-gray-100 tracking-tight group-hover:text-emerald-400 transition-colors">{result.recommended_crop || result.recommendedCrop}</h2>
                </div>
                <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl text-emerald-400 border border-white/10 shadow-2xl shadow-emerald-500/20">
                  <Leaf className="w-8 h-8" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                       <Info className="w-3.5 h-3.5 text-blue-400" />
                       Logic
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                       {result.explanation}
                    </p>
                 </div>
                 
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                       Operation
                    </h4>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-xs text-gray-400 font-medium leading-relaxed backdrop-blur-sm">
                       {result.irrigation_advice}
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                 <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                 <div>
                    <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Risk Factor</h4>
                    <p className="mt-0.5 text-xs text-red-400/60 font-medium leading-relaxed">
                       {result.risk_alerts}
                    </p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 opacity-50">
               <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-full flex items-center justify-center mb-4 backdrop-blur-md">
                  <Leaf className="w-8 h-8 text-gray-700" />
               </div>
               <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Neural Link Idle</h3>
               <p className="text-xs text-gray-600 mt-1 max-w-xs font-medium leading-relaxed">
                  Waiting for field telemetry to initialize predictive modeling.
               </p>
            </div>
          )}
        </section>
      </div>

    </PageShell>
  )
}

const Sprout = ({ className }) => <Leaf className={className} />

export default Crop
