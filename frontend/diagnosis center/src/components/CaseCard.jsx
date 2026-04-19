import PriorityBadge from './PriorityBadge'

export default function CaseCard({
  patientName,
  priorityLevel,
  symptomScore,
  assignedDoctor,
  queuePosition,
  appointmentStatus,
}) {
  const isEmergency = priorityLevel === 'Emergency'

  return (
    <div
      className={`rounded-xl shadow-md p-4 bg-white ${
        isEmergency ? 'border-2 border-red-500' : 'border border-gray-100'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-lg">{patientName}</h3>
        <PriorityBadge priority={priorityLevel} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>
          <span className="font-medium text-gray-700">Symptom Score:</span> {symptomScore}
        </div>
        <div>
          <span className="font-medium text-gray-700">Doctor:</span>{' '}
          {assignedDoctor || 'Unassigned'}
        </div>
        <div>
          <span className="font-medium text-gray-700">Queue Position:</span>{' '}
          {queuePosition ?? '—'}
        </div>
        <div>
          <span className="font-medium text-gray-700">Status:</span>{' '}
          {appointmentStatus || 'Pending'}
        </div>
      </div>
    </div>
  )
}
