"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mongoose = require("mongoose");
var _bcrypt = _interopRequireDefault(require("bcrypt"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const userSchema = new _mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  topics: [{
    type: String,
    required: false
  }],
  bookmarks: [{
    type: _mongoose.SchemaTypes.ObjectId,
    required: false,
    ref: 'Courses'
  }],
  verified: {
    type: Boolean,
    default: false
  }
}, {
  methods: {
    hashPassword() {
      this.password = _bcrypt.default.hashSync(this.password, 8);
    },
    isValidPassword(password) {
      return _bcrypt.default.compareSync(password, this.password);
    }
  },
  timestamps: true
});
const User = (0, _mongoose.model)('Users', userSchema);
var _default = User;
exports.default = _default;