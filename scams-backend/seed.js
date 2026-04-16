const { v4: uuidv4 } = require('uuid');
const User         = require('./models/User');
const Activity     = require('./models/Activity');
const Registration = require('./models/Registration');
const Attendance   = require('./models/Attendance');
const Announcement = require('./models/Announcement');

const PW = '$2b$10$mo7EzPazO4ygb.rQPEKuuu7K5pPw74PTiTp2fbfGsTrB3QX8GX1lm'; // password123

const USERS = [
  { _id:'u1',  name:'Alice Chen',       email:'member@test.com',   password:PW, role:'member'    },
  { _id:'u2',  name:'Ishan Sood',        email:'exec@test.com',     password:PW, role:'executive' },
  { _id:'u3',  name:'Carol Vasquez',    email:'advisor@test.com',  password:PW, role:'advisor'   },
  { _id:'u4',  name:'Dan Okafor',       email:'dan@test.com',      password:PW, role:'member'    },
  { _id:'u5',  name:'Emma Kowalski',    email:'emma@test.com',     password:PW, role:'member'    },
  { _id:'u6',  name:'James Park',       email:'james@test.com',    password:PW, role:'member'    },
  { _id:'u7',  name:'Fiona Tran',       email:'fiona@test.com',    password:PW, role:'member'    },
  { _id:'u8',  name:'George Malik',     email:'george@test.com',   password:PW, role:'member'    },
  { _id:'u9',  name:'Hana Osei',        email:'hana@test.com',     password:PW, role:'member'    },
  { _id:'u10', name:'Ivan Reyes',       email:'ivan@test.com',     password:PW, role:'member'    },
  { _id:'u11', name:'Jess Yamamoto',    email:'jess@test.com',     password:PW, role:'member'    },
  { _id:'u12', name:'Kyle Brennan',     email:'kyle@test.com',     password:PW, role:'member'    },
  { _id:'u13', name:'Lena Svensson',    email:'lena@test.com',     password:PW, role:'member'    },
  { _id:'u14', name:'Marco Diaz',       email:'marco@test.com',    password:PW, role:'member'    },
  { _id:'u15', name:'Nina Patel',       email:'nina@test.com',     password:PW, role:'member'    },
  { _id:'u16', name:'Omar Hassan',      email:'omar@test.com',     password:PW, role:'member'    },
  { _id:'u17', name:'Priya Singh',      email:'priya@test.com',    password:PW, role:'member'    },
  { _id:'u18', name:'Quinn Foster',     email:'quinn@test.com',    password:PW, role:'member'    },
  { _id:'u19', name:'Raj Kumar',        email:'raj@test.com',      password:PW, role:'member'    },
  { _id:'u20', name:'Sara Bloom',       email:'sara@test.com',     password:PW, role:'member'    },
];

const ACTIVITIES = [
  { _id:'act1', category:'Workshop', title:'React Workshop',                   description:'Hands-on introduction to React fundamentals including hooks, components, and state management. Bring your laptop!',           date:'2026-03-15', time:'14:00', location:'Room 101, Tech Building',      createdBy:'u2', maxCapacity:20, createdAt:'2026-03-01T10:00:00.000Z' },
  { _id:'act2', category:'Social',   title:'Annual Recruitment Drive',          description:'Open recruitment event for students interested in joining the CampusSync club. Meet the team and learn what we do.',            date:'2026-03-22', time:'10:00', location:'Main Atrium',                  createdBy:'u2', maxCapacity:25, createdAt:'2026-03-05T10:00:00.000Z' },
  { _id:'act3', category:'Workshop', title:'Python Bootcamp',                   description:'Beginner-friendly Python programming session covering fundamentals, data structures, and a hands-on mini-project.',              date:'2026-04-02', time:'13:00', location:'Lab 202, Science Wing',        createdBy:'u2', maxCapacity:15, createdAt:'2026-03-18T10:00:00.000Z' },
  { _id:'act4', category:'Career',   title:'Resume & LinkedIn Workshop',        description:'Improve your resume and LinkedIn profile with guidance from industry professionals. Limited seats — register early!',             date:'2026-04-08', time:'15:30', location:'Career Centre, Room 3',        createdBy:'u2', maxCapacity:25, createdAt:'2026-03-25T10:00:00.000Z' },
  { _id:'act5', category:'Academic', title:'Spring Hackathon Kickoff',          description:'24-hour hackathon kickoff session. Form your teams, receive the challenge brief, and start building. Prizes for top 3 teams.',   date:'2026-04-12', time:'09:00', location:'Innovation Hub, Floor 2',      createdBy:'u2', maxCapacity:20, createdAt:'2026-04-01T10:00:00.000Z' },
  { _id:'act6', category:'Social',   title:'Spring Social Mixer',               description:'End-of-semester social event with food, games, and networking. All club members welcome — bring a friend!',                      date:'2026-04-20', time:'17:00', location:'Student Lounge, Building C',   createdBy:'u2', maxCapacity:30, createdAt:'2026-04-05T10:00:00.000Z' },
  { _id:'act7', category:'Career',   title:'Industry Career Fair',              description:'Connect with over 20 local tech companies actively hiring students for internships and co-op positions. Dress professionally.',    date:'2026-04-28', time:'11:00', location:'Main Gymnasium',               createdBy:'u2', maxCapacity:30, createdAt:'2026-04-08T10:00:00.000Z' },
  { _id:'act8', category:'Workshop', title:'Web Dev Crash Course',              description:'Intensive one-day workshop covering HTML, CSS, and JavaScript fundamentals. Build a personal portfolio page by the end!',         date:'2026-05-05', time:'10:00', location:'Lab 101, Tech Building',       createdBy:'u2', maxCapacity:18, createdAt:'2026-04-10T10:00:00.000Z' },
  { _id:'act9', category:'Academic', title:'Leadership & Communication Summit', description:'Half-day summit featuring guest speakers on leadership, public speaking, and professional communication. Certificate provided.',   date:'2026-05-12', time:'13:00', location:'Lecture Hall A',               createdBy:'u3', maxCapacity:25, createdAt:'2026-04-10T10:00:00.000Z' },
];

// Seed registrations for past + upcoming activities
const REG_DATA = [
  // act1 — React Workshop (past)
  ...['u1','u4','u5','u6','u7','u8','u9'].map((u,i) => ({ userId:u, activityId:'act1', registeredAt:`2026-03-0${i+2}T10:00:00.000Z` })),
  // act2 — Recruitment Drive (past)
  ...['u1','u4','u5','u6','u7','u8','u9','u10','u11'].map((u,i) => ({ userId:u, activityId:'act2', registeredAt:`2026-03-1${i}T10:00:00.000Z` })),
  // act3 — Python Bootcamp (past)
  ...['u4','u5','u6','u7','u8','u9'].map((u,i) => ({ userId:u, activityId:'act3', registeredAt:`2026-03-2${i}T10:00:00.000Z` })),
  // act4 — Resume Workshop (past)
  ...['u1','u5','u6','u7','u8','u9','u10','u11','u12'].map((u,i) => ({ userId:u, activityId:'act4', registeredAt:`2026-03-2${i+5}T09:00:00.000Z` })),
  // act5 — Hackathon (past)
  ...['u4','u6','u7','u8','u9','u10','u11'].map((u,i) => ({ userId:u, activityId:'act5', registeredAt:`2026-04-0${i+3}T09:00:00.000Z` })),
  // act6 — Spring Social (upcoming)
  ...['u1','u4','u5','u6','u7'].map((u,i) => ({ userId:u, activityId:'act6', registeredAt:`2026-04-1${i}T10:00:00.000Z` })),
  // act7 — Career Fair (upcoming)
  ...['u1','u4','u5'].map((u,i) => ({ userId:u, activityId:'act7', registeredAt:`2026-04-1${i+2}T10:00:00.000Z` })),
  // act8 — Web Dev (upcoming)
  ...['u6','u7','u8'].map((u,i) => ({ userId:u, activityId:'act8', registeredAt:`2026-04-1${i+4}T10:00:00.000Z` })),
];

const REGISTRATIONS = REG_DATA.map(r => ({ _id: uuidv4(), ...r }));

// Seed attendance for past activities (act1-act5), ~80% attendance rate
const ATTENDED = [
  ...['u1','u4','u5','u6','u7','u8'].map(u => ({ userId:u, activityId:'act1' })),
  ...['u1','u4','u5','u6','u7','u8','u9','u10'].map(u => ({ userId:u, activityId:'act2' })),
  ...['u4','u5','u6','u7','u8'].map(u => ({ userId:u, activityId:'act3' })),
  ...['u1','u5','u6','u7','u8','u9','u10','u11'].map(u => ({ userId:u, activityId:'act4' })),
  ...['u4','u6','u7','u8','u9','u10'].map(u => ({ userId:u, activityId:'act5' })),
];

const ATTENDANCE_DOCS = ATTENDED.map(a => ({
  _id: uuidv4(), ...a,
  markedAt: new Date().toISOString(), markedBy: 'u2',
}));

const ANNOUNCEMENTS = [
  {
    _id: uuidv4(),
    title: 'Welcome to SCAMS!',
    content: 'Welcome to the Student Club Activity Management System. Check out our upcoming activities and register early — spots fill up fast!',
    pinned: true,
    createdBy: 'u2',
    createdAt: '2026-04-01T10:00:00.000Z',
  },
  {
    _id: uuidv4(),
    title: 'Spring Social Mixer — Apr 20',
    content: 'Join us for our end-of-semester social event on April 20th at 5pm in the Student Lounge. Food, games, and networking. Register on the Activities page!',
    pinned: false,
    createdBy: 'u2',
    createdAt: '2026-04-10T10:00:00.000Z',
  },
];

module.exports = async function seed() {
  const count = await User.countDocuments();
  if (count > 0) { console.log('⏭  Database already seeded'); return; }

  console.log('🌱 Seeding database...');
  await User.insertMany(USERS);
  await Activity.insertMany(ACTIVITIES);
  await Registration.insertMany(REGISTRATIONS);
  await Attendance.insertMany(ATTENDANCE_DOCS);
  await Announcement.insertMany(ANNOUNCEMENTS);
  console.log('✅ Database seeded with users, activities, registrations, attendance & announcements');
};
