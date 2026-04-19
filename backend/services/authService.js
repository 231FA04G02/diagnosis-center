import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ROUNDS = 10;

export async function hashPassword(password) {
  return bcrypt.hash(password, ROUNDS);
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export async function register(name, email, password, role) {
  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role });
  const token = signToken(user);
  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

export async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = signToken(user);
  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  };
}
