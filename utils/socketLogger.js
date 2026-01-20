const logger = require('./logger');

/**
 * Creates a logger function that emits logs to a socket channel and writes to a log file.
 * 
 * @param {object} io - The Socket.IO server instance
 * @param {string} logChannel - The socket channel to emit logs to
 * @param {string} jobId - The unique job ID for file logging
 * @returns {function} A logging function that accepts a message string
 */
const createSocketLogger = (io, logChannel, jobId) => {
  return (message) => {
    // Emit to socket
    if (io) {
      io.emit(logChannel, { 
        message: message, 
        timestamp: new Date() 
      });
    }
    
    // Write to file using the existing logger util
    logger(jobId, message);
    
    // Also log to console for server-side debugging
    console.log(`[${jobId}] ${message}`);
  };
};

module.exports = createSocketLogger;
