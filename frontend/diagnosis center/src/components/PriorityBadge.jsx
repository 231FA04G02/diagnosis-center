const STYLES = {
  Emergency: 'bg-red-500 text-white',
  High: 'bg-orange-400 text-white',
  Medium: 'bg-yellow-400 text-gray-800',
  Low: 'bg-green-400 text-white',
}

export default function PriorityBadge({ priority }) {
  const style = STYLES[priority] || STYLES.Low
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      {priority}
    </span>
  )
}
