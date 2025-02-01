"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mongoose = require("mongoose");
// Schema for course collection
const courseSchema = new _mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true,
    default: process.env.DEFAULT_IMAGE
  },
  subcategory: String,
  category: {
    type: _mongoose.SchemaTypes.ObjectId,
    ref: 'Subcategories'
  }
}, {
  timestamps: true
});
const Course = (0, _mongoose.model)('Courses', courseSchema);
var _default = Course;
exports.default = _default;