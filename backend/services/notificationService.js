// Feature: smart-diagnosis-center
// Notification Service — Firebase FCM push notifications

import admin from 'firebase-admin';
import User from '../models/User.js';

let firebaseInitialized = false;

try {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw && raw.trim() !== '{}') {
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
  }
} catch (err) {
  console.error('[Notification] Firebase init failed:', err.message);
}

/**
 * Send a push notification to a specific user.
 * Fire-and-forget; errors are logged but not thrown.
 *
 * @param {string} userId
 * @param {string} title
 * @param {string} body
 * @param {object} data
 */
export async function sendToUser(userId, title, body, data = {}) {
  try {
    console.log(`[Notification] To user ${userId}: ${title} — ${body}`);

    if (!firebaseInitialized) return;

    const user = await User.findById(userId).select('fcmTokens').lean();
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) return;

    const messages = user.fcmTokens.map((token) => ({
      token,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    }));

    await admin.messaging().sendEach(messages);
  } catch (err) {
    console.error('[Notification] sendToUser error:', err.message);
  }
}

/**
 * Send a push notification to all users with a given role.
 * Fire-and-forget; errors are logged but not thrown.
 *
 * @param {string} role
 * @param {string} title
 * @param {string} body
 * @param {object} data
 */
export async function sendToRole(role, title, body, data = {}) {
  try {
    console.log(`[Notification] To role ${role}: ${title} — ${body}`);

    if (!firebaseInitialized) return;

    const users = await User.find({ role, fcmTokens: { $exists: true, $not: { $size: 0 } } })
      .select('fcmTokens')
      .lean();

    for (const user of users) {
      const messages = user.fcmTokens.map((token) => ({
        token,
        notification: { title, body },
        data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      }));
      await admin.messaging().sendEach(messages);
    }
  } catch (err) {
    console.error('[Notification] sendToRole error:', err.message);
  }
}

/**
 * Register an FCM token for a user.
 *
 * @param {string} userId
 * @param {string} fcmToken
 */
export async function registerToken(userId, fcmToken) {
  await User.findByIdAndUpdate(userId, { $addToSet: { fcmTokens: fcmToken } });
}
