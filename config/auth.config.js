require('dotenv').config();

module.exports = {
  SECRET_KEY: process.env.JWT_SECRET || 'SuperSecureSecretKey',
  jwtOptions: {
    expiresIn: '24h',
    algorithm: 'HS256'
  },
  socketOptions: {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000
    }
  }
};