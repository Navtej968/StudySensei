"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/* eslint no-unused-vars: 0 */ // --> OFF
/**
 * Custom error handler
 * @param {object} error - error object
 * @param {import('express').Request} _req - request object
 * @param {import('express').Response} res - response object
 * @param {import('express').NextFunction} next - next function
 */
function errorHandler(error, _req, res, next) {
  if (res.headersSent) return next(error);
  return res.status(500).json({
    error: 'Something went wrong'
  });
}
var _default = errorHandler;
exports.default = _default;