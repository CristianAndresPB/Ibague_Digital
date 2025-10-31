const request = require('supertest');
const expect = require('chai').expect;

describe('Auth and Survey Endpoints (smoke tests)', function() {
  const server = 'http://localhost:3000'; // assumes server running for tests
  it('should login with default admin', async function() {
    const res = await request(server).post('/api/auth/login').send({ username: 'admin', password: 'ibague2025' });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
    this.token = res.body.token;
  });
  it('should create a survey', async function() {
    const payload = { name: 'Test User', age: 30, gender: 'Otro', q1:'a', q2:'b', q3:'c', q4:'d', q5:'e' };
    const res = await request(server).post('/api/survey').send(payload);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('entry');
  });
});
