import useQueue from '../hooks/useQueue'
import LoadingSpinner from './LoadingSpinner'

export default function QueueWidget() {
  const { position, estimatedWaitMinutes, loading } = useQueue()

  if (loading) return <LoadingSpinner />

  return (
    <div className="rounded-xl shadow-md p-4 bg-white border border-gray-100">
      <h3 className="font-semibold text-blue-700 mb-3">Your Queue Position</h3>
      {position != null ? (
        <div className="text-center">
          <p className="text-4xl font-bold text-blue-600 mb-1">#{position}</p>
          <p className="text-gray-500 text-sm">
            Estimated wait:{' '}
            <span className="font-medium text-gray-700">
              {estimatedWaitMinutes ?? '—'} min
            </span>
          </p>
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center">Not currently in queue.</p>
      )}
    </div>
  )
}
