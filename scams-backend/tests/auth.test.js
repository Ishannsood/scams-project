const request = require('supertest');
const app = require('../app');

describe('Auth Routes', () => {

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'testuser_unique@test.com', password: 'secret123', role: 'member' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('testuser_unique@test.com');
      expect(res.body.user.role).toBe('member');
    });

    it('should reject registration with a duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alice Again', email: 'member@test.com', password: 'password123', role: 'member' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email already registered');
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete@test.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject a password shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Short Pass', email: 'shortpass@test.com', password: '123', role: 'member' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/6 characters/i);
    });

    it('should reject an invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Bad Email', email: 'notanemail', password: 'password123', role: 'member' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/valid email/i);
    });

    it('should default role to member if invalid role provided', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Role Test', email: 'roletest_unique@test.com', password: 'pass123', role: 'superadmin' });

      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe('member');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'member@test.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('member');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'member@test.com', password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should reject login with unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' });

      expect(res.statusCode).toBe(401);
    });

    it('should reject login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info with a valid token', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'exec@test.com', password: 'password123' });

      const token = loginRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.role).toBe('executive');
      expect(res.body.user.email).toBe('exec@test.com');
    });

    it('should reject request with no token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('No token provided');
    });

    it('should reject request with an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer this.is.not.valid');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid or expired token');
    });
  });

});
