import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API || ''

function KpiCard({ icon, label, value, color, bgColor }) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
        <span className={`material-symbols-outlined text-2xl ${color}`}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-[11px] text-slate-400 font-semibold">{label}</p>
      </div>
    </div>
  )
}

export default function ProgramadorEstadisticas() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')

  const fetchData = () => {
    setLoading(true)
    fetch(`${API}/api/servidor/estadisticas`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!data || data.error) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-5xl text-red-400 mb-3 block">error</span>
        <p className="text-sm text-slate-400">Error al cargar estadísticas</p>
      </div>
    )
  }

  const { kpis } = data

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-black text-emerald-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">bar_chart</span>
          Estadísticas
        </h1>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Actualizar
        </button>
      </div>

      {/* KPIs Usuarios */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Usuarios registrados</h2>
        <div className="grid grid-cols-3 gap-4">
          <KpiCard
            icon="group"
            label="Total registrados"
            value={kpis.total}
            color="text-emerald-400"
            bgColor="bg-emerald-500/15"
          />
          <KpiCard
            icon="person"
            label="Plan Gratuito"
            value={kpis.general_gratis}
            color="text-slate-400"
            bgColor="bg-slate-500/15"
          />
          <KpiCard
            icon="star_half"
            label="Plan Normal"
            value={kpis.general_normal}
            color="text-blue-400"
            bgColor="bg-blue-500/15"
          />
          <KpiCard
            icon="workspace_premium"
            label="Plan Premium"
            value={kpis.general_premium}
            color="text-amber-400"
            bgColor="bg-amber-500/15"
          />
          <KpiCard
            icon="landscape"
            label="Turismo Gratis"
            value={kpis.turismo_gratis}
            color="text-teal-400"
            bgColor="bg-teal-500/15"
          />
          <KpiCard
            icon="diamond"
            label="Turismo Premium"
            value={kpis.turismo_premium}
            color="text-purple-400"
            bgColor="bg-purple-500/15"
          />
        </div>
      </div>
    </div>
  )
}
