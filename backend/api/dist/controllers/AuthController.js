"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeCrypto = require("node:crypto");
var _mongoose = require("mongoose");
var _redis = _interopRequireDefault(require("../utils/redis"));
var _user = _interopRequireDefault(require("../models/user"));
var _token = _interopRequireDefault(require("../models/token"));
var _emailJobs = _interopRequireDefault(require("../jobs/emailJobs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// Authentication controller class
class AuthController {
  /**
   * Login user
   * @typedef {import('express').Request} Request
   * @typedef {import('express').Response} Response
   * @typedef {import('express').NextFunction} Next
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async login(req, res, next) {
    const {
      email,
      password
    } = req.body;
    let token;
    if (!email) return res.status(400).json({
      error: 'Missing email'
    });
    if (!password) return res.status(400).json({
      error: 'Missing password'
    });
    try {
      const user = await _user.default.findOne({
        email
      });
      if (!user || !user.isValidPassword(password)) {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }
      token = (0, _nodeCrypto.randomBytes)(32).toString('hex');
      await _redis.default.setToken(token, user._id.toString());
    } catch (error) {
      return next(error);
    }
    return res.status(200).json({
      token
    });
  }

  /**
   * Logout user
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async logout(req, res, next) {
    const token = req.get('X-Token');
    try {
      await _redis.default.deleteToken(token);
    } catch (error) {
      return next(error);
    }
    return res.status(204).json();
  }

  /**
   * Get another email verification token if expired
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async getEmailToken(req, res, next) {
    const {
      user
    } = req;
    if (user.verified) return res.status(204).json();
    const token = new _token.default({
      user: user._id,
      role: 'verify',
      token: (0, _nodeCrypto.randomBytes)(32).toString('hex')
    });
    try {
      await token.save();
      await _emailJobs.default.addEmailJob(user, 'verify', token.token);
    } catch (error) {
      return next(error);
    }
    return res.status(204).json();
  }

  /**
   * Validates user email
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async putVerifyEmail(req, res, next) {
    let user;
    let {
      token,
      userId
    } = req.params;
    if (!_mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }
    userId = new _mongoose.Types.ObjectId(userId);
    try {
      token = await _token.default.findOne({
        user: userId,
        role: 'verify',
        token
      });
      if (!token) {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }
      user = await _user.default.findById(userId);
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }
      user.verified = true;
      await user.save();
      await _token.default.deleteOne({
        token: req.params.token
      });
    } catch (error) {
      return next(error);
    }
    return res.status(200).json({
      verified: user.verified
    });
  }

  /**
   * Gets password reset token in forgot password scenarios
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async postResetPassword(req, res, next) {
    let token;
    let user;
    const {
      email
    } = req.body;
    if (!email) {
      return res.status(400).json({
        error: 'Missing email'
      });
    }
    try {
      user = await _user.default.findOne({
        email
      });
      if (!user) return res.status(204).json();
      token = new _token.default({
        user: user._id,
        token: (0, _nodeCrypto.randomBytes)(32).toString('hex'),
        role: 'reset'
      });
      await token.save();
    } catch (error) {
      return next(error);
    }
    _emailJobs.default.addEmailJob(user, 'reset', token.token);
    return res.status(204).json();
  }

  /**
    * Reset users' password
    * @param {Request} req - request object
    * @param {Response} res - response object
    * @param {Next} next - next function
    */
  static async putResetPassword(req, res, next) {
    let user;
    let {
      token
    } = req.params;
    const {
      userId
    } = req.params;
    const {
      password
    } = req.body;
    if (!password) return res.status(400).json({
      error: 'Missing password'
    });
    if (!_mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }
    try {
      token = await _token.default.findOne({
        user: userId,
        role: 'reset',
        token
      });
      if (!token) {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }
      user = await _user.default.findById(userId);
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }
      user.password = password;
      user.hashPassword();
      await user.save();
      await _token.default.deleteOne({
        token: req.params.token
      });
    } catch (error) {
      return next(error);
    }
    return res.status(204).json();
  }
}
var _default = AuthController;
exports.default = _default;