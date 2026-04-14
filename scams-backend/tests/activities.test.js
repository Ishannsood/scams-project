const request = require('supertest');
const app = require('../app');

let memberToken;
let execToken;

beforeAll(async () => {
  const member = await request(app)
    .post('/api/auth/login')
    .send({ email: 'member@test.com', password: 'password123' });
  memberToken = member.body.token;

  const exec = await request(app)
    .post('/api/auth/login')
    .send({ email: 'exec@test.com', password: 'password123' });
  execToken = exec.body.token;
});

describe('Activities Routes', () => {

  describe('GET /api/activities', () => {
    it('should return all activities for an authenticated user', async () => {
      const res = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should block unauthenticated requests', async () => {
      const res = await request(app).get('/api/activities');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/activities', () => {
    it('should allow an executive to create an activity', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${execToken}`)
        .send({
          title: 'Test Activity',
          description: 'A test activity created by automated test',
          date: '2026-06-01',
          time: '10:00',
          location: 'Test Room',
          maxCapacity: 20,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Test Activity');
      expect(res.body).toHaveProperty('id');
    });

    it('should block a member from creating an activity', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Unauthorized Activity',
          date: '2026-06-01',
          location: 'Room',
          maxCapacity: 10,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/forbidden/i);
    });

    it('should reject activity creation with missing required fields', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${execToken}`)
        .send({ description: 'No title provided' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/activities/:id', () => {
    it('should return a single activity by ID', async () => {
      const all = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${memberToken}`);

      const firstId = all.body[0].id;

      const res = await request(app)
        .get(`/api/activities/${firstId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(firstId);
    });

    it('should return 404 for a non-existent activity', async () => {
      const res = await request(app)
        .get('/api/activities/nonexistent-id-999')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

});
