"use strict";

var _chai = _interopRequireDefault(require("chai"));
var _chaiHttp = _interopRequireDefault(require("chai-http"));
var _sinon = _interopRequireDefault(require("sinon"));
var _mongoose = _interopRequireDefault(require("mongoose"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _redis = require("redis");
var _crypto = require("crypto");
var _user = _interopRequireDefault(require("../models/user"));
var _course = _interopRequireDefault(require("../models/course"));
var _emailJobs = _interopRequireDefault(require("../jobs/emailJobs"));
var _server = _interopRequireDefault(require("../server"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_dotenv.default.config();
_chai.default.use(_chaiHttp.default);
const {
  expect,
  request
} = _chai.default;
describe('Users endpoints tests', () => {
  let db;
  let redis;
  let testUser;
  let authToken;
  let emailStub;
  let testCourse;
  const newPassword = 'anothersupersecret';
  const randomString = () => (0, _crypto.randomBytes)(16).toString('hex');
  before(async () => {
    // Stub to prevent creation of email jobs
    emailStub = _sinon.default.stub(_emailJobs.default, 'addEmailJob').callsFake(() => console.log('Email sent'));

    // Redis and DB connection
    db = await _mongoose.default.connect(process.env.DB_TEST_URI);
    redis = (0, _redis.createClient)({
      url: process.env.REDIS_TEST_URI
    });
    await redis.connect();

    // User data setup
    testUser = new _user.default({
      email: 'test_user@mail.com',
      password: 'supersecret'
    });
    testUser.hashPassword();
    testUser.verified = true;
    testCourse = new _course.default({
      title: randomString(),
      provider: randomString(),
      description: randomString(),
      category: new _mongoose.default.Types.ObjectId(),
      url: randomString(),
      imageUrl: randomString()
    });
    authToken = randomString();
    await testUser.save();
    await testCourse.save();
    await redis.set(`auth_${authToken}`, testUser._id.toString());
  });
  after(async () => {
    await db.connection.dropDatabase();
    await _mongoose.default.connection.close();
    await redis.del(`auth_${authToken}`);
    await redis.quit();
  });
  describe('POST /users', () => {
    it('should create new user', done => {
      request(_server.default).post('/users').send({
        email: 'new_user.email.com',
        password: 'supersecret'
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(201);
        expect(res.body).have.keys('id', 'email', 'verified', 'topics', 'bookmarks');
        expect(res.body.verified).to.be.false;
        expect(emailStub.calledOnce).to.be.true;
        done();
      });
    });
    it('should prevent creation of user account with existing email', done => {
      request(_server.default).post('/users').send({
        email: 'new_user.email.com',
        password: 'supersecret'
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(409);
        expect(res.body.error).to.equal('User already exists');
        done();
      });
    });
    it('should return error 400 for missing email', done => {
      request(_server.default).post('/users').end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Missing email');
        done();
      });
    });
    it('should return error 400 for missing password', done => {
      request(_server.default).post('/users').send({
        email: 'new_user.email.com'
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Missing password');
        done();
      });
    });
  });
  describe('GET /users/me', () => {
    it('should return user details', done => {
      request(_server.default).get('/users/me').set('X-Token', authToken).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys('id', 'email', 'verified', 'topics', 'bookmarks');
        expect(res.body.id).to.equal(testUser._id.toString());
        done();
      });
    });
    it('should return 401 error for unauthorized user', done => {
      request(_server.default).get('/users/me').set('X-Token', randomString()).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.error).to.equal('Unauthorized');
        done();
      });
    });
  });
  describe('PUT /users/me/email', () => {
    it('should change user email', done => {
      request(_server.default).put('/users/me/email').set('X-Token', authToken).send({
        email: 'another_email@mail.com'
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.have.keys('id', 'email', 'verified', 'topics', 'bookmarks');
        expect(res.body.email).to.equal('another_email@mail.com');
        expect(res.body.verified).to.be.false;
        expect(emailStub.calledTwice).to.be.true;
        done();
      });
    });
    it('should return 400 error for missing email', done => {
      request(_server.default).put('/users/me/email').set('X-Token', authToken).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Missing email');
        done();
      });
    });
    it('should return 401 error for unauthorized user', done => {
      request(_server.default).put('/users/me/email').set('X-Token', randomString()).send({
        email: 'another_email@mail.com'
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.error).to.equal('Unauthorized');
        done();
      });
    });
  });
  describe('PUT /users/me/password', () => {
    it('should change user email', done => {
      request(_server.default).put('/users/me/password').set('X-Token', authToken).send({
        password: newPassword
      }).end(async (error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(204);
        testUser = await _user.default.findById(testUser._id);
        expect(testUser.isValidPassword(newPassword)).to.be.true;
        done();
      });
    });
    it('should return 400 error for missing password', done => {
      request(_server.default).put('/users/me/password').set('X-Token', authToken).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Missing password');
        done();
      });
    });
    it('should return 401 error for unauthorized user', done => {
      request(_server.default).put('/users/me/password').set('X-Token', randomString()).send({
        password: randomString()
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.error).to.equal('Unauthorized');
        done();
      });
    });
  });
  describe('PUT /users/me/topics', () => {
    it('should add a topic to user list of topics', done => {
      request(_server.default).put('/users/me/topics').query({
        action: 'add'
      }).set('X-Token', authToken).send({
        topic: 'machine learning'
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.topics).to.be.an('Array').with.lengthOf(1);
        expect(res.body.topics[0]).to.equal('machine learning');
        done();
      });
    });
    it('should not add topic if it already exists in list of topics', done => {
      request(_server.default).put('/users/me/topics').query({
        action: 'add'
      }).set('X-Token', authToken).send({
        topic: 'machine learning'
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.topics).to.be.an('Array').with.lengthOf(1);
        expect(res.body.topics[0]).to.equal('machine learning');
        done();
      });
    });
    it('should delete a topic to user list of topics', done => {
      request(_server.default).put('/users/me/topics').query({
        action: 'del'
      }).set('X-Token', authToken).send({
        topic: 'machine learning'
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.topics).to.be.an('Array').with.lengthOf(0);
        done();
      });
    });
    it('should not raise conflict when deleting operation is not in list of topics', done => {
      request(_server.default).put('/users/me/topics').query({
        action: 'del'
      }).set('X-Token', authToken).send({
        topic: 'machine learning'
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.topics).to.be.an('Array').with.lengthOf(0);
        done();
      });
    });
    it('should return 400 error for missing topic', done => {
      request(_server.default).put('/users/me/topics').query({
        action: 'add'
      }).set('X-Token', authToken).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Missing topic');
        done();
      });
    });
    it('should return 400 error for missing action query parameter', done => {
      request(_server.default).put('/users/me/topics').set('X-Token', authToken).send({
        topic: 'machine learning'
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Missing action parameter');
        done();
      });
    });
    it('should return 400 error for invalid action query parameter', done => {
      request(_server.default).put('/users/me/topics').query({
        action: 'test'
      }).set('X-Token', authToken).send({
        topic: 'machine learning'
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Invalid action');
        done();
      });
    });
    it('should return 401 error for unauthorized user', done => {
      request(_server.default).put('/users/me/topics').query({
        action: 'add'
      }).set('X-Token', randomString()).send({
        topic: 'machine learning'
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.error).to.equal('Unauthorized');
        done();
      });
    });
  });
  describe('PUT /users/me/bookmarks', () => {
    it('should add a course to user list bookmarks', done => {
      request(_server.default).put('/users/me/bookmarks').query({
        action: 'add'
      }).set('X-Token', authToken).send({
        courseId: testCourse._id.toString()
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.bookmarks).to.be.an('Array').with.lengthOf(1);
        done();
      });
    });
    it('should not course if it already exists in list of bookmarks', done => {
      request(_server.default).put('/users/me/bookmarks').query({
        action: 'add'
      }).set('X-Token', authToken).send({
        courseId: testCourse._id.toString()
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.bookmarks).to.be.an('Array').with.lengthOf(1);
        done();
      });
    });
    it('should delete a bookmark to user list of bookmarks', done => {
      request(_server.default).put('/users/me/bookmarks').query({
        action: 'del'
      }).set('X-Token', authToken).send({
        courseId: testCourse._id.toString()
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.bookmarks).to.be.an('Array').with.lengthOf(0);
        done();
      });
    });
    it('should not raise conflict when deleting a bookmark not in list of bookmarks', done => {
      request(_server.default).put('/users/me/bookmarks').query({
        action: 'del'
      }).set('X-Token', authToken).send({
        courseId: testCourse._id.toString()
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.bookmarks).to.be.an('Array').with.lengthOf(0);
        done();
      });
    });
    it('should return 400 error for missing bookmark', done => {
      request(_server.default).put('/users/me/bookmarks').query({
        action: 'add'
      }).set('X-Token', authToken).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Missing course id');
        done();
      });
    });
    it('should return 404 if course does not exists', done => {
      request(_server.default).put('/users/me/bookmarks').query({
        action: 'add'
      }).set('X-Token', authToken).send({
        courseId: randomString()
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(404);
        expect(res.body.error).to.equal('Not found');
        done();
      });
    });
    it('should return 400 error for missing action query parameter', done => {
      request(_server.default).put('/users/me/bookmarks').set('X-Token', authToken).send({
        courseId: testCourse._id.toString()
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Missing action parameter');
        done();
      });
    });
    it('should return 400 error for invalid action query parameter', done => {
      request(_server.default).put('/users/me/bookmarks').query({
        action: 'test'
      }).set('X-Token', authToken).send({
        courseId: testCourse._id.toString()
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.error).to.equal('Invalid action');
        done();
      });
    });
    it('should return 401 error for unauthorized user', done => {
      request(_server.default).put('/users/me/bookmarks').query({
        action: 'add'
      }).set('X-Token', randomString()).send({
        courseId: testCourse._id.toString()
      }).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.error).to.equal('Unauthorized');
        done();
      });
    });
  });
  describe('DELETE /users/me', () => {
    it('should return 401 error for unauthorized user', done => {
      request(_server.default).delete('/users/me').set('X-Token', randomString()).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.error).to.equal('Unauthorized');
        done();
      });
    });
    it('should delete user', done => {
      request(_server.default).delete('/users/me').set('X-Token', authToken).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(204);
        done();
      });
    });
    it('should return 401 error for deleted user', done => {
      request(_server.default).delete('/users/me').set('X-Token', authToken).end((error, res) => {
        expect(error).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.error).to.equal('Unauthorized');
        done();
      });
    });
  });
});