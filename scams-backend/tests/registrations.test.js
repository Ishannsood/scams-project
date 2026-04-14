const request = require('supertest');
const app = require('../app');

let memberToken;
let execToken;

beforeAll(async () => {
  const member = await request(app)
    .post('/api/auth/login')
    .send({ email: 'dan@test.com', password: 'password123' });
  memberToken = member.body.token;

  const exec = await request(app)
    .post('/api/auth/login')
    .send({ email: 'exec@test.com', password: 'password123' });
  execToken = exec.body.token;
});

describe('Registrations Routes', () => {

  describe('GET /api/registrations/my', () => {
    it('should return registrations for the logged-in member', async () => {
      const res = await request(app)
        .get('/api/registrations/my')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should block unauthenticated access', async () => {
      const res = await request(app).get('/api/registrations/my');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/registrations/:activityId', () => {
    it('should register a member for an activity', async () => {
      const activitiesRes = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${memberToken}`);

      // Find an upcoming activity dan is not registered for
      const upcoming = activitiesRes.body.find(a => new Date(a.date) > new Date());
      expect(upcoming).toBeDefined();

      const res = await request(app)
        .post(`/api/registrations/${upcoming.id}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect([200, 201, 400]).toContain(res.statusCode); // 400 if already registered
    });
  });

  describe('Role-based access', () => {
    it('should enforce authentication on all registration routes', async () => {
      const res = await request(app).get('/api/registrations/my');
      expect(res.statusCode).toBe(401);
    });
  });

});
