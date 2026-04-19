import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    // Static form — no backend endpoint for contact
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-extrabold mb-3">Contact Us</h1>
        <p className="text-blue-100 text-lg">We're here to help. Reach out any time.</p>
      </section>

      <section className="max-w-4xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-10">
        {/* Center Info */}
        <div className="rounded-xl shadow-md p-6 bg-white border border-gray-100 space-y-4">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Center Information</h2>
          <div className="flex items-start gap-3 text-gray-700">
            <span className="text-xl">📍</span>
            <span>123 Medical Drive, Health City, HC 10001</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-xl">📞</span>
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-xl">✉️</span>
            <span>info@diagnosiscenter.com</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-xl">🕐</span>
            <span>Mon–Fri: 8am – 8pm | Sat–Sun: 9am – 5pm</span>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-xl shadow-md p-6 bg-white border border-gray-100">
          <h2 className="text-xl font-bold text-blue-700 mb-4">Send a Message</h2>
          {submitted ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 text-sm">
              Thanks for reaching out! We'll get back to you within 24 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="email"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <textarea
                className="w-full border rounded-lg px-4 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Your message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
