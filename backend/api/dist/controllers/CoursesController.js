"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mongoose = require("mongoose");
var _course = _interopRequireDefault(require("../models/course"));
var _format = _interopRequireDefault(require("../utils/format"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class CourseController {
  /**
   * Gets list of all courses or course belonging to
   * specified subcategory
   * @typedef {import('express').Request} Request
   * @typedef {import('express').Response} Response
   * @typedef {import('express').NextFunction} Next
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async getCourses(req, res, next) {
    let courses;
    const filters = {};
    const PAGE_LIMIT = 10;
    const {
      provider
    } = req.query;
    let {
      categoryId
    } = req.query;
    const page = /^\d+$/.test(req.query.page) ? parseInt(req.query.page, 10) : 0;
    categoryId = _mongoose.Types.ObjectId.isValid(categoryId) ? new _mongoose.Types.ObjectId(categoryId) : categoryId;
    if (categoryId) filters.category = categoryId;
    if (provider) filters.provider = provider;
    const sort = {
      _id: 1
    };
    const pipeline = [{
      $match: filters
    }, {
      $sort: sort
    }, {
      $skip: page * PAGE_LIMIT
    }, {
      $limit: PAGE_LIMIT
    }];
    try {
      courses = (await _course.default.aggregate(pipeline)).map(course => _format.default.formatCourse(course));
    } catch (error) {
      return next(error);
    }
    return res.status(200).json(courses);
  }

  /**
    * Gets a course by its id
    * @param {Request} req - request object
    * @param {Response} res - response object
    * @param {Next} next - next function
    */
  static async getCoursesById(req, res, next) {
    let course;
    const {
      id
    } = req.params;
    if (!_mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: 'Not found'
      });
    }
    try {
      course = await _course.default.findById(id);
    } catch (error) {
      return next(error);
    }
    if (!course) return res.status(404).json({
      error: 'Not found'
    });
    return res.status(200).json(_format.default.formatCourse(course));
  }
}
var _default = CourseController;
exports.default = _default;