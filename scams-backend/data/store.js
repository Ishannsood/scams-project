const { v4: uuidv4 } = require('uuid');

const users = [
  { id: 'u1', name: 'Alice Member',   email: 'member@test.com',  password: 'password123', role: 'member'    },
  { id: 'u2', name: 'Bob Executive',  email: 'exec@test.com',    password: 'password123', role: 'executive' },
  { id: 'u3', name: 'Carol Advisor',  email: 'advisor@test.com', password: 'password123', role: 'advisor'   },
  { id: 'u4', name: 'Dan Member',     email: 'dan@test.com',     password: 'password123', role: 'member'    },
];

const activities = [
  {
    id: 'act1',
    title: 'React Workshop',
    description: 'Hands-on introduction to React fundamentals including hooks, components, and state management.',
    date: '2026-04-01',
    time: '14:00',
    location: 'Room 101',
    createdBy: 'u2',
    maxCapacity: 20,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'act2',
    title: 'Annual Recruitment Drive',
    description: 'Open recruitment event for students interested in joining the club.',
    date: '2026-04-05',
    time: '10:00',
    location: 'Main Hall',
    createdBy: 'u2',
    maxCapacity: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'act3',
    title: 'Python Bootcamp',
    description: 'Beginner-friendly Python programming session covering basics to data structures.',
    date: '2026-04-10',
    time: '13:00',
    location: 'Lab 202',
    createdBy: 'u2',
    maxCapacity: 15,
    createdAt: new Date().toISOString(),
  },
];

// { id, userId, activityId, registeredAt }
const registrations = [
  { id: 'reg1', userId: 'u1', activityId: 'act1', registeredAt: new Date().toISOString() },
  { id: 'reg2', userId: 'u4', activityId: 'act1', registeredAt: new Date().toISOString() },
  { id: 'reg3', userId: 'u1', activityId: 'act2', registeredAt: new Date().toISOString() },
];

// { id, userId, activityId, markedAt, markedBy }
const attendance = [
  { id: 'att1', userId: 'u1', activityId: 'act1', markedAt: new Date().toISOString(), markedBy: 'u2' },
];

// { id, title, content, pinned, createdBy, createdAt }
const announcements = [
  {
    id: 'ann1',
    title: 'Welcome to SCAMS!',
    content: 'This is the official platform for CampusSync club activities. Register for upcoming events and stay tuned for announcements.',
    pinned: true,
    createdBy: 'u2',
    createdAt: new Date().toISOString(),
  },
];

module.exports = { users, activities, registrations, attendance, announcements, uuidv4 };
