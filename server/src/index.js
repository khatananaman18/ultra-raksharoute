import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config.js';
import { setupSocketIO } from './socket.js';
import { simulationService } from './services/simulationService.js';

import authRouter from './routes/auth.js';
import ambulancesRouter from './routes/ambulances.js';
import hospitalsRouter from './routes/hospitals.js';
import bookingsRouter from './routes/bookings.js';
import followupsRouter from './routes/followups.js';
import analyticsRouter from './routes/analytics.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

setupSocketIO(io);
simulationService.setSocketServer(io);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach Socket.IO to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'RakshaRoute Emergency Dispatch Engine',
    version: '1.0.0',
    region: 'India / Delhi NCR Hub',
    demoMode: config.demoMode,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/ambulances', ambulancesRouter);
app.use('/api/hospitals', hospitalsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/followups', followupsRouter);
app.use('/api/analytics', analyticsRouter);

// Error Handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`🚑 RakshaRoute Dispatch Server running on port ${PORT}`);
  console.log(`📡 WebSocket Engine active`);
  console.log(`🏥 Healthcare Hub: ${config.defaultCity} (Lat: ${config.defaultCoordinates.lat}, Lng: ${config.defaultCoordinates.lng})`);
});
