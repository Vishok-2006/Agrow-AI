import LoadingScreen from './LoadingScreen'

const PageShell = ({ title, description, loading, error, actions, children }) => {
  if (loading) {
    return <LoadingScreen label={`Loading ${title}...`} />
  }

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-100 tracking-tight">{title}</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-md px-4 py-3 text-xs text-red-400 font-bold flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
          {error}
        </div>
      )}

      {children}
    </div>
  )
}

export default PageShell
