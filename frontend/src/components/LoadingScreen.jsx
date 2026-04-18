import { LoaderCircle } from 'lucide-react'

const LoadingScreen = ({ label = 'Loading Agrow AI...' }) => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/70 px-8 py-10 shadow-2xl shadow-slate-950/40 backdrop-blur">
      <LoaderCircle className="h-10 w-10 animate-spin text-indigo-300" />
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  </div>
)

export default LoadingScreen
