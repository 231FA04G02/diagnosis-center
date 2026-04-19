// Feature: smart-diagnosis-center
import QueueEntry from '../models/QueueEntry.js';
import * as sseBroadcaster from './sseBroadcaster.js';

/**
 * Add a new entry to the queue.
 *
 * @param {string} caseId
 * @param {string} patientId
 * @param {string} priorityLevel
 * @param {number} symptomScore
 * @param {Date} submittedAt
 */
export async function enqueue(caseId, patientId, priorityLevel, symptomScore, submittedAt) {
  await QueueEntry.create({ caseId, patientId, priorityLevel, symptomScore, submittedAt });
}

/**
 * Remove an entry from the queue and broadcast an update to all doctors/admins.
 *
 * @param {string} caseId
 */
export async function dequeue(caseId) {
  const entry = await QueueEntry.findOneAndDelete({ caseId });
  if (entry) {
    sseBroadcaster.broadcastToRole('doctor', 'case-update', {});
    sseBroadcaster.broadcastToRole('admin', 'case-update', {});
  }
}

/**
 * Get the queue position and estimated wait time for a patient.
 * Returns null if the patient is not in the queue.
 *
 * @param {string} patientId
 * @returns {Promise<{ position: number, estimatedWaitMinutes: number } | null>}
 */
export async function getPosition(patientId) {
  const entries = await QueueEntry.find()
    .sort({ symptomScore: -1, submittedAt: 1 })
    .lean();

  const index = entries.findIndex((e) => String(e.patientId) === String(patientId));
  if (index === -1) return null;

  return {
    position: index + 1,
    estimatedWaitMinutes: index * 15,
  };
}

/**
 * Move a case to the front of the queue by setting submittedAt to epoch
 * and symptomScore to 100.
 *
 * @param {string} caseId
 */
export async function moveToFront(caseId) {
  await QueueEntry.findOneAndUpdate(
    { caseId },
    { submittedAt: new Date(0), symptomScore: 100 }
  );
}

/**
 * Broadcast the current queue position to the patient and a case-update
 * event to all doctors/admins.
 *
 * @param {string} patientId
 */
export async function broadcastUpdate(patientId) {
  const positionData = await getPosition(patientId);
  if (positionData) {
    sseBroadcaster.broadcast(String(patientId), 'queue-update', positionData);
  }
  sseBroadcaster.broadcastToRole('doctor', 'case-update', {});
  sseBroadcaster.broadcastToRole('admin', 'case-update', {});
}
