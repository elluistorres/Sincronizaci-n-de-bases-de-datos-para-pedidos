// logger.js

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const transports = [];

// Add console transport
transports.push(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
}));

// Add daily rotate file transport
transports.push(new DailyRotateFile({
    filename: 'Public/logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
}));

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: transports,
});

module.exports = logger;