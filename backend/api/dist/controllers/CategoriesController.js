"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mongoose = require("mongoose");
var _category = _interopRequireDefault(require("../models/category"));
var _subcategory = _interopRequireDefault(require("../models/subcategory"));
var _format = _interopRequireDefault(require("../utils/format"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// Categories class controller
class CategoriesController {
  /**
   * Gets list of all categories
   * @typedef {import('express').Request} Request
   * @typedef {import('express').Response} Response
   * @typedef {import('express').NextFunction} Next
   * @param {Request} _req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async getCategories(_req, res, next) {
    let categories;
    try {
      categories = (await _category.default.find({})).map(category => _format.default.formatCategory(category));
    } catch (error) {
      next(error);
      return;
    }
    res.status(200).json(categories);
  }

  /**
   * Get a specific category by its id
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async getCategoriesById(req, res, next) {
    const {
      id
    } = req.params;
    let category;
    if (!_mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: 'Not found'
      });
    }
    try {
      category = await _category.default.findById(id);
    } catch (error) {
      return next(error);
    }
    if (!category) return res.status(404).json({
      error: 'Not found'
    });
    return res.status(200).json(_format.default.formatCategory(category));
  }

  /**
   * Gets list of subcategories for a specific category
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async getSubcategoriesByCategory(req, res, next) {
    let subcategories;
    const {
      id
    } = req.params;
    if (!_mongoose.Types.ObjectId.isValid(id)) {
      return res.status(200).json({
        count: 0,
        subcategories: []
      });
    }
    try {
      subcategories = (await _subcategory.default.find({
        category: id
      })).map(subcategory => _format.default.formatSubcategory(subcategory));
    } catch (error) {
      return next(error);
    }
    return res.status(200).json({
      count: subcategories.length,
      subcategories
    });
  }

  /**
   * Gets list of subcategories
   * @param {Request} _req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async getSubcategories(_req, res, next) {
    let subcategories;
    try {
      subcategories = (await _subcategory.default.find({})).map(subcategory => _format.default.formatSubcategory(subcategory));
    } catch (error) {
      return next(error);
    }
    return res.status(200).json(subcategories);
  }

  /**
   * Get a subcategory by its id
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @param {Next} next - next function
   */
  static async getSubcategoriesById(req, res, next) {
    const {
      id
    } = req.params;
    if (!_mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: 'Not found'
      });
    }
    let subcategory;
    try {
      subcategory = await _subcategory.default.findById(id);
    } catch (error) {
      return next(error);
    }
    if (!subcategory) return res.status(404).json({
      error: 'Not found'
    });
    return res.status(200).json(_format.default.formatSubcategory(subcategory));
  }
}
var _default = CategoriesController;
exports.default = _default;