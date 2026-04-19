import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-blue-800 text-white py-8 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">© {new Date().getFullYear()} DiagnosisCenter. All rights reserved.</p>
        <div className="flex gap-6 text-sm">
          <Link to="/about" className="hover:text-blue-200 transition">About</Link>
          <Link to="/services" className="hover:text-blue-200 transition">Services</Link>
          <Link to="/contact" className="hover:text-blue-200 transition">Contact</Link>
        </div>
      </div>
    </footer>
  )
}
