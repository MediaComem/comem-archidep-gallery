import { createServer as createHttpServer } from 'http';

import app from './app.js';
import { createLogger, host, port } from './config.js';

const logger = createLogger('www');

app.set('port', port);

const server = createHttpServer(app);

server.listen(port, host);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // Handle specific listen errors with friendly messages.
  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE':
      console.error(`Port ${port} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  logger.info(`Listening on ${host}:${port}`);
}
