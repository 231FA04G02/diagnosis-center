// Feature: smart-diagnosis-center
// Analytics Service — MongoDB aggregation pipelines for dashboard analytics

import Appointment from '../models/Appointment.js';
import Case from '../models/Case.js';

/**
 * Get daily completed appointment counts within a date range.
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Array<{ date: string, count: number }>>}
 */
export async function getDailyPatientCounts(startDate, endDate) {
  const results = await Appointment.aggregate([
    {
      $match: {
        status: 'completed',
        appointmentTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$appointmentTime' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } },
  ]);
  return results;
}

/**
 * Get daily revenue within a date range.
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} consultationFee
 * @returns {Promise<Array<{ date: string, revenue: number }>>}
 */
export async function getDailyRevenue(startDate, endDate, consultationFee) {
  const results = await Appointment.aggregate([
    {
      $match: {
        status: 'completed',
        appointmentTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$appointmentTime' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: { $multiply: ['$count', consultationFee] },
      },
    },
  ]);
  return results;
}

/**
 * Get case count breakdown by priority level for a given date.
 *
 * @param {Date} date
 * @returns {Promise<{ Emergency: number, High: number, Medium: number, Low: number }>}
 */
export async function getPriorityBreakdown(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const results = await Case.aggregate([
    {
      $match: {
        submittedAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$priorityLevel',
        count: { $sum: 1 },
      },
    },
  ]);

  const breakdown = { Emergency: 0, High: 0, Medium: 0, Low: 0 };
  for (const { _id, count } of results) {
    if (_id in breakdown) breakdown[_id] = count;
  }
  return breakdown;
}
