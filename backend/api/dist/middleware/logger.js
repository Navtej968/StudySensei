"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _winston = require("winston");
/**
 * @typedef {import('winston').Logger} WinstonLogger
 * Requests logger
 * @returns {WinstonLogger} - Winston logger instance
 */
function accessLogger() {
  const accessLogs = process.env.SERVER_ACCESS_LOGS || './logs/server/access.log';
  const requestLogFormat = _winston.format.printf(({
    level,
    timestamp,
    meta
  }) => {
    const {
      method,
      url
    } = meta.req;
    const {
      statusCode
    } = meta.res;
    const {
      responseTime
    } = meta;
    return `[${timestamp}] ${level.toUpperCase()}: ${method} ${url} ${statusCode} ${responseTime}`;
  });
  const logger = (0, _winston.createLogger)({
    transports: [new _winston.transports.File({
      filename: accessLogs
    })],
    format: _winston.format.combine(_winston.format.timestamp(), requestLogFormat)
  });
  return logger;
}

/**
 * Internal errors logger
 * @returns {WinstonLogger} winston logger object for logging internal server errors
 */
function errorLogger() {
  const errorLogs = process.env.SERVER_ERROR_LOGS || './logs/server/error.log';
  const errorLogFormat = _winston.format.printf(({
    level,
    timestamp,
    meta
  }) => {
    const {
      method,
      url
    } = meta.req;
    const {
      message
    } = meta;
    return `[${timestamp}] ${level.toUpperCase()}: ${method} ${url} Error: ${message} {}`;
  });
  const logger = (0, _winston.createLogger)({
    transports: [new _winston.transports.File({
      filename: errorLogs
    })],
    format: _winston.format.combine(_winston.format.timestamp(), errorLogFormat)
  });
  return logger;
}
const logger = {
  accessLogger,
  errorLogger
};
var _default = logger;
exports.default = _default;