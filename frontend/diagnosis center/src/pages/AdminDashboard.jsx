import { useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'
import DailyPatientsChart from '../components/charts/DailyPatientsChart'
import RevenueChart from '../components/charts/RevenueChart'
import PriorityPieChart from '../components/charts/PriorityPieChart'
import useSSE from '../hooks/useSSE'

const NAV = [
  { id: 'analytics', icon: '◈', label: 'Analytics' },
  { id: 'overview',  icon: '⊞', label: 'Overview' },
]

function StatCard({ icon, label, value, accent, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10" style={{ background: accent }} />
      <p className="text-3xl font-black text-slate-800">{value}</p>
      <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">{label}</p>
      <div className="mt-3 text-2xl opacity-40">{icon}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('analytics')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emergency, setEmergency] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const initials = (user?.name || 'A').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const sseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/dashboard/stream`

  useSSE(sseUrl, (data) => {
    if (data.type === 'emergency') setEmergency({ patientName: data.patientName })
  })

  async function handleLoadAnalytics(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { data } = await client.get('/dashboard/analytics', { params: { startDate, endDate } })
      setAnalytics(data.data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const summary = analytics ? {
    totalPatients: analytics.dailyPatientCounts?.reduce((s, d) => s + (d.count || 0), 0) ?? 0,
    totalRevenue:  analytics.dailyRevenue?.reduce((s, d) => s + (d.revenue || 0), 0) ?? 0,
    emergency:     analytics.priorityBreakdown?.Emergency ?? 0,
    high:          analytics.priorityBreakdown?.High ?? 0,
  } : null

  return (
    <div className="flex min-h-screen" style={{ background: '#f1f5f9' }}>

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)' }}>

        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-base font-black tracking-tight text-white">🏥 DiagnosisCenter</p>
          <p className="text-xs mt-0.5" style={{ color: '#d4a017' }}>Admin Portal</p>
        </div>

        <div className="px-6 py-4 border-b border-white/10">
          <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: '#d4a017' }}>{initials}</div>
            <div>
              <p className="font-semibold text-sm text-white">{user?.name || 'Admin'}</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Administrator</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setTab(n.id); setSidebarOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition"
              style={tab === n.id
                ? { background: 'rgba(212,160,23,0.15)', color: '#d4a017', borderLeft: '3px solid #d4a017' }
                : { color: '#94a3b8' }}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ color: '#94a3b8' }}>
            <span>→</span> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-800">{NAV.find(n => n.id === tab)?.label}</h1>
              <p className="text-xs text-slate-400">Admin · {user?.name}</p>
            </div>
          </div>
          <Link to="/profile"
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
            style={{ background: '#d4a017' }}>{initials}</Link>
        </header>

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">

          {emergency && (
            <div className="rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg"
              style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
              <div className="flex items-center gap-3 text-white">
                <span className="text-2xl">🚨</span>
                <div>
                  <p className="font-bold">Emergency Alert</p>
                  <p className="text-red-100 text-sm">Patient <strong>{emergency.patientName}</strong> triggered an emergency</p>
                </div>
              </div>
              <button onClick={() => setEmergency(null)} className="text-red-200 hover:text-white text-xl font-bold">×</button>
            </div>
          )}

          {error && <ErrorBanner message={error} />}

          {/* Analytics */}
          {tab === 'analytics' && (
            <>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">Date Range</h2>
                <form onSubmit={handleLoadAnalytics} className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">From</label>
                    <input type="date" className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      value={startDate} onChange={e => setStartDate(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">To</label>
                    <input type="date" className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      value={endDate} onChange={e => setEndDate(e.target.value)} required />
                  </div>
                  <button type="submit" disabled={loading}
                    className="px-8 py-2.5 rounded-xl font-bold text-white transition hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                    style={{ background: '#d4a017' }}>
                    {loading ? 'Loading...' : 'Load Report'}
                  </button>
                </form>
              </div>

              {loading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}

              {analytics && summary && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon="👥" label="Total Patients" value={summary.totalPatients} accent="#d4a017" />
                    <StatCard icon="💰" label="Revenue"        value={`₹${summary.totalRevenue.toLocaleString()}`} accent="#10b981" />
                    <StatCard icon="🚨" label="Emergency"      value={summary.emergency} accent="#ef4444" />
                    <StatCard icon="⚠️" label="High Priority"  value={summary.high} accent="#f97316" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Daily Patients</h3>
                      <DailyPatientsChart data={analytics.dailyPatientCounts || []} />
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Daily Revenue</h3>
                      <RevenueChart data={analytics.dailyRevenue || []} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Priority Breakdown</h3>
                    <PriorityPieChart data={analytics.priorityBreakdown || {}} />
                  </div>
                </>
              )}

              {!analytics && !loading && (
                <div className="text-center py-20 text-slate-400">
                  <p className="text-6xl mb-4">📊</p>
                  <p className="font-bold text-lg text-slate-600">Select a date range</p>
                  <p className="text-sm mt-1">View patient counts, revenue, and priority breakdown</p>
                </div>
              )}
            </>
          )}

          {/* Overview */}
          {tab === 'overview' && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">Quick Actions</h2>
                <button onClick={() => setTab('analytics')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition text-left">
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">View Analytics</p>
                    <p className="text-slate-400 text-xs">Revenue, patients, priority breakdown</p>
                  </div>
                </button>
              </div>

              <div className="rounded-2xl p-6 text-white"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🏥</span>
                  <h2 className="font-black text-base">Admin Control Panel</h2>
                </div>
                <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>Smart Diagnosis Center management</p>
                <div className="space-y-2 text-sm" style={{ color: '#d4a017' }}>
                  <p>◆ Real-time emergency alerts</p>
                  <p>◆ Analytics & revenue tracking</p>
                  <p>◆ Priority case breakdown</p>
                  <p>◆ Patient flow monitoring</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
