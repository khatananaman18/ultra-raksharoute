import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5050,
  jwtSecret: process.env.JWT_SECRET || 'raksharoute-emergency-secret-key-2026',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  demoMode: process.env.DEMO_MODE !== 'false', // Default to true for seamless review
  defaultCity: 'Delhi NCR',
  defaultCoordinates: {
    lat: 28.6139,
    lng: 77.2090, // New Delhi center
  }
};
