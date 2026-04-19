export default function ErrorBanner({ message }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg px-4 py-3 text-sm">
      {message || 'Connection error. Please try again.'}
    </div>
  )
}
