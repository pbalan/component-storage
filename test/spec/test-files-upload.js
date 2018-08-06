
const path = require('path');
const request = require('supertest');
const LoopBackContext = require('loopback-context');

const SIMPLE_APP = path.join(__dirname, '..', 'fixtures', 'simple-app');
let app = require(path.join(SIMPLE_APP, 'server/server.js'));
const fs = require('fs');
const generateAssert = (next) => {
  return (err, res) => {
    if (err) return next.fail(err);
    else return next();
  };
};

const uploadDir = path.join(SIMPLE_APP, 'server', 'storage', 'product-images');

describe('Files', () => {
  describe('When user not in context', () => {
    it('Upload should return 401', (next) => {
      const uploadFile = path.join(__dirname, 'assets', 'WechatIMG398.jpeg');
      const file = fs.readFileSync(uploadFile);
      request(app)
        .post('/api/containers/product-images/upload')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
          file: file,
          container: 'product-images',
        })
        .expect(401, generateAssert(next));
      next();
    });

    it('List files should return 401', (next) => {
      request(app)
        .get('/api/files')
        .set('Accept', 'application/json')
        .expect(401, (err, res) => {
          expect(err).toBe(null);
          expect(res.body.error.code).toBe('AUTHORIZATION_REQUIRED');
          next();
        });
    });
  });

  describe('When user in context', () => {
    let token = null;
    beforeAll((next) => {
      var rmdir = function(dir) {
        var list = fs.readdirSync(dir);
        for (var i = 0; i < list.length; i++) {
          var filename = path.join(dir, list[i]);
          var stat = fs.statSync(filename);

          if (filename == '.' || filename == '..') {
            // pass these files
          } else if (stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
          } else {
            // rm fiilename
            fs.unlinkSync(filename);
          }
        }
        fs.rmdirSync(dir);
      };

      // app = require('../fixtures/simple-app/server/server')();
      request(app)
        .post('/api/users/login')
        .set('Accept', 'application/json')
        .send({
          username: 'generalUser',
          password: 'password',
        })
        .expect(200, (err, res) => {
          expect(err).toBe(null);
          token = res.body.id;
          expect(res.body.userId).toEqual(2);
          rmdir(uploadDir);
          next();
        });
    });

    afterAll((next) => {
      const loopbackContext = LoopBackContext.getCurrentContext();
      // loopbackContext.set('currentUser', null);
      next();
    });

    it('Upload should return 200', (next) => {
      const uploadFile = path.join(__dirname, 'assets', 'WechatIMG398.jpeg');
      request(app)
        .post('/api/containers/product-images/upload')
        .query({
          'access_token': token,
        })
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .attach('file', uploadFile)
        .send({
          container: 'product-images',
        })
        .expect(200, (err, res) => {
          let fileObj = res.body.result.files.file[0];
          expect(fileObj.originalName, 'WechatIMG398.jpeg');
          let dynamicName = path.basename(fileObj.name, '.jpeg');
          fs.readdirSync(uploadDir, (err, files) => {
            expect(files.length, 3);
            next();
          });
        });
      next();
    });

    it('List files should return file names', (next) => {
      request(app)
        .get('/api/files')
        .set('Accept', 'application/json')
        .query({'access_token': token})
        .expect(200, (err, res) => {
          expect(err).toBe(null);
          expect(res.body).not.toBe(null);
          next();
        });
    });
  });
});
