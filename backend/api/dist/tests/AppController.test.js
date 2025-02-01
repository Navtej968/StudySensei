"use strict";

var _chai = _interopRequireDefault(require("chai"));
var _chaiHttp = _interopRequireDefault(require("chai-http"));
var _mongoose = _interopRequireDefault(require("mongoose"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _crypto = require("crypto");
var _category = _interopRequireDefault(require("../models/category"));
var _subcategory = _interopRequireDefault(require("../models/subcategory"));
var _course = _interopRequireDefault(require("../models/course"));
var _server = _interopRequireDefault(require("../server"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_dotenv.default.config();
_chai.default.use(_chaiHttp.default);
const {
  expect,
  request
} = _chai.default;
describe('Status and stats endpoints tests', () => {
  let db;
  before(async () => {
    const randomString = () => (0, _crypto.randomBytes)(16).toString('hex');
    const categoriesCreationPromises = [];
    const subcategoriesCreationPromises = [];
    const coursesCreationPromises = [];

    // DB connection
    db = await _mongoose.default.connect(process.env.DB_TEST_URI);

    // Categories, subcategories and courses test data
    for (let i = 0; i < 10; i += 1) {
      const category = new _category.default({
        title: randomString()
      });
      const subcategory = new _subcategory.default({
        title: randomString(),
        category: category._id,
        keywords: [randomString(), randomString()]
      });
      const course = new _course.default({
        title: randomString(),
        description: randomString(),
        provider: randomString(),
        category: subcategory._id,
        url: randomString(),
        imageUrl: randomString()
      });
      categoriesCreationPromises.push(category.save());
      subcategoriesCreationPromises.push(subcategory.save());
      coursesCreationPromises.push(course.save());
    }
    await Promise.all(categoriesCreationPromises);
    await Promise.all(subcategoriesCreationPromises);
    await Promise.all(coursesCreationPromises);
  });
  after(async () => {
    await db.connection.dropDatabase();
    _mongoose.default.connection.close();
  });
  describe('GET /status', () => {
    it('should return db and redis status', done => {
      request(_server.default).get('/status').end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.db).to.be.true;
        expect(res.body.redis).to.be.true;
        done();
      });
    });
  });
  describe('GET /stats', () => {
    it('should count of categories, subcategories, and courses', done => {
      request(_server.default).get('/stats').end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.categories).to.equal(10);
        expect(res.body.subcategories).to.equal(10);
        expect(res.body.courses).to.equal(10);
        done();
      });
    });
  });
});