"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mongoose = require("mongoose");
// Categories schema
const categorySchema = new _mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});
const Category = (0, _mongoose.model)('Categories', categorySchema);
var _default = Category;
exports.default = _default;