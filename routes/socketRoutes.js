const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { SECRET_KEY, socketOptions } = require('../config/auth.config');

let users = {};

function configureSocket(server) {
  const io = new Server(server, socketOptions);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = await jwt.verify(token, SECRET_KEY);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('New user connected:', socket.user.username);

    // Maneja el evento de nuevo usuario
    socket.on('newUser', (user) => {
      console.log('New user event received:', user);
      users[socket.id] = { id: socket.id, ...user };
      io.emit('initUsers', Object.values(users)); // Enviar solo los valores, sin claves del objeto
    });

    // Maneja el evento de mover avatar
    socket.on('moveAvatar', (data) => {
      console.log('Move avatar event received:', data);
      if (users[socket.id]) {
        users[socket.id].x = data.x;
        users[socket.id].y = data.y;
      }
      io.emit('moveAvatar', { id: socket.id, x: data.x, y: data.y });
    });

    // Maneja el evento de mensaje de chat
    socket.on('chatMessage', (data) => {
      console.log('Chat message event received:', data);
      if (!data.user || !data.message) return; // Evita mensajes inválidos
      io.emit('chatMessage', { user: data.user, message: data.message });
    });

    // Maneja el evento de desconexión de usuario
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      delete users[socket.id];
      io.emit('userDisconnected', socket.id);
    });
  });

  return io;
}

module.exports = configureSocket;