const app = require('../src/app')
const users = require('../src/users.js');

describe.skip('App', () => {
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello, world!')
  })
})

describe('App', () => {
  it('GET /api/users responds with 200', () => {
    return supertest(app)
      .get('/api/users')
      .expect(200)
  });
  
  it('GET /api/users responds with 200 and array of all users', () => {
    return supertest(app)
      .get('/api/users')
      .expect(200)
      .then(res =>{
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(6);
      })
  })
})