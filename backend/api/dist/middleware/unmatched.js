"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
/**
 * Custom response for unmatched routes
 * @param {object} error - error object
 * @param {import('express').Request} _req - request object
 * @param {import('express').Response} res - response object
 */
function unmatchedRoutes(req, res) {
  if (req.method.toLowerCase() === 'options') res.end();else res.status(404).json({
    error: 'Not found'
  });
}
var _default = unmatchedRoutes;
exports.default = _default;