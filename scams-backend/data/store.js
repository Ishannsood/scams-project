const { v4: uuidv4 } = require('uuid');

const users = [
  { id: 'u1', name: 'Alice Chen',      email: 'member@test.com',   password: 'password123', role: 'member'    },
  { id: 'u2', name: 'Bob Nakamura',    email: 'exec@test.com',     password: 'password123', role: 'executive' },
  { id: 'u3', name: 'Carol Vasquez',   email: 'advisor@test.com',  password: 'password123', role: 'advisor'   },
  { id: 'u4', name: 'Dan Okafor',      email: 'dan@test.com',      password: 'password123', role: 'member'    },
  { id: 'u5', name: 'Emma Kowalski',   email: 'emma@test.com',     password: 'password123', role: 'member'    },
  { id: 'u6', name: 'James Park',      email: 'james@test.com',    password: 'password123', role: 'member'    },
];

const activities = [
  // ── Past events ──────────────────────────────────────────────────────────
  {
    id: 'act1',
    title: 'React Workshop',
    description: 'Hands-on introduction to React fundamentals including hooks, components, and state management. Bring your laptop!',
    date: '2026-03-15',
    time: '14:00',
    location: 'Room 101, Tech Building',
    createdBy: 'u2',
    maxCapacity: 20,
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'act2',
    title: 'Annual Recruitment Drive',
    description: 'Open recruitment event for students interested in joining the CampusSync club. Meet the team and learn what we do.',
    date: '2026-03-22',
    time: '10:00',
    location: 'Main Atrium',
    createdBy: 'u2',
    maxCapacity: 50,
    createdAt: '2026-03-05T10:00:00.000Z',
  },
  {
    id: 'act3',
    title: 'Python Bootcamp',
    description: 'Beginner-friendly Python programming session covering fundamentals, data structures, and a hands-on mini-project.',
    date: '2026-04-02',
    time: '13:00',
    location: 'Lab 202, Science Wing',
    createdBy: 'u2',
    maxCapacity: 15,
    createdAt: '2026-03-18T10:00:00.000Z',
  },
  {
    id: 'act4',
    title: 'Resume & LinkedIn Workshop',
    description: 'Improve your resume and LinkedIn profile with guidance from industry professionals. Limited seats — register early!',
    date: '2026-04-08',
    time: '15:30',
    location: 'Career Centre, Room 3',
    createdBy: 'u2',
    maxCapacity: 25,
    createdAt: '2026-03-25T10:00:00.000Z',
  },
  {
    id: 'act5',
    title: 'Spring Hackathon Kickoff',
    description: '24-hour hackathon kickoff session. Form your teams, receive the challenge brief, and start building. Prizes for top 3 teams.',
    date: '2026-04-12',
    time: '09:00',
    location: 'Innovation Hub, Floor 2',
    createdBy: 'u2',
    maxCapacity: 30,
    createdAt: '2026-04-01T10:00:00.000Z',
  },

  // ── Upcoming events ───────────────────────────────────────────────────────
  {
    id: 'act6',
    title: 'Spring Social Mixer',
    description: 'End-of-semester social event with food, games, and networking. All club members welcome — bring a friend!',
    date: '2026-04-20',
    time: '17:00',
    location: 'Student Lounge, Building C',
    createdBy: 'u2',
    maxCapacity: 40,
    createdAt: '2026-04-05T10:00:00.000Z',
  },
  {
    id: 'act7',
    title: 'Industry Career Fair',
    description: 'Connect with over 20 local tech companies actively hiring students for internships and co-op positions. Dress professionally.',
    date: '2026-04-28',
    time: '11:00',
    location: 'Main Gymnasium',
    createdBy: 'u2',
    maxCapacity: 60,
    createdAt: '2026-04-08T10:00:00.000Z',
  },
  {
    id: 'act8',
    title: 'Web Dev Crash Course',
    description: 'Intensive one-day workshop covering HTML, CSS, and JavaScript fundamentals. Build a personal portfolio page by the end!',
    date: '2026-05-05',
    time: '10:00',
    location: 'Lab 101, Tech Building',
    createdBy: 'u2',
    maxCapacity: 18,
    createdAt: '2026-04-10T10:00:00.000Z',
  },
  {
    id: 'act9',
    title: 'Leadership & Communication Summit',
    description: 'Half-day summit featuring guest speakers on leadership, public speaking, and professional communication. Certificate provided.',
    date: '2026-05-12',
    time: '13:00',
    location: 'Lecture Hall A',
    createdBy: 'u3',
    maxCapacity: 35,
    createdAt: '2026-04-10T10:00:00.000Z',
  },
];

// { id, userId, activityId, registeredAt }
const registrations = [
  // act1 – React Workshop (past, 4/20 spots)
  { id: 'reg1',  userId: 'u1', activityId: 'act1', registeredAt: '2026-03-10T08:00:00.000Z' },
  { id: 'reg2',  userId: 'u4', activityId: 'act1', registeredAt: '2026-03-10T09:00:00.000Z' },
  { id: 'reg3',  userId: 'u5', activityId: 'act1', registeredAt: '2026-03-11T10:00:00.000Z' },
  { id: 'reg4',  userId: 'u6', activityId: 'act1', registeredAt: '2026-03-12T11:00:00.000Z' },

  // act2 – Recruitment Drive (past, 4/50 spots)
  { id: 'reg5',  userId: 'u1', activityId: 'act2', registeredAt: '2026-03-10T08:00:00.000Z' },
  { id: 'reg6',  userId: 'u4', activityId: 'act2', registeredAt: '2026-03-11T09:00:00.000Z' },
  { id: 'reg7',  userId: 'u5', activityId: 'act2', registeredAt: '2026-03-12T10:00:00.000Z' },
  { id: 'reg8',  userId: 'u6', activityId: 'act2', registeredAt: '2026-03-13T11:00:00.000Z' },

  // act3 – Python Bootcamp (past, 3/15 spots)
  { id: 'reg9',  userId: 'u1', activityId: 'act3', registeredAt: '2026-03-20T08:00:00.000Z' },
  { id: 'reg10', userId: 'u4', activityId: 'act3', registeredAt: '2026-03-21T09:00:00.000Z' },
  { id: 'reg11', userId: 'u5', activityId: 'act3', registeredAt: '2026-03-22T10:00:00.000Z' },

  // act4 – Resume Workshop (past, 3/25 spots)
  { id: 'reg12', userId: 'u1', activityId: 'act4', registeredAt: '2026-03-28T08:00:00.000Z' },
  { id: 'reg13', userId: 'u5', activityId: 'act4', registeredAt: '2026-03-29T09:00:00.000Z' },
  { id: 'reg14', userId: 'u6', activityId: 'act4', registeredAt: '2026-03-30T10:00:00.000Z' },

  // act5 – Hackathon Kickoff (past, 3/30 spots)
  { id: 'reg15', userId: 'u1', activityId: 'act5', registeredAt: '2026-04-05T08:00:00.000Z' },
  { id: 'reg16', userId: 'u4', activityId: 'act5', registeredAt: '2026-04-06T09:00:00.000Z' },
  { id: 'reg17', userId: 'u6', activityId: 'act5', registeredAt: '2026-04-07T10:00:00.000Z' },

  // act6 – Spring Social Mixer (upcoming, 4/40 spots)
  { id: 'reg18', userId: 'u1', activityId: 'act6', registeredAt: '2026-04-13T08:00:00.000Z' },
  { id: 'reg19', userId: 'u4', activityId: 'act6', registeredAt: '2026-04-13T09:00:00.000Z' },
  { id: 'reg20', userId: 'u5', activityId: 'act6', registeredAt: '2026-04-13T10:00:00.000Z' },
  { id: 'reg21', userId: 'u6', activityId: 'act6', registeredAt: '2026-04-13T11:00:00.000Z' },

  // act7 – Career Fair (upcoming, 2/60 spots)
  { id: 'reg22', userId: 'u1', activityId: 'act7', registeredAt: '2026-04-13T08:00:00.000Z' },
  { id: 'reg23', userId: 'u5', activityId: 'act7', registeredAt: '2026-04-13T10:00:00.000Z' },

  // act8 – Web Dev Crash Course (upcoming, 4/18 spots — nearly full)
  { id: 'reg24', userId: 'u1', activityId: 'act8', registeredAt: '2026-04-13T08:00:00.000Z' },
  { id: 'reg25', userId: 'u4', activityId: 'act8', registeredAt: '2026-04-13T09:00:00.000Z' },
  { id: 'reg26', userId: 'u5', activityId: 'act8', registeredAt: '2026-04-13T10:00:00.000Z' },
  { id: 'reg27', userId: 'u6', activityId: 'act8', registeredAt: '2026-04-13T11:00:00.000Z' },

  // act9 – Leadership Summit (upcoming, 2/35 spots)
  { id: 'reg28', userId: 'u1', activityId: 'act9', registeredAt: '2026-04-13T08:00:00.000Z' },
  { id: 'reg29', userId: 'u4', activityId: 'act9', registeredAt: '2026-04-13T09:00:00.000Z' },
];

// { id, userId, activityId, markedAt, markedBy }
const attendance = [
  // act1 – React Workshop: 3/4 attended
  { id: 'att1', userId: 'u1', activityId: 'act1', markedAt: '2026-03-15T16:00:00.000Z', markedBy: 'u2' },
  { id: 'att2', userId: 'u4', activityId: 'act1', markedAt: '2026-03-15T16:05:00.000Z', markedBy: 'u2' },
  { id: 'att3', userId: 'u5', activityId: 'act1', markedAt: '2026-03-15T16:10:00.000Z', markedBy: 'u2' },
  // u6 did not attend

  // act2 – Recruitment Drive: 4/4 attended
  { id: 'att4', userId: 'u1', activityId: 'act2', markedAt: '2026-03-22T12:00:00.000Z', markedBy: 'u2' },
  { id: 'att5', userId: 'u4', activityId: 'act2', markedAt: '2026-03-22T12:05:00.000Z', markedBy: 'u2' },
  { id: 'att6', userId: 'u5', activityId: 'act2', markedAt: '2026-03-22T12:10:00.000Z', markedBy: 'u2' },
  { id: 'att7', userId: 'u6', activityId: 'act2', markedAt: '2026-03-22T12:15:00.000Z', markedBy: 'u2' },

  // act3 – Python Bootcamp: 2/3 attended
  { id: 'att8', userId: 'u1', activityId: 'act3', markedAt: '2026-04-02T15:00:00.000Z', markedBy: 'u2' },
  { id: 'att9', userId: 'u4', activityId: 'act3', markedAt: '2026-04-02T15:05:00.000Z', markedBy: 'u2' },
  // u5 did not attend

  // act4 – Resume Workshop: 2/3 attended
  { id: 'att10', userId: 'u1', activityId: 'act4', markedAt: '2026-04-08T17:00:00.000Z', markedBy: 'u2' },
  { id: 'att11', userId: 'u6', activityId: 'act4', markedAt: '2026-04-08T17:05:00.000Z', markedBy: 'u2' },
  // u5 did not attend

  // act5 – Hackathon Kickoff: 2/3 attended
  { id: 'att12', userId: 'u4', activityId: 'act5', markedAt: '2026-04-12T10:00:00.000Z', markedBy: 'u2' },
  { id: 'att13', userId: 'u6', activityId: 'act5', markedAt: '2026-04-12T10:05:00.000Z', markedBy: 'u2' },
  // u1 did not attend
];

// { id, title, content, pinned, createdBy, createdAt }
const announcements = [
  {
    id: 'ann1',
    title: 'Welcome to SCAMS!',
    content: 'Welcome to the CampusSync club management portal! Here you can register for activities, check your attendance history, and stay up to date with club news. Reach out to an executive if you have any questions.',
    pinned: true,
    createdBy: 'u2',
    createdAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'ann2',
    title: 'Spring Social Mixer — Registration Open',
    content: 'Registration is now open for the Spring Social Mixer on April 20th! This is a great chance to meet fellow members and celebrate a fantastic semester. Spots are limited so sign up early.',
    pinned: false,
    createdBy: 'u2',
    createdAt: '2026-04-06T10:00:00.000Z',
  },
  {
    id: 'ann3',
    title: 'Spring Hackathon — Results Announced',
    content: 'Congratulations to Team ByteForce for winning first place at the Spring Hackathon! Thank you to everyone who participated — the talent and creativity on display was incredible. Full results are posted on the club board.',
    pinned: false,
    createdBy: 'u2',
    createdAt: '2026-04-13T09:00:00.000Z',
  },
  {
    id: 'ann4',
    title: 'Reminder: Industry Career Fair — April 28',
    content: 'Don\'t forget to register for the Industry Career Fair on April 28th. Over 20 companies will be in attendance, including several offering summer internships. Dress professionally and bring printed copies of your resume.',
    pinned: true,
    createdBy: 'u3',
    createdAt: '2026-04-14T08:00:00.000Z',
  },
];

module.exports = { users, activities, registrations, attendance, announcements, uuidv4 };