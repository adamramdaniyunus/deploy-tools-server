const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
 fs.mkdirSync(logDir, { recursive: true });
}

function logger(jobId, message) {
 const logFile = path.join(logDir, `${jobId}.log`);
 const timestamp = new Date().toISOString();
 const logMessage = `[${timestamp}] ${message}\n`;

 fs.appendFileSync(logFile, logMessage);
}

module.exports = logger;