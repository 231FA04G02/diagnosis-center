import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'
import PriorityBadge from '../components/PriorityBadge'

const STEPS = ['Describe Symptoms', 'Review Analysis', 'Confirmation']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => {
        const step = i + 1
        const active = step === current
        const done = step < current
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition
                ${done ? 'bg-blue-600 text-white' : active ? 'bg-blue-700 text-white ring-2 ring-blue-300' : 'bg-gray-200 text-gray-500'}`}
            >
              {done ? '✓' : step}
            </div>
            <span className={`text-sm hidden sm:inline ${active ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300 mx-1" />}
          </div>
        )
      })}
    </div>
  )
}

export default function BookAppointment() {
  const [searchParams] = useSearchParams()
  const serviceFromQuery = searchParams.get('service')

  const [step, setStep] = useState(1)
  const [symptoms, setSymptoms] = useState(
    serviceFromQuery ? `I need a ${serviceFromQuery}. ` : ''
  )
  const [symptomsError, setSymptomsError] = useState('')
  const [analysis, setAnalysis] = useState(null)   // { summary, urgencyLevel, nextSteps, caseId }
  const [appointment, setAppointment] = useState(null) // { doctor, lab, appointmentTime, queuePosition }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAnalyze(e) {
    e.preventDefault()
    setSymptomsError('')
    setError('')
    if (symptoms.trim().length < 10) {
      setSymptomsError('Please describe your symptoms in at least 10 characters.')
      return
    }
    setLoading(true)
    try {
      const { data } = await client.post('/symptoms/analyze', { description: symptoms })
      setAnalysis(data.data)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm() {
    setError('')
    setLoading(true)
    try {
      const { data } = await client.post('/appointments', { caseId: analysis.caseId })
      setAppointment(data.data)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 text-center mb-2">Book Appointment</h1>
        <p className="text-gray-500 text-center mb-8">AI-powered triage in 3 simple steps</p>

        <StepIndicator current={step} />

        {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

        {/* Step 1 */}
        {step === 1 && (
          <div className="rounded-xl shadow-md p-6 bg-white border border-gray-100">
            {serviceFromQuery && (
              <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm text-blue-700">
                <span className="text-lg">🏥</span>
                <span>Booking for: <strong>{serviceFromQuery}</strong></span>
              </div>
            )}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Describe Your Symptoms</h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <textarea
                  className={`w-full border rounded-lg px-4 py-3 h-36 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 ${symptomsError ? 'border-red-400' : ''}`}
                  placeholder="Describe what you're experiencing in detail (e.g. I have a fever of 38.5°C, headache, and sore throat since yesterday)..."
                  value={symptoms}
                  onChange={(e) => { setSymptoms(e.target.value); setSymptomsError('') }}
                />
                {symptomsError && (
                  <p className="text-red-500 text-sm mt-1">{symptomsError}</p>
                )}
                <p className="text-gray-400 text-xs mt-1">{symptoms.length} characters (min 10)</p>
              </div>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Analyze Symptoms
                </button>
              )}
            </form>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && analysis && (
          <div className="rounded-xl shadow-md p-6 bg-white border border-gray-100 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">AI Analysis Result</h2>
              <PriorityBadge priority={analysis.urgencyLevel} />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
              <p className="font-medium text-blue-700 mb-1">Summary</p>
              <p>{analysis.summary}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
              <p className="font-medium text-gray-700 mb-1">Recommended Next Steps</p>
              <p>{analysis.nextSteps}</p>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep(1); setError('') }}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Confirm Appointment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && appointment && (
          <div className="rounded-xl shadow-md p-6 bg-white border border-gray-100 text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-bold text-green-600">Appointment Confirmed!</h2>

            <div className="bg-blue-50 rounded-lg p-4 text-left space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Doctor</span>
                <span>{appointment.doctorName || appointment.doctor || 'To be assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Lab</span>
                <span>{appointment.labName || appointment.lab}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Appointment Time</span>
                <span>
                  {appointment.appointmentTime
                    ? new Date(appointment.appointmentTime).toLocaleString()
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Queue Position</span>
                <span className="font-bold text-blue-600">#{appointment.queuePosition ?? '—'}</span>
              </div>
            </div>

            <a
              href="/dashboard/patient"
              className="inline-block mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Go to My Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
