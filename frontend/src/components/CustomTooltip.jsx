const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#ffffff] dark:bg-[#1f2937] border border-black/5 dark:border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md z-[100]">
        {label && <p className="text-[10px] font-black text-emerald-900/40 dark:text-gray-500 uppercase tracking-widest mb-2 border-b border-black/5 dark:border-white/5 pb-1">{label}</p>}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 py-1">
            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ backgroundColor: entry.color || entry.payload.fill || '#10B981' }}></div>
            <p className="text-xs font-bold text-emerald-950 dark:text-gray-100">
              <span className="text-emerald-900/40 dark:text-gray-400 font-medium uppercase tracking-tighter mr-2">{entry.name}:</span>
              {entry.value}{entry.unit || ''}
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default CustomTooltip
