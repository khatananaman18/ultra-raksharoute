import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { config } from './config.js';
import { setupSocketIO } from './socket.js';
import { simulationService } from './services/simulationService.js';

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

// Attach Socket.IO to requests for real-time broadcasts
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Start Server
const PORT = config.port;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚑 RakshaRoute Dispatch Server running on port ${PORT}`);
  console.log(`📡 WebSocket Engine active`);
  console.log(`🏥 Healthcare Hub: ${config.defaultCity} (Lat: ${config.defaultCoordinates.lat}, Lng: ${config.defaultCoordinates.lng})`);
});
