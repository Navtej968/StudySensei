"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _db = _interopRequireDefault(require("../utils/db"));
var _redis = _interopRequireDefault(require("../utils/redis"));
var _category = _interopRequireDefault(require("../models/category"));
var _subcategory = _interopRequireDefault(require("../models/subcategory"));
var _course = _interopRequireDefault(require("../models/course"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// Application controller class
class AppController {
  /**
   * Send API db and redis status
   * @typedef {import('express').Request} Request
   * @typedef {import('express').Response} Response
   * @typedef {import('express').NextFunction} Next
   * @param {Request} _req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async getStatus(_req, res, next) {
    try {
      const dbStatus = _db.default.isReady();
      const redis = _redis.default.isReady();
      res.status(200).json({
        db: dbStatus,
        redis
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send statics on categories, subcategories and courses
   * @param {Request} _req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async getStats(_req, res, next) {
    try {
      const categories = await _category.default.estimatedDocumentCount();
      const subcategories = await _subcategory.default.estimatedDocumentCount();
      const courses = await _course.default.estimatedDocumentCount();
      res.status(200).json({
        categories,
        subcategories,
        courses
      });
    } catch (error) {
      next(error);
    }
  }
}
var _default = AppController;
exports.default = _default;