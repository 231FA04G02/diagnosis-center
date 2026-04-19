import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const services = [
  {
    icon: '🩸',
    title: 'Blood Test',
    desc: 'Comprehensive blood panels including CBC, metabolic panels, and lipid profiles.',
    duration: '30 min',
    price: '₹500',
  },
  {
    icon: '🧲',
    title: 'MRI',
    desc: 'High-resolution magnetic resonance imaging for detailed soft-tissue diagnostics.',
    duration: '60 min',
    price: '₹3,500',
  },
  {
    icon: '☢️',
    title: 'X-Ray',
    desc: 'Fast digital X-ray imaging for bones, chest, and abdominal assessments.',
    duration: '15 min',
    price: '₹800',
  },
  {
    icon: '❤️',
    title: 'ECG',
    desc: 'Electrocardiogram monitoring to detect heart rhythm and electrical activity.',
    duration: '20 min',
    price: '₹600',
  },
  {
    icon: '🔊',
    title: 'Ultrasound',
    desc: 'Non-invasive ultrasound imaging for organs, pregnancy, and vascular studies.',
    duration: '45 min',
    price: '₹1,200',
  },
  {
    icon: '🩺',
    title: 'Consultation',
    desc: 'One-on-one consultations with experienced specialists across all disciplines.',
    duration: '30 min',
    price: '₹700',
  },
]

export default function Services() {
  const { user } = useAuth()
  const navigate = useNavigate()

  function handleBook(serviceTitle) {
    if (!user) {
      // Not logged in — go to login, then redirect to book
      navigate('/login', { state: { from: { pathname: '/book' } } })
    } else if (user.role !== 'patient') {
      navigate('/book')
    } else {
      // Pass service as query param so BookAppointment can pre-fill
      navigate(`/book?service=${encodeURIComponent(serviceTitle)}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-extrabold mb-3">Our Services</h1>
        <p className="text-blue-100 text-lg max-w-xl mx-auto">
          Comprehensive diagnostic and treatment services under one roof.
        </p>
      </section>

      {/* Services Grid */}
      <section className="max-w-5xl mx-auto py-16 px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-xl shadow-md p-6 bg-white border border-gray-100 hover:shadow-lg transition flex flex-col"
            >
              <div className="text-4xl mb-3">{s.icon}</div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">{s.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">{s.desc}</p>

              {/* Meta info */}
              <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                <span>⏱ {s.duration}</span>
                <span className="font-semibold text-blue-600 text-sm">{s.price}</span>
              </div>

              {/* Book button */}
              <button
                onClick={() => handleBook(s.title)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 active:scale-95 transition"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-50 border-t border-blue-100 py-12 px-6 text-center">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Not sure which service you need?</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Describe your symptoms and our AI will recommend the right test or consultation.
        </p>
        <Link
          to={user ? '/book' : '/login'}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow"
        >
          Start AI Symptom Check
        </Link>
      </section>
    </div>
  )
}
