import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import QueueWidget from '../components/QueueWidget'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

const STATUS_STYLES = {
  scheduled:     'bg-amber-50 text-amber-700 border border-amber-200',
  'in-progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  completed:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled:     'bg-slate-100 text-slate-500 border border-slate-200',
}

const NAV = [
  { id: 'overview',     icon: '⊞', label: 'Overview' },
  { id: 'appointments', icon: '◷', label: 'Appointments' },
  { id: 'reports',      icon: '⊡', label: 'Reports' },
]

function isWithinOneHour(t) {
  return new Date(t) - Date.now() < 60 * 60 * 1000
}

function StatCard({ icon, label, value, bg, text, border }) {
  return (
    <div className={`rounded-2xl p-5 border ${bg} ${border}`}>
      <p className={`text-3xl font-black ${text}`}>{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-widest">{label}</p>
      <div className={`text-2xl mt-3 opacity-30`}>{icon}</div>
    </div>
  )
}

export default function PatientDashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('overview')
  const [appointments, setAppointments] = useState([])
  const [reports, setReports] = useState([])
  const [loadingAppts, setLoadingAppts] = useState(true)
  const [loadingReports, setLoadingReports] = useState(true)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const initials = (user?.name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  useEffect(() => {
    client.get('/appointments')
      .then(({ data }) => setAppointments(data.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoadingAppts(false))
    client.get('/reports')
      .then(({ data }) => setReports(data.data || []))
      .catch(() => {})
      .finally(() => setLoadingReports(false))
  }, [])

  async function handleCancel(id) {
    setError('')
    try {
      await client.delete(`/appointments/${id}`)
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a))
    } catch (err) { setError(err.message) }
  }

  async function handleDownload(reportId, filename) {
    try {
      const res = await client.get(`/reports/${reportId}`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a'); a.href = url; a.download = filename || `report-${reportId}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch (err) { setError(err.message) }
  }

  const upcoming  = appointments.filter(a => a.status === 'scheduled').length
  const completed = appointments.filter(a => a.status === 'completed').length

  return (
    <div className="flex min-h-screen" style={{ background: '#f1f5f9' }}>

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)' }}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-base font-black tracking-tight text-white">🏥 DiagnosisCenter</p>
          <p className="text-xs mt-0.5" style={{ color: '#d4a017' }}>Patient Portal</p>
        </div>

        {/* User */}
        <div className="px-6 py-4 border-b border-white/10">
          <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: '#d4a017' }}>{initials}</div>
            <div>
              <p className="font-semibold text-sm text-white">{user?.name || 'Patient'}</p>
              <p className="text-xs capitalize" style={{ color: '#94a3b8' }}>Patient</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setTab(n.id); setSidebarOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition"
              style={tab === n.id
                ? { background: 'rgba(212,160,23,0.15)', color: '#d4a017', borderLeft: '3px solid #d4a017' }
                : { color: '#94a3b8' }}
              onMouseEnter={e => { if (tab !== n.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { if (tab !== n.id) { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#94a3b8' } }}>
              <span className="text-base">{n.icon}</span>{n.label}
            </button>
          ))}
          <div className="pt-3 border-t border-white/10 mt-3 space-y-0.5">
            <Link to="/book"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition"
              style={{ color: '#94a3b8' }}>
              <span>+</span> Book Appointment
            </Link>
            <Link to="/emergency"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{ color: '#f87171' }}>
              <span>🚨</span> Emergency
            </Link>
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition"
            style={{ color: '#94a3b8' }}>
            <span>→</span> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-800">{NAV.find(n => n.id === tab)?.label}</h1>
              <p className="text-xs text-slate-400">Welcome back, {user?.name}</p>
            </div>
          </div>
          <Link to="/profile"
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shadow"
            style={{ background: '#d4a017' }}>{initials}</Link>
        </header>

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {error && <ErrorBanner message={error} />}

          {/* Overview */}
          {tab === 'overview' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="📅" label="Upcoming" value={upcoming} bg="bg-white" text="text-slate-800" border="border-slate-100" />
                <StatCard icon="✅" label="Completed" value={completed} bg="bg-white" text="text-slate-800" border="border-slate-100" />
                <StatCard icon="📄" label="Reports" value={reports.length} bg="bg-white" text="text-slate-800" border="border-slate-100" />
                <StatCard icon="🔢" label="Total Visits" value={appointments.length} bg="bg-white" text="text-slate-800" border="border-slate-100" />
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#d4a017' }} /> Live Queue
                </h2>
                <QueueWidget />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Link to="/book"
                  className="rounded-2xl p-5 flex items-center gap-4 text-white shadow transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
                  <span className="text-3xl">🩺</span>
                  <div>
                    <p className="font-bold">Book Appointment</p>
                    <p className="text-xs opacity-60">AI symptom analysis</p>
                  </div>
                </Link>
                <button onClick={() => setTab('appointments')}
                  className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition text-left">
                  <span className="text-3xl">📅</span>
                  <div><p className="font-bold text-slate-800">Appointments</p><p className="text-slate-400 text-xs">{upcoming} upcoming</p></div>
                </button>
                <button onClick={() => setTab('reports')}
                  className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition text-left">
                  <span className="text-3xl">📄</span>
                  <div><p className="font-bold text-slate-800">Reports</p><p className="text-slate-400 text-xs">{reports.length} available</p></div>
                </button>
              </div>
            </>
          )}

          {/* Appointments */}
          {tab === 'appointments' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-600 mb-5 uppercase tracking-widest">My Appointments</h2>
              {loadingAppts ? <LoadingSpinner /> : appointments.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-4xl mb-3">📅</p>
                  <p className="font-medium">No appointments yet</p>
                  <Link to="/book" className="mt-3 inline-block text-sm font-semibold" style={{ color: '#d4a017' }}>Book your first →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map(appt => {
                    const tooSoon = isWithinOneHour(appt.appointmentTime)
                    const isCancelled = appt.status === 'cancelled'
                    return (
                      <div key={appt._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#fef3c7' }}>👨‍⚕️</div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{appt.doctorId?.name || 'Doctor TBA'}</p>
                            <p className="text-slate-400 text-xs">Lab: {appt.labName || '—'} · {appt.appointmentTime ? new Date(appt.appointmentTime).toLocaleString() : '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[appt.status] || STATUS_STYLES.scheduled}`}>{appt.status}</span>
                          {!isCancelled && (
                            <button onClick={() => handleCancel(appt._id)} disabled={tooSoon}
                              className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium ${tooSoon ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-red-200 text-red-500 hover:bg-red-50'}`}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Reports */}
          {tab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-600 mb-5 uppercase tracking-widest">My Reports</h2>
              {loadingReports ? <LoadingSpinner /> : reports.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-4xl mb-3">📄</p>
                  <p className="font-medium">No reports yet</p>
                  <p className="text-sm mt-1">Reports from your doctor will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map(report => (
                    <div key={report._id} className="flex items-center justify-between border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#f0fdf4' }}>📋</div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{report.originalName || report.filename}</p>
                          <p className="text-slate-400 text-xs">Uploaded: {report.uploadedAt ? new Date(report.uploadedAt).toLocaleDateString() : '—'}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDownload(report._id, report.originalName)}
                        className="text-sm px-4 py-1.5 rounded-lg text-white font-medium transition hover:opacity-90"
                        style={{ background: '#0f172a' }}>
                        ⬇ Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
