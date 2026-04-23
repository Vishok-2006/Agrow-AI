import { LoaderCircle, Sprout } from 'lucide-react'

const LoadingScreen = ({ label = 'Loading Agrow Analytics...' }) => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-sm">
      <div className="relative">
        <LoaderCircle className="h-10 w-10 animate-spin text-agrow-primary" />
        <Sprout className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-agrow-secondary" />
      </div>
      <p className="text-xs font-black text-agrow-muted uppercase tracking-widest">{label}</p>
    </div>
  </div>
)

export default LoadingScreen
