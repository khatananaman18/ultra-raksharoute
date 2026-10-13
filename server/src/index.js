import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { setupSocketIO } from './socket.js';
import { simulationService } from './services/simulationService.js';

import authRouter from './routes/auth.js';
import ambulancesRouter from './routes/ambulances.js';
import hospitalsRouter from './routes/hospitals.js';
import bookingsRouter from './routes/bookings.js';
import followupsRouter from './routes/followups.js';
import analyticsRouter from './routes/analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../../client/dist');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

setupSocketIO(io);
simulationService.setSocketServer(io);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
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

// Serve static client bundle if built
app.use(express.static(distPath));

// Fallback to client index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚑 RakshaRoute Dispatch Server running on port ${PORT}`);
  console.log(`📡 WebSocket Engine active`);
  console.log(`🏥 Healthcare Hub: ${config.defaultCity} (Lat: ${config.defaultCoordinates.lat}, Lng: ${config.defaultCoordinates.lng})`);
});
