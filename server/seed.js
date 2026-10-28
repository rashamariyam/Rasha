const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const User = require('./models/User');
const LeaveRequest = require('./models/LeaveRequest');
const { GreenCardSlot, Booking } = require('./models/GreenCard');
const { Classroom, ClassroomSchedule } = require('./models/Classroom');
const Notification = require('./models/Notification');

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      LeaveRequest.deleteMany({}),
      GreenCardSlot.deleteMany({}),
      Booking.deleteMany({}),
      Classroom.deleteMany({}),
      ClassroomSchedule.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const defaultPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    console.log('Seeding demo users...');
    const users = [
      {
        id: 'u_student1',
        name: 'Arjun Sharma',
        email: 'arjun@college.edu',
        role: 'student',
        department: 'Computer Science',
        course: 'B.Tech Computer Science',
        year: 3,
        semester: 5,
        rollNo: 'CS21B001',
        phone: '+91 98765 43210',
        accountStatus: 'active',
        isDemo: true,
        credential: {
          userId: 'u_student1',
          email: 'arjun@college.edu',
          collegeId: 'CS21B001',
          passwordHash,
          salt,
        }
      },
      {
        id: 'u_teacher1',
        name: 'Dr. Anitha Rao',
        email: 'anitha@college.edu',
        role: 'teacher',
        department: 'Computer Science',
        rollNo: 'TCH-CS-01',
        phone: '+91 98765 43213',
        accountStatus: 'active',
        isDemo: true,
        credential: {
          userId: 'u_teacher1',
          email: 'anitha@college.edu',
          collegeId: 'TCH-CS-01',
          passwordHash,
          salt,
        }
      },
      {
        id: 'u_hod1',
        name: 'Dr. R. K. Narayanan',
        email: 'hod.cs@college.edu',
        role: 'hod',
        department: 'Computer Science',
        rollNo: 'HOD-CS-01',
        phone: '+91 98765 43215',
        accountStatus: 'active',
        isDemo: true,
        credential: {
          userId: 'u_hod1',
          email: 'hod.cs@college.edu',
          collegeId: 'HOD-CS-01',
          passwordHash,
          salt,
        }
      },
      {
        id: 'u_admin1',
        name: 'Admin Office',
        email: 'admin@college.edu',
        role: 'admin',
        department: 'Administration',
        rollNo: 'ADM-001',
        phone: '+91 98765 43217',
        accountStatus: 'active',
        isDemo: true,
        credential: {
          userId: 'u_admin1',
          email: 'admin@college.edu',
          collegeId: 'ADM-001',
          passwordHash,
          salt,
        }
      }
    ];

    await User.insertMany(users);

    console.log('Seeding classrooms...');
    await Classroom.insertMany([
      { id: 'cr_1', roomNumber: 'CS-101', building: 'Tech Block A', capacity: 60, floor: 1 },
      { id: 'cr_2', roomNumber: 'CS-202', building: 'Tech Block A', capacity: 45, floor: 2 },
      { id: 'cr_3', roomNumber: 'LH-01', building: 'Main Block', capacity: 120, floor: 1 }
    ]);

    console.log('✅ Seeding completed! Default password for demo accounts is: password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedDatabase();
