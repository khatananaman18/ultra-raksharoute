import { db } from './db/store.js';

export function setupSocketIO(io) {
  io.on('connection', socket => {
    // Join room for specific booking
    socket.on('join:booking', bookingId => {
      if (bookingId) {
        socket.join(`booking:${bookingId}`);
      }
    });

    // Leave room
    socket.on('leave:booking', bookingId => {
      if (bookingId) {
        socket.leave(`booking:${bookingId}`);
      }
    });

    // Join role channel
    socket.on('join:role', role => {
      if (role) {
        socket.join(`role:${role}`);
      }
    });

    // Driver live GPS telemetry broadcast
    socket.on('driver:location:send', ({ ambulanceId, lat, lng }) => {
      if (ambulanceId && lat !== undefined && lng !== undefined) {
        db.updateAmbulanceLocation(ambulanceId, lat, lng);
        io.emit('driver:location:update', {
          ambulanceId,
          lat: Number(lat),
          lng: Number(lng),
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Driver availability toggle
    socket.on('driver:availability:toggle', ({ ambulanceId, availability }) => {
      if (ambulanceId && availability) {
        db.updateAmbulanceAvailability(ambulanceId, availability);
        io.emit('ambulance:status:update', { ambulanceId, availability });
      }
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });
}
