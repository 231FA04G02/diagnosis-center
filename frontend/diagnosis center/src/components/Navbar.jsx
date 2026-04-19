import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Stethoscope, Home, Info, Briefcase, Phone,
  LayoutDashboard, LogOut, LogIn, Menu, X, AlertCircle
} from 'lucide-react'

const DASHBOARD_PATHS = {
  patient: '/dashboard/patient',
  doctor:  '/dashboard/doctor',
  admin:   '/dashboard/admin',
}

const NAV_LINKS = [
  { to: '/',        label: 'Home',     Icon: Home },
  { to: '/about',   label: 'About',    Icon: Info },
  { to: '/services',label: 'Services', Icon: Briefcase },
  { to: '/contact', label: 'Contact',  Icon: Phone },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="shadow-md sticky top-0 z-30"
      style={{ background: 'linear-gradient(90deg, #7c2d12 0%, #9a3412 60%, #c2410c 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-black text-lg tracking-tight hover:opacity-90 transition">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#d97706' }}>
            <Stethoscope size={18} className="text-white" />
          </div>
          DiagnosisCenter
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {NAV_LINKS.map(({ to, label, Icon }) => (
            <Link key={to} to={to}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-orange-100 hover:text-white hover:bg-white/10 transition">
              <Icon size={14} />
              {label}
            </Link>
          ))}

          {user ? (
            <>
              <Link to={DASHBOARD_PATHS[user.role] || '/'}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-orange-100 hover:text-white hover:bg-white/10 transition">
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
              {user.role === 'patient' && (
                <Link to="/emergency"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition"
                  style={{ color: '#fca5a5' }}>
                  <AlertCircle size={14} />
                  Emergency
                </Link>
              )}
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 ml-2 px-4 py-2 rounded-lg font-semibold transition hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login"
              className="flex items-center gap-1.5 ml-2 px-4 py-2 rounded-lg font-bold transition hover:opacity-90"
              style={{ background: '#d97706', color: '#fff' }}>
              <LogIn size={14} />
              Login
            </Link>
          )}
        </div>

        {/* Hamburger */}
        <button className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition"
          onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-1 text-sm font-medium border-t border-white/10"
          style={{ background: 'rgba(0,0,0,0.2)' }}>
          {NAV_LINKS.map(({ to, label, Icon }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-orange-100 hover:text-white hover:bg-white/10 transition">
              <Icon size={15} />{label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to={DASHBOARD_PATHS[user.role] || '/'} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-orange-100 hover:text-white hover:bg-white/10 transition">
                <LayoutDashboard size={15} />Dashboard
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-orange-100 hover:text-white hover:bg-white/10 transition">
                <LogOut size={15} />Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg font-bold"
              style={{ color: '#fbbf24' }}>
              <LogIn size={15} />Login
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
