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
describe('Courses endpoints tests', () => {
  let db;
  let testCourse;
  let subcategoryOne;
  let subcategoryTwo;
  const randomString = () => (0, _crypto.randomBytes)(16).toString('hex');
  before(async () => {
    // DB connection
    db = await _mongoose.default.connect(process.env.DB_TEST_URI);

    // Courses test data
    const category = new _category.default({
      title: randomString()
    });
    subcategoryOne = new _subcategory.default({
      title: randomString(),
      category: category._id,
      keyword: [randomString(), randomString(), randomString()]
    });
    subcategoryTwo = new _subcategory.default({
      title: randomString(),
      category: category._id,
      keyword: [randomString(), randomString(), randomString()]
    });
    await category.save();
    await Promise.all([subcategoryOne.save(), subcategoryTwo.save()]);

    // Create test course data
    const courseCreationPromises = [];
    for (let i = 0; i < 15; i += 1) {
      const course = new _course.default({
        title: randomString(),
        description: randomString(),
        provider: randomString(),
        category: i % 2 ? subcategoryOne._id : subcategoryTwo._id,
        url: randomString(),
        imageUrl: randomString()
      });
      if (i === 14) testCourse = course;
      courseCreationPromises.push(course.save());
    }
    await Promise.all(courseCreationPromises);
  });
  after(async () => {
    await db.connection.dropDatabase();
    await _mongoose.default.connection.close();
  });
  describe('GET /courses', () => {
    it('should return list of courses without the category id and page number', done => {
      request(_server.default).get('/courses').end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('Array').with.lengthOf(10);
        done();
      });
    });
    it('should return list of courses without the category id', done => {
      request(_server.default).get('/courses').query({
        page: 1
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('Array').with.lengthOf(5);
        done();
      });
    });
    it('should return list of courses with categoryId and no page number', done => {
      request(_server.default).get('/courses').query({
        categoryId: subcategoryOne._id.toString()
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('Array').with.lengthOf(7);
        done();
      });
    });
    it('should return filtered list of courses for a different category id', done => {
      request(_server.default).get('/courses').query({
        categoryId: subcategoryTwo._id.toString()
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('Array').with.lengthOf(8);
        done();
      });
    });
    it('should return an empty list when page index is out of range', done => {
      request(_server.default).get('/courses').query({
        categoryId: subcategoryTwo._id.toString(),
        page: 1
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('Array').with.lengthOf(0);
        done();
      });
    });
  });
  describe('GET /course:id', () => {
    it('should return course with given id', done => {
      request(_server.default).get(`/courses/${testCourse._id}`).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.id).to.equal(testCourse._id.toString());
        done();
      });
    });
    it('should return 400 error if course is not found', done => {
      request(_server.default).get(`/courses/${randomString()}`).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(404);
        expect(res.body.error).to.equal('Not found');
        done();
      });
    });
  });
});