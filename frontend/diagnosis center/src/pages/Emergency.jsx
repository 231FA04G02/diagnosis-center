import { useState } from 'react'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

const EMERGENCY_CONTACTS = [
  { label: 'Emergency Services', number: '112' },
  { label: 'Ambulance', number: '102' },
  { label: 'Diagnosis Center Hotline', number: '+1 (555) 911-0000' },
  { label: 'Poison Control', number: '1-800-222-1222' },
]

export default function Emergency() {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(null) // { queuePosition }
  const [error, setError] = useState('')

  async function handleAlert() {
    setError('')
    setLoading(true)
    try {
      const { data } = await client.post('/emergency/alert')
      setConfirmed(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-red-50 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-red-700 mb-2">Emergency Alert</h1>
          <p className="text-red-500 font-medium">Press only in life-threatening situations</p>
        </div>

        {error && <ErrorBanner message={error} />}

        {/* Alert Button / Confirmation */}
        <div className="rounded-xl shadow-lg p-8 bg-white border-2 border-red-200 text-center space-y-4">
          {confirmed ? (
            <div className="space-y-3">
              <div className="text-5xl">🚨</div>
              <h2 className="text-2xl font-bold text-red-600">Alert Sent!</h2>
              <p className="text-gray-600">
                Medical staff have been notified. Help is on the way.
              </p>
              {confirmed.queuePosition != null && (
                <div className="bg-red-50 rounded-lg px-4 py-3 inline-block">
                  <p className="text-sm text-gray-600">
                    Your queue position:{' '}
                    <span className="font-bold text-red-600 text-lg">
                      #{confirmed.queuePosition}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="py-4">
              <LoadingSpinner />
              <p className="text-gray-500 text-sm mt-2">Sending alert...</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-sm mb-4">
                This will immediately notify all available medical staff and move you to the front of the queue.
              </p>
              <button
                onClick={handleAlert}
                className="bg-red-600 text-white text-xl font-bold px-12 py-5 rounded-2xl hover:bg-red-700 active:scale-95 transition shadow-lg w-full sm:w-auto"
              >
                🚨 TRIGGER EMERGENCY ALERT
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="rounded-xl shadow-md p-5 bg-white border border-red-100">
          <h2 className="font-bold text-red-700 mb-3">⚠️ Important Instructions</h2>
          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
            <li>Use this button only if you are experiencing a life-threatening emergency.</li>
            <li>Misuse of the emergency alert may delay care for others in critical need.</li>
            <li>If you are in immediate danger, also call emergency services directly.</li>
            <li>Stay calm and remain in a safe location until help arrives.</li>
          </ul>
        </div>

        {/* Emergency Contacts */}
        <div className="rounded-xl shadow-md p-5 bg-white border border-red-100">
          <h2 className="font-bold text-red-700 mb-4">Emergency Contacts</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {EMERGENCY_CONTACTS.map((c) => (
              <a
                key={c.number}
                href={`tel:${c.number}`}
                className="flex items-center gap-3 border border-red-100 rounded-lg px-4 py-3 hover:bg-red-50 transition"
              >
                <span className="text-xl">📞</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{c.label}</p>
                  <p className="text-red-600 font-bold">{c.number}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
