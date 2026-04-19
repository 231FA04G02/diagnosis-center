const team = [
  { name: 'Dr. Anand kumar', role: 'Chief Medical Officer', emoji: '👩‍⚕️' },
  { name: 'Dr. keshav kumar', role: 'Head of Emergency Care', emoji: '👨‍⚕️' },
  { name: 'Dr. monika singh', role: 'AI & Diagnostics Lead', emoji: '👩‍💻' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-extrabold mb-3">About Us</h1>
        <p className="text-blue-100 text-lg max-w-xl mx-auto">
          Combining cutting-edge AI with compassionate medical care.
        </p>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto py-16 px-6">
        <div className="rounded-xl shadow-md p-8 bg-white border border-gray-100 mb-10">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Smart Diagnosis Center exists to make quality medical triage accessible to everyone.
            By combining AI-powered symptom analysis with an experienced clinical team, we ensure
            every patient receives the right level of care at the right time.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We believe technology should reduce anxiety, not add to it. Our platform gives patients
            clear, actionable guidance while empowering doctors to focus on what matters most —
            delivering excellent care.
          </p>
        </div>

        {/* Team */}
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Our Team</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="rounded-xl shadow-md p-6 bg-white border border-gray-100 text-center"
            >
              <div className="text-5xl mb-3">{member.emoji}</div>
              <h3 className="font-semibold text-gray-800">{member.name}</h3>
              <p className="text-sm text-blue-600 mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
