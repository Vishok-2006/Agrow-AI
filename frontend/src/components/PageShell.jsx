import LoadingScreen from './LoadingScreen'

const PageShell = ({ title, description, loading, error, actions, children }) => {
  if (loading) {
    return <LoadingScreen label={`Loading ${title}...`} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-300/80">Agrow AI</p>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{description}</p>
        </div>
        {actions}
      </div>

      {error && (
        <div className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
          {error}
        </div>
      )}

      {children}
    </div>
  )
}

export default PageShell
