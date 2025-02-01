"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mongoose = require("mongoose");
const subcategoriesSchema = new _mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true
  },
  category: {
    type: _mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: 'Categories'
  },
  keywords: [{
    type: String
  }]
}, {
  timestamps: true
});
const Subcategory = (0, _mongoose.model)('Subcategories', subcategoriesSchema);
var _default = Subcategory;
exports.default = _default;