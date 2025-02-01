"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _redis = _interopRequireDefault(require("../utils/redis"));
var _user = _interopRequireDefault(require("../models/user"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Validates login token
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} Next
 * @param {Request} req - request object
 * @param {Response} res - response object
 * @param {Next} next - next function
 */
async function authTokenValidator(req, res, next) {
  const userPaths = /^\/users\/me(\/email|\/password|\/topics|\/bookmarks)?\/?$/;
  const authPaths = /^\/auth\/(logout|verify-email)\/?$/;
  if (!userPaths.test(req.path) && !authPaths.test(req.path)) {
    next();
    return;
  }
  let user;
  const token = req.get('X-Token');
  const userId = await _redis.default.getUserId(token);
  try {
    user = await _user.default.findById(userId).populate('bookmarks');
  } catch (error) {
    next(error);
    return;
  }
  if (!user) {
    res.status(401).json({
      error: 'Unauthorized'
    });
    return;
  }
  req.user = user;
  next();
}
var _default = authTokenValidator;
exports.default = _default;