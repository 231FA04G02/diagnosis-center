// Feature: smart-diagnosis-center
// SSE Broadcaster — maintains connected client streams and broadcasts events

const clients = new Map();     // userId → res
const clientRoles = new Map(); // userId → role

/**
 * Register a new SSE client.
 * Sets required SSE headers and sends an initial keep-alive comment.
 *
 * @param {string} userId
 * @param {string} role
 * @param {import('express').Response} res
 */
export function addClient(userId, role, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Initial keep-alive comment
  res.write(': connected\n\n');

  clients.set(userId, res);
  clientRoles.set(userId, role);
}

/**
 * Remove a client from both maps.
 *
 * @param {string} userId
 */
export function removeClient(userId) {
  clients.delete(userId);
  clientRoles.delete(userId);
}

/**
 * Send an SSE event to a specific client.
 *
 * @param {string} userId
 * @param {string} event
 * @param {object} data
 */
export function broadcast(userId, event, data) {
  const res = clients.get(userId);
  if (res) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
}

/**
 * Send an SSE event to all clients with a matching role.
 *
 * @param {string} role
 * @param {string} event
 * @param {object} data
 */
export function broadcastToRole(role, event, data) {
  for (const [userId, clientRole] of clientRoles.entries()) {
    if (clientRole === role) {
      broadcast(userId, event, data);
    }
  }
}
