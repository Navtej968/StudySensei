"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mongoose = require("mongoose");
const tokenSchema = new _mongoose.Schema({
  user: {
    type: _mongoose.SchemaTypes.ObjectId,
    ref: 'Users',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});
tokenSchema.index({
  updatedAt: 1
}, {
  expires: process.env.TOKEN_EXPIRY
});
const Token = (0, _mongoose.model)('Tokens', tokenSchema);
var _default = Token;
exports.default = _default;