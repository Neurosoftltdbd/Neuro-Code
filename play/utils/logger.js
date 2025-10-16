const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const appendFile = promisify(fs.appendFile);
const LOG_FILE = path.join(__dirname, '../logs/app.log');

// Ensure logs directory exists
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logLevels = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG'
};

const log = async (level, message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message} ${Object.keys(data).length ? JSON.stringify(data) : ''}\n`;
    
    // Log to console
    if (level === logLevels.ERROR) {
        console.error(logMessage.trim());
    } else if (level === logLevels.WARN) {
        console.warn(logMessage.trim());
    } else if (level === logLevels.DEBUG) {
        console.debug(logMessage.trim());
    } else {
        console.log(logMessage.trim());
    }
    
    // Log to file
    try {
        await appendFile(LOG_FILE, logMessage);
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
};

module.exports = {
    info: (message, data) => log(logLevels.INFO, message, data),
    warn: (message, data) => log(logLevels.WARN, message, data),
    error: (message, error) => log(logLevels.ERROR, message, { error: error?.message || String(error) }),
    debug: (message, data) => log(logLevels.DEBUG, message, data),
    logLevels
};
