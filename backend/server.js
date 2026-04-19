import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = process.env.FRONTEND_ORIGIN
  ? process.env.FRONTEND_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: 'Server is running' });
});

// Route placeholders
import authRoutes from './routes/auth.js';
import symptomsRoutes from './routes/symptoms.js';
import appointmentsRoutes from './routes/appointments.js';
import reportsRoutes from './routes/reports.js';
import queueRoutes from './routes/queue.js';
import dashboardRoutes from './routes/dashboard.js';
import emergencyRoutes from './routes/emergency.js';
import notificationsRoutes from './routes/notifications.js';
import chatRoutes from './routes/chat.js';

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/symptoms', symptomsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/chat', chatRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  let status = err.status || 500;
  let message = 'Internal server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  } else if (err.code === 11000) {
    status = 409;
    message = 'Duplicate key error: resource already exists';
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    message = err.message || 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    status = 404;
    message = err.message || 'Resource not found';
  } else if (err.message === 'Invalid file type' || err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = err.message === 'Invalid file type' ? 'Invalid file type' : 'File too large (max 10MB)';
  }

  res.status(status).json({ success: false, data: null, message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
