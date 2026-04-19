import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef, useState } from 'react'
import {
  Brain, Zap, BarChart3, Stethoscope, ClipboardList,
  UserCheck, CheckCircle, Clock, Shield, HeartPulse
} from 'lucide-react'

const features = [
  {
    Icon: Brain,
    title: 'AI Analysis',
    desc: 'GPT-4o powered symptom analysis gives instant, accurate triage results.',
    detail: 'Describe symptoms and our AI instantly analyzes severity, suggests next steps, and assigns a priority level.',
    link: '/book',
    linkText: 'Try AI Analysis',
  },
  {
    Icon: Zap,
    title: 'Priority System',
    desc: 'Automatic classification — Emergency, High, Medium, or Low.',
    detail: 'Our smart engine scores symptoms and ensures the most critical patients are always attended to first.',
    link: '/services',
    linkText: 'View Services',
  },
  {
    Icon: BarChart3,
    title: 'Real-time Queue',
    desc: 'Live queue tracking so you always know your position and wait time.',
    detail: "No more waiting in the dark. Track your live queue position and get notified when it's your turn.",
    link: '/dashboard/patient',
    linkText: 'View Dashboard',
  },
]

const stats = [
  { Icon: UserCheck,   value: '10,000+', label: 'Patients Served' },
  { Icon: Stethoscope, value: '50+',     label: 'Specialist Doctors' },
  { Icon: Clock,       value: '< 2 min', label: 'AI Triage Time' },
  { Icon: Shield,      value: '24/7',    label: 'Emergency Support' },
]

const steps = [
  { step: '1', Icon: ClipboardList, title: 'Describe Symptoms', desc: 'Enter symptoms in plain language — Hindi or English.' },
  { step: '2', Icon: Brain,         title: 'AI Analysis',       desc: 'GPT-4o mini analyzes and assigns a priority level instantly.' },
  { step: '3', Icon: UserCheck,     title: 'Doctor Assigned',   desc: 'A doctor and lab are automatically assigned based on priority.' },
  { step: '4', Icon: CheckCircle,   title: 'Get Treated',       desc: "Track your queue live and get notified when it's your turn." },
]

function useFadeIn() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function FadeSection({ children, delay = 0 }) {
  const [ref, visible] = useFadeIn()
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-28 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)' }}>

        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10 animate-pulse"
            style={{ background: '#60a5fa', animationDuration: '3s' }} />
          <div className="absolute top-10 right-10 w-48 h-48 rounded-full opacity-10 animate-pulse"
            style={{ background: '#93c5fd', animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-5 animate-pulse"
            style={{ background: '#fff', animationDuration: '5s', animationDelay: '0.5s' }} />
          {[...Array(6)].map((_, i) => (
            <div key={i}
              className="absolute w-2 h-2 rounded-full opacity-20 animate-bounce"
              style={{
                background: '#bfdbfe',
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDuration: `${2 + i * 0.4}s`,
                animationDelay: `${i * 0.3}s`,
              }} />
          ))}
        </div>

        <div className="relative z-10" style={{
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(-24px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}>
          <span className="inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-6 border"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#bfdbfe', borderColor: 'rgba(255,255,255,0.2)' }}>
            🏥 Smart Healthcare Platform
          </span>

          <h1 className="text-5xl sm:text-6xl font-black mb-4 tracking-tight leading-tight text-white">
            Smart Diagnosis<br />
            <span style={{ color: '#93c5fd' }}>Center</span>
          </h1>

          <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: '#bfdbfe' }}>
            AI-powered medical triage — describe your symptoms and get instant priority classification, doctor assignment, and queue tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? '/book' : '/login'}
              className="font-bold px-8 py-3.5 rounded-xl shadow-lg text-base hover:scale-105 active:scale-95 flex items-center gap-2 justify-center"
              style={{
                background: '#fff',
                color: '#1d4ed8',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 4px 20px rgba(255,255,255,0.25)',
              }}>
              <Stethoscope size={18} /> Book Appointment
            </Link>
            <Link to="/emergency"
              className="font-bold px-8 py-3.5 rounded-xl shadow-lg text-base border-2 hover:scale-105 active:scale-95 flex items-center gap-2 justify-center"
              style={{
                background: '#dc2626',
                color: '#fff',
                borderColor: '#dc2626',
                transition: 'transform 0.15s ease',
              }}>
              <HeartPulse size={18} /> Emergency
            </Link>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z"
              fill="#eff6ff" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <FadeSection>
        <section className="py-10 px-6 bg-blue-50">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <div key={s.label} style={{ animation: `fadeUp 0.6s ease ${i * 0.1}s both` }}>
                <div className="flex justify-center mb-2">
                  <s.Icon size={28} className="text-blue-600" />
                </div>
                <p className="text-3xl font-black text-blue-800">{s.value}</p>
                <p className="text-sm mt-1 font-medium text-blue-600">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* ── Why Choose Us ── */}
      <section className="py-20 px-6 bg-white">
        <FadeSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3 text-blue-800">Why Choose Us</h2>
            <p className="max-w-xl mx-auto text-blue-600">Everything you need for smart, fast, and reliable medical care.</p>
          </div>
        </FadeSection>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <FadeSection key={f.title} delay={i * 120}>
              <div className="rounded-2xl p-6 flex flex-col h-full border border-blue-100 bg-blue-50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
                  <f.Icon size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-black mb-2 text-blue-800">{f.title}</h3>
                <p className="text-sm leading-relaxed mb-2 text-blue-700">{f.desc}</p>
                <p className="text-xs leading-relaxed flex-1 text-blue-500">{f.detail}</p>
                <Link to={f.link}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition hover:gap-2">
                  {f.linkText} <span>→</span>
                </Link>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6 bg-blue-50">
        <FadeSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3 text-blue-800">How It Works</h2>
            <p className="text-blue-600">From symptoms to treatment in 4 simple steps.</p>
          </div>
        </FadeSection>

        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <FadeSection key={s.step} delay={i * 100}>
              <div className="rounded-2xl bg-white p-5 text-center border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-full text-white text-sm font-black flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
                  {s.step}
                </div>
                <div className="flex justify-center mb-3">
                  <s.Icon size={28} className="text-blue-600" />
                </div>
                <h4 className="font-black text-sm mb-1 text-blue-800">{s.title}</h4>
                <p className="text-xs leading-relaxed text-blue-600">{s.desc}</p>
              </div>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <FadeSection>
        <section className="py-20 px-6 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)' }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 rounded-full border-2 border-blue-300 opacity-10 animate-ping"
              style={{ animationDuration: '3s' }} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4 text-white">Ready to get started?</h2>
            <p className="mb-8 max-w-md mx-auto text-sm text-blue-200">
              Join thousands of patients who trust Smart Diagnosis Center for fast, AI-powered healthcare.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={user ? '/book' : '/login'}
                className="font-bold px-8 py-3.5 rounded-xl transition hover:scale-105 active:scale-95 shadow-lg bg-white text-blue-700 hover:bg-blue-50">
                Get Started Free
              </Link>
              <Link to="/services"
                className="font-bold px-8 py-3.5 rounded-xl transition hover:scale-105 active:scale-95 border-2 border-white/40 text-white hover:bg-white/10">
                View Services
              </Link>
            </div>
          </div>
        </section>
      </FadeSection>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
