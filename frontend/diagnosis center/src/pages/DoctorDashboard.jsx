import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import CaseCard from '../components/CaseCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'
import useSSE from '../hooks/useSSE'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const STATUS_OPTIONS = ['scheduled', 'in-progress', 'completed', 'cancelled']

const NAV = [
  { id: 'cases',   icon: '⊕', label: 'Active Cases' },
  { id: 'queue',   icon: '≡', label: 'Queue' },
  { id: 'reports', icon: '↑', label: 'Upload Reports' },
]

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl">{icon}</span>
        <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
      </div>
      <p className="text-3xl font-black text-slate-800">{value}</p>
      <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">{label}</p>
    </div>
  )
}

export default function DoctorDashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('cases')
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [emergency, setEmergency] = useState(null)
  const [uploadState, setUploadState] = useState({})
  const [statusUpdating, setStatusUpdating] = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pollRef = useRef(null)

  const initials = (user?.name || 'D').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const sseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/dashboard/stream`

  function fetchCases() {
    client.get('/dashboard/cases')
      .then(({ data }) => setCases(data.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCases()
    pollRef.current = setInterval(fetchCases, 5000)
    return () => clearInterval(pollRef.current)
  }, [])

  useSSE(sseUrl, (data) => {
    if (data.type === 'emergency') setEmergency({ patientName: data.patientName })
    if (data.cases) setCases(data.cases)
  })

  function handleUploadChange(caseId, field, value) {
    setUploadState(prev => ({ ...prev, [caseId]: { ...prev[caseId], [field]: value, error: '' } }))
  }

  async function handleUpload(caseId) {
    const { file, patientId } = uploadState[caseId] || {}
    if (!file) { handleUploadChange(caseId, 'error', 'Please select a file.'); return }
    if (file.size > MAX_FILE_SIZE) { handleUploadChange(caseId, 'error', 'File exceeds 10 MB.'); return }
    handleUploadChange(caseId, 'uploading', true)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('caseId', caseId)
      if (patientId) fd.append('patientId', patientId)
      await client.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setUploadState(prev => ({ ...prev, [caseId]: { file: null, patientId: '', uploading: false, error: '' } }))
    } catch (err) {
      handleUploadChange(caseId, 'error', err.message)
      handleUploadChange(caseId, 'uploading', false)
    }
  }

  async function handleStatusChange(apptId, newStatus) {
    setStatusUpdating(prev => ({ ...prev, [apptId]: true }))
    try {
      await client.patch(`/appointments/${apptId}/status`, { status: newStatus })
      setCases(prev => prev.map(c => c.appointmentId === apptId ? { ...c, appointmentStatus: newStatus } : c))
    } catch (err) { setError(err.message) }
    finally { setStatusUpdating(prev => ({ ...prev, [apptId]: false })) }
  }

  const emergencyCases = cases.filter(c => c.priorityLevel === 'Emergency').length
  const highCases      = cases.filter(c => c.priorityLevel === 'High').length

  return (
    <div className="flex min-h-screen" style={{ background: '#f1f5f9' }}>

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)' }}>

        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-base font-black tracking-tight text-white">🏥 DiagnosisCenter</p>
          <p className="text-xs mt-0.5" style={{ color: '#d4a017' }}>Doctor Portal</p>
        </div>

        <div className="px-6 py-4 border-b border-white/10">
          <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: '#d4a017' }}>{initials}</div>
            <div>
              <p className="font-semibold text-sm text-white">Dr. {user?.name}</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Doctor</p>
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
              {n.id === 'cases' && emergencyCases > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#ef4444', color: '#fff' }}>
                  {emergencyCases}
                </span>
              )}
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
              <p className="text-xs text-slate-400">Dr. {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {emergencyCases > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full animate-pulse" style={{ background: '#fee2e2', color: '#dc2626' }}>
                🚨 {emergencyCases} Emergency
              </span>
            )}
            <Link to="/profile"
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: '#d4a017' }}>{initials}</Link>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {emergency && (
            <div className="rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg"
              style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
              <div className="flex items-center gap-3 text-white">
                <span className="text-2xl">🚨</span>
                <div>
                  <p className="font-bold">Emergency Alert</p>
                  <p className="text-red-100 text-sm">Patient <strong>{emergency.patientName}</strong> needs immediate help</p>
                </div>
              </div>
              <button onClick={() => setEmergency(null)} className="text-red-200 hover:text-white text-xl font-bold">×</button>
            </div>
          )}

          {error && <ErrorBanner message={error} />}

          {/* Cases */}
          {tab === 'cases' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="🩺" label="Total Cases"   value={cases.length}  accent="#d4a017" />
                <StatCard icon="🚨" label="Emergency"     value={emergencyCases} accent="#ef4444" />
                <StatCard icon="⚠️" label="High Priority" value={highCases}      accent="#f97316" />
                <StatCard icon="✅" label="Low Priority"  value={cases.filter(c => c.priorityLevel === 'Low').length} accent="#10b981" />
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-500 mb-5 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#d4a017' }} /> Active Cases (Live)
                </h2>
                {loading ? <LoadingSpinner /> : cases.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-4xl mb-3">🩺</p><p className="font-medium">No active cases</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cases.map(c => {
                      const caseId = c._id || c.caseId
                      const apptId = c.appointmentId
                      return (
                        <div key={caseId} className={`border rounded-2xl p-4 space-y-3 transition
                          ${c.priorityLevel === 'Emergency' ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}>
                          <CaseCard
                            patientName={c.patientId?.name || c.patientName}
                            priorityLevel={c.priorityLevel}
                            symptomScore={c.symptomScore}
                            assignedDoctor={c.assignedDoctorId?.name || c.assignedDoctor}
                            queuePosition={c.queuePosition}
                            appointmentStatus={c.appointmentStatus}
                          />
                          {apptId && (
                            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Status:</label>
                              <select
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
                                style={{ '--tw-ring-color': '#d4a017' }}
                                value={c.appointmentStatus || 'scheduled'}
                                onChange={e => handleStatusChange(apptId, e.target.value)}
                                disabled={statusUpdating[apptId]}>
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              {statusUpdating[apptId] && <LoadingSpinner />}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Reports Upload */}
          {tab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-500 mb-5 uppercase tracking-widest">Upload Patient Reports</h2>
              {loading ? <LoadingSpinner /> : cases.length === 0 ? (
                <p className="text-slate-400 text-sm">No active cases.</p>
              ) : (
                <div className="space-y-4">
                  {cases.map(c => {
                    const caseId = c._id || c.caseId
                    const upState = uploadState[caseId] || {}
                    return (
                      <div key={caseId} className="border border-slate-100 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: '#fef3c7' }}>👤</div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{c.patientId?.name || 'Patient'}</p>
                            <p className="text-xs text-slate-400">Case: {caseId?.toString().slice(-8)}</p>
                          </div>
                        </div>
                        {upState.error && <p className="text-red-500 text-xs">{upState.error}</p>}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input type="file" accept="application/pdf,image/*"
                            className="text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm flex-1"
                            style={{ '--file-bg': '#fef3c7' }}
                            onChange={e => handleUploadChange(caseId, 'file', e.target.files[0])} />
                          <input type="text" placeholder="Patient ID"
                            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none sm:w-40"
                            value={upState.patientId || ''}
                            onChange={e => handleUploadChange(caseId, 'patientId', e.target.value)} />
                          {upState.uploading ? <LoadingSpinner /> : (
                            <button onClick={() => handleUpload(caseId)}
                              className="px-5 py-1.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
                              style={{ background: '#d4a017' }}>
                              Upload
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

          {/* Queue */}
          {tab === 'queue' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-500 mb-5 uppercase tracking-widest">Patient Queue</h2>
              {loading ? <LoadingSpinner /> : cases.length === 0 ? (
                <div className="text-center py-12 text-slate-400"><p className="text-4xl mb-3">📊</p><p>Queue is empty</p></div>
              ) : (
                <div className="space-y-3">
                  {cases.map((c, i) => (
                    <div key={c._id} className={`flex items-center gap-4 p-4 rounded-xl border transition
                      ${c.priorityLevel === 'Emergency' ? 'border-red-200 bg-red-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
                        style={{ background: c.priorityLevel === 'Emergency' ? '#ef4444' : '#0f172a' }}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">{c.patientId?.name || 'Patient'}</p>
                        <p className="text-xs text-slate-400">{c.priorityLevel} · Score: {c.symptomScore}</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          background: c.priorityLevel === 'Emergency' ? '#fee2e2' : c.priorityLevel === 'High' ? '#ffedd5' : c.priorityLevel === 'Medium' ? '#fef9c3' : '#dcfce7',
                          color: c.priorityLevel === 'Emergency' ? '#dc2626' : c.priorityLevel === 'High' ? '#ea580c' : c.priorityLevel === 'Medium' ? '#ca8a04' : '#16a34a'
                        }}>
                        {c.priorityLevel}
                      </span>
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
