import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import ErrorBanner from '../components/ErrorBanner'

// Role badge colors
const ROLE_STYLES = {
  patient: 'bg-blue-100 text-blue-700',
  doctor: 'bg-green-100 text-green-700',
  admin: 'bg-purple-100 text-purple-700',
}

const ROLE_ICONS = {
  patient: '🧑‍⚕️',
  doctor: '👨‍⚕️',
  admin: '🛡️',
}

export default function ProfilePage() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const [name, setName] = useState(user?.name || '')
  const [avatar, setAvatar] = useState(null)        // current preview (data URL)
  const [savedAvatar, setSavedAvatar] = useState(null)
  const [showPhotoMenu, setShowPhotoMenu] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Load saved avatar from backend on mount
  useEffect(() => {
    client.get('/auth/me')
      .then(({ data }) => {
        if (data.data?.avatar) {
          setAvatar(data.data.avatar)
          setSavedAvatar(data.data.avatar)
        }
        if (data.data?.name) setName(data.data.name)
      })
      .catch(() => {})
  }, [])

  const initials = (user?.name || 'P')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const memberSince = user?.iat
    ? new Date(user.iat * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : '—'

  // Convert file to base64 data URL
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB')
      return
    }
    setError('')
    try {
      const dataUrl = await readFileAsDataURL(file)
      setAvatar(dataUrl)
      setShowPhotoMenu(false)
      // Auto-upload avatar immediately
      await uploadAvatar(dataUrl)
    } catch {
      setError('Failed to read image')
    }
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  async function uploadAvatar(dataUrl) {
    setUploadingAvatar(true)
    setError('')
    try {
      await client.patch('/auth/avatar', { avatar: dataUrl })
      setSavedAvatar(dataUrl)
    } catch (err) {
      setError(err.message || 'Failed to upload photo')
      setAvatar(savedAvatar) // revert preview
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      await client.patch('/auth/profile', { name })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  function handleRemovePhoto() {
    setAvatar(null)
    setSavedAvatar(null)
    setShowPhotoMenu(false)
    client.patch('/auth/avatar', { avatar: null }).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Profile Hero Card ── */}
        <div className="rounded-2xl shadow-lg bg-white border border-gray-100 overflow-hidden">

          {/* Cover banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />
          </div>

          {/* Avatar area */}
          <div className="px-6 pb-6 -mt-12">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">

              {/* Avatar with edit button */}
              <div className="relative w-24 h-24 flex-shrink-0">
                {/* Photo */}
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                    {initials}
                  </div>
                )}

                {/* Upload spinner overlay */}
                {uploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* Camera icon button */}
                <button
                  onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition"
                  title="Change photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {/* Photo menu dropdown */}
                {showPhotoMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                    <button
                      onClick={() => { fileInputRef.current?.click(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition"
                    >
                      <span className="text-lg">🖼️</span> Choose from Gallery
                    </button>
                    <button
                      onClick={() => { cameraInputRef.current?.click(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition"
                    >
                      <span className="text-lg">📷</span> Take a Photo
                    </button>
                    {avatar && (
                      <button
                        onClick={handleRemovePhoto}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100"
                      >
                        <span className="text-lg">🗑️</span> Remove Photo
                      </button>
                    )}
                    <button
                      onClick={() => setShowPhotoMenu(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-gray-50 transition border-t border-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelected}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleFileSelected}
              />

              {/* Name + role */}
              <div className="sm:mb-2 flex-1">
                <h2 className="text-2xl font-bold text-gray-800">{user?.name || '—'}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${ROLE_STYLES[user?.role] || ROLE_STYLES.patient}`}>
                    {ROLE_ICONS[user?.role]} {user?.role || 'patient'}
                  </span>
                  <span className="text-xs text-gray-400">Member since {memberSince}</span>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-xl">✉️</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Email</p>
                  <p className="text-sm text-gray-700">{user?.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-xl">🆔</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{user?.role === 'doctor' ? 'Doctor ID' : 'Patient ID'}</p>
                  <p className="text-xs font-mono text-gray-500 truncate">{user?.id || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit Form ── */}
        <div className="rounded-2xl shadow-md bg-white border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-blue-700 mb-1">Edit Profile</h3>
          <p className="text-sm text-gray-400 mb-5">Update your personal information</p>

          {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <span>✅</span> Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                value={name}
                onChange={(e) => { setName(e.target.value); setSuccess(false) }}
                required
                minLength={2}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Email Address</label>
              <input
                className="w-full border border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-400 cursor-not-allowed"
                value={user?.email || ''}
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Role</label>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold capitalize ${ROLE_STYLES[user?.role] || ROLE_STYLES.patient}`}>
                {ROLE_ICONS[user?.role]} {user?.role || 'patient'}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 transition font-semibold disabled:opacity-50 shadow-sm"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Click outside to close photo menu */}
      {showPhotoMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowPhotoMenu(false)} />
      )}
    </div>
  )
}
