"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = require("express");
var _AuthController = _interopRequireDefault(require("../controllers/AuthController"));
var _AppController = _interopRequireDefault(require("../controllers/AppController"));
var _CategoriesController = _interopRequireDefault(require("../controllers/CategoriesController"));
var _CoursesController = _interopRequireDefault(require("../controllers/CoursesController"));
var _UsersController = _interopRequireDefault(require("../controllers/UsersController"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = (0, _express.Router)();

// App status endpoints
router.get('/status', _AppController.default.getStatus);
router.get('/stats', _AppController.default.getStats);

// Authentication endpoints
router.post('/auth/login', _AuthController.default.login);
router.get('/auth/logout', _AuthController.default.logout);
router.get('/auth/verify-email', _AuthController.default.getEmailToken);
router.put('/auth/verify-email/:userId/:token', _AuthController.default.putVerifyEmail);
router.post('/auth/reset-password/', _AuthController.default.postResetPassword);
router.put('/auth/reset-password/:userId/:token', _AuthController.default.putResetPassword);

// Users endpoints
router.post('/users', _UsersController.default.postUser);
router.get('/users/me', _UsersController.default.getUser);
router.delete('/users/me', _UsersController.default.deleteUser);
router.put('/users/me/email', _UsersController.default.putEmail);
router.put('/users/me/password', _UsersController.default.putPassword);
router.put('/users/me/topics', _UsersController.default.putTopic);
router.get('/users/me/bookmarks', _UsersController.default.getBookmarks);
router.put('/users/me/bookmarks', _UsersController.default.putBookmark);

// Categories endpoints
router.get('/categories', _CategoriesController.default.getCategories);
router.get('/categories/:id', _CategoriesController.default.getCategoriesById);
router.get('/categories/:id/subcategories', _CategoriesController.default.getSubcategoriesByCategory);
router.get('/subcategories', _CategoriesController.default.getSubcategories);
router.get('/subcategories/:id', _CategoriesController.default.getSubcategoriesById);

// Courses endpoints
router.get('/courses', _CoursesController.default.getCourses);
router.get('/courses/:id', _CoursesController.default.getCoursesById);
var _default = router;
exports.default = _default;