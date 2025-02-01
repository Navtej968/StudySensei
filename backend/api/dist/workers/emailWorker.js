"use strict";

var _bull = _interopRequireDefault(require("bull"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _email = _interopRequireDefault(require("../utils/email"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_dotenv.default.config();

// Email Worker
const EmailWorker = new _bull.default('Send email');
EmailWorker.process(job => {
  const {
    email,
    subject,
    body
  } = job.data;
  try {
    (0, _email.default)(email, subject, body);
  } catch (error) {
    console.error(`Processing email job #${job.id} failed:\n\t${error.message}`);
  }
});

// Info log
EmailWorker.on('completed', job => {
  console.log(`Email job #${job.id} processed successful`);
});