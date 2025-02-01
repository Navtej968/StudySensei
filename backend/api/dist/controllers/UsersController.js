"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeCrypto = require("node:crypto");
var _mongoose = require("mongoose");
var _format = _interopRequireDefault(require("../utils/format"));
var _user = _interopRequireDefault(require("../models/user"));
var _course = _interopRequireDefault(require("../models/course"));
var _token = _interopRequireDefault(require("../models/token"));
var _emailJobs = _interopRequireDefault(require("../jobs/emailJobs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// User controller class
class UserController {
  /**
   * Creates new user
   * @typedef {import('express').Request} Request
   * @typedef {import('express').Response} Response
   * @typedef {import('express').NextFunction} Next
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async postUser(req, res, next) {
    const {
      email,
      password
    } = req.body;
    let user;
    if (!email) {
      return res.status(400).json({
        error: 'Missing email'
      });
    }
    if (!password) {
      return res.status(400).json({
        error: 'Missing password'
      });
    }
    try {
      if (await _user.default.findOne({
        email
      })) {
        return res.status(409).json({
          error: 'User already exists'
        });
      }
      user = new _user.default({
        email,
        password
      });
      user.hashPassword();
      await user.save();
    } catch (error) {
      return next(error);
    }
    const token = new _token.default({
      user: user._id,
      token: (0, _nodeCrypto.randomBytes)(32).toString('hex'),
      role: 'verify'
    });
    await token.save();
    _emailJobs.default.addEmailJob(user, 'welcome', token.token);
    return res.status(201).json(_format.default.formatUser(user));
  }

  /**
   * Get user details
   * @param {Request} req - request object
   * @param {Response} res - response object
   */
  static async getUser(req, res) {
    const {
      user
    } = req;
    res.status(200).json(_format.default.formatUser(user));
  }

  /**
   * Get user details
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async deleteUser(req, res, next) {
    const {
      user
    } = req;
    try {
      await _user.default.findByIdAndDelete(user._id);
    } catch (error) {
      next(error);
      return;
    }
    res.status(204).json();
  }

  /**
   * Update user's email
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async putEmail(req, res, next) {
    const {
      user
    } = req;
    const {
      email
    } = req.body;
    if (!email) {
      return res.status(400).json({
        error: 'Missing email'
      });
    }
    try {
      user.email = email;
      user.verified = false;
      await user.save();
      const token = new _token.default({
        user: user._id,
        role: 'verify',
        token: (0, _nodeCrypto.randomBytes)(32).toString('hex')
      });
      _emailJobs.default.addEmailJob(user, 'verify', token.token);
    } catch (error) {
      return next(error);
    }
    return res.status(200).json(_format.default.formatUser(user));
  }

  /**
   * Update logged in user's password
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async putPassword(req, res, next) {
    const {
      user
    } = req;
    const {
      password
    } = req.body;
    if (!password) {
      return res.status(400).json({
        error: 'Missing password'
      });
    }
    try {
      user.password = password;
      user.hashPassword();
      await user.save();
    } catch (error) {
      return next(error);
    }
    return res.status(204).json();
  }

  /**
   * Add or remove topic to the list of topics belonging to a user
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async putTopic(req, res, next) {
    const {
      user
    } = req;
    const {
      topic
    } = req.body;
    const {
      action
    } = req.query;
    if (!topic) return res.status(400).json({
      error: 'Missing topic'
    });
    if (!action) return res.status(400).json({
      error: 'Missing action parameter'
    });
    if (action !== 'add' && action !== 'del') {
      return res.status(400).json({
        error: 'Invalid action'
      });
    }
    if (!user.topics.includes(topic) && action === 'add') {
      user.topics.push(topic);
    }
    if (user.topics.includes(topic) && action === 'del') {
      user.topics.pop(user.topics.indexOf(topic));
    }
    try {
      await user.save();
    } catch (error) {
      return next(error);
    }
    return res.status(200).json(_format.default.formatUser(user));
  }

  /**
   * Gets list of all user's bookmarks
   * @param {Request} req - request object
   * @param {Response} res - response object
   */
  static async getBookmarks(req, res) {
    const {
      user
    } = req;
    const bookmarks = user.bookmarks.map(bookmark => _format.default.formatCourse(bookmark));
    res.status(200).json({
      count: bookmarks.length,
      bookmarks
    });
  }

  /**
   * Add and delete users' bookmarks
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async putBookmark(req, res, next) {
    const {
      user
    } = req;
    const {
      courseId
    } = req.body;
    const {
      action
    } = req.query;
    if (!courseId) return res.status(400).json({
      error: 'Missing course id'
    });
    if (!_mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(404).json({
        error: 'Not found'
      });
    }
    if (!action) return res.status(400).json({
      error: 'Missing action parameter'
    });
    if (action !== 'add' && action !== 'del') {
      return res.status(400).json({
        error: 'Invalid action'
      });
    }
    try {
      const course = await _course.default.findById(courseId);
      if (!course) return res.status(404).json({
        error: 'Not found'
      });
      if (action === 'add' && !user.bookmarks.some(bookmark => bookmark._id.toString() === course._id.toString())) {
        user.bookmarks.push(course);
      }
      if (action === 'del') {
        user.bookmarks = user.bookmarks.filter(bookmark => bookmark._id.toString() !== courseId);
      }
      await user.save();
    } catch (error) {
      return next(error);
    }
    return res.status(200).json(_format.default.formatUser(user));
  }
}
var _default = UserController;
exports.default = _default;