import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import registrationRoutes from './routes/registrations.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/event_management';

// Initialize global mock state. It will fallback to In-Memory mode until MongoDB successfully connects.
global.useMockDb = true;

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity, can restrict in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database Connection with Fallback
try {
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000 // 5s timeout
  });
  console.log('✅ Connected to MongoDB Database successfully. In-Memory mock mode deactivated.');
  global.useMockDb = false;
} catch (err) {
  console.warn('MongoDB connection could not be established. Operating in IN-MEMORY MOCK mode.');
  console.warn(`MongoDB error: ${err.message}`);
  console.log('Ensure MongoDB Atlas allows your current IP address and MONGO_URI is set in backend/.env');
  global.useMockDb = true;
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// Friendly root route for anyone opening the backend URL in a browser.
app.get('/', (req, res) => {
  res.json({
    message: 'Event Management backend is running',
    health: '/api/health',
    endpoints: ['/api/events', '/api/auth/login', '/api/registrations']
  });
});

// Health Check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    mode: global.useMockDb ? 'In-Memory Mock' : 'MongoDB Connection',
    timestamp: new Date(), 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
    console.log(`👉 Access API health status at http://localhost:${PORT}/api/health`);
  });
}

export default app;
