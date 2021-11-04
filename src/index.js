const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

const tempDir = `${os.homedir()}/audio`;

const server = app.listen(config.port, () => {
  logger.info(`Listening to port ${config.port}`);

  exec('audiowaveform -v', (error) => {
    error
      ? server.close(() => logger.error('Audiowaveform not on path. Closing server.'))
      : logger.info('Found Audiowaveform on path');
  });

  if (!fs.existsSync(tempDir)) {
    fs.mkdir(tempDir, (error) => {
      error
        ? server.close(() => logger.error(`Error creating temp folder: ${JSON.stringify(error)}`))
        : logger.info(`Created temp folder: ${tempDir}`);
    });
  }
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
