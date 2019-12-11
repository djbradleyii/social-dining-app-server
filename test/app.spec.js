const app = require('../src/app')

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
  })
})