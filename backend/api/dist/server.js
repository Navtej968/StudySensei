"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _cors = _interopRequireDefault(require("cors"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _expressWinston = _interopRequireDefault(require("express-winston"));
var _routes = _interopRequireDefault(require("./routes"));
var _db = _interopRequireDefault(require("./utils/db"));
var _redis = _interopRequireDefault(require("./utils/redis"));
var _error = _interopRequireDefault(require("./middleware/error"));
var _validator = _interopRequireDefault(require("./middleware/validator"));
var _unmatched = _interopRequireDefault(require("./middleware/unmatched"));
var _logger = _interopRequireDefault(require("./middleware/logger"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_dotenv.default.config();
const app = (0, _express.default)();
const port = process.env.API_PORT || 1245;
const corsOptions = process.env.CORS || '*';
app.use((0, _cors.default)(corsOptions));
app.use(_express.default.json());
app.use(_express.default.urlencoded({
  extended: true
}));
app.use(_expressWinston.default.logger({
  winstonInstance: _logger.default.accessLogger(),
  statusLevels: true
}));
app.use(_validator.default);
app.use(_routes.default);
app.use(_unmatched.default);
app.use(_expressWinston.default.errorLogger({
  winstonInstance: _logger.default.errorLogger()
}));
app.use(_error.default);
_db.default.connect();
_redis.default.connect();
app.listen(port, () => {
  console.log(`Course Finder API server listening at port ${port}`);
});
var _default = app;
exports.default = _default;