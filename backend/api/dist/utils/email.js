"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodemailer = _interopRequireDefault(require("nodemailer"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Sends email to user
 * @param {string} email - user email address
 * @param {string} subject - email subject
 * @param {string} data - email body
 */
async function sendEmail(email, subject, body) {
  const {
    MAIL_USER,
    MAIL_PASSWORD,
    MAIL_SERVICE
  } = process.env;
  try {
    const transporter = _nodemailer.default.createTransport({
      service: MAIL_SERVICE,
      secure: true,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD
      }
    });
    await transporter.sendMail({
      from: MAIL_USER,
      to: email,
      subject,
      html: body
    });
  } catch (error) {
    const spacing = '\n\t';
    const errorMessage = `Sending email failed:${spacing}to: ${email}${spacing}` + `subject: ${subject}${spacing}error: ${error}`;
    throw new Error(errorMessage);
  }
}
var _default = sendEmail;
exports.default = _default;