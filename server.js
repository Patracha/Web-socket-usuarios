const http = require('http');
const app = require('./app');
const configureSocket = require('./routes/socketRoutes');

const server = http.createServer(app);
configureSocket(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});