import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = {
  Emergency: '#ef4444',
  High: '#fb923c',
  Medium: '#facc15',
  Low: '#4ade80',
}

const PRIORITY_KEYS = ['Emergency', 'High', 'Medium', 'Low']

export default function PriorityPieChart({ data = {} }) {
  const chartData = PRIORITY_KEYS
    .map((key) => ({ name: key, value: data[key] || 0 }))
    .filter((d) => d.value > 0)

  return (
    <div className="rounded-xl shadow-md p-4 bg-white border border-gray-100">
      <h3 className="font-semibold text-blue-700 mb-4">Priority Breakdown</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
