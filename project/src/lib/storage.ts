import type {
  AppData,
  User,
  LeaveRequest,
  GreenCardSlot,
  Booking,
  Classroom,
  ClassroomSchedule,
  Notification,
} from '@/types';

const STORAGE_KEY = 'leaveease_data_v1';

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function isoHoursFromNow(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

export function seedData(): AppData {
  const users: User[] = [
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
      createdAt: isoHoursFromNow(-200),
      isDemo: true,
    },
    {
      id: 'u_student2',
      name: 'Priya Patel',
      email: 'priya@college.edu',
      role: 'student',
      department: 'Electronics',
      course: 'B.Tech Electronics & Communication',
      year: 2,
      semester: 3,
      rollNo: 'EC22B015',
      phone: '+91 98765 43211',
      accountStatus: 'active',
      createdAt: isoHoursFromNow(-180),
      isDemo: true,
    },
    {
      id: 'u_student3',
      name: 'Rohan Verma',
      email: 'rohan@college.edu',
      role: 'student',
      department: 'Mechanical',
      course: 'B.Tech Mechanical Engineering',
      year: 4,
      semester: 7,
      rollNo: 'ME20B042',
      phone: '+91 98765 43212',
      accountStatus: 'active',
      createdAt: isoHoursFromNow(-150),
      isDemo: true,
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
      createdAt: isoHoursFromNow(-300),
      isDemo: true,
    },
    {
      id: 'u_teacher2',
      name: 'Prof. Suresh Kumar',
      email: 'suresh@college.edu',
      role: 'teacher',
      department: 'Electronics',
      rollNo: 'TCH-EC-02',
      phone: '+91 98765 43214',
      accountStatus: 'active',
      createdAt: isoHoursFromNow(-280),
      isDemo: true,
    },
    {
      id: 'u_hod1',
      name: 'Dr. Rajesh Nair',
      email: 'rajesh@college.edu',
      role: 'hod',
      department: 'Computer Science',
      rollNo: 'HOD-CS-01',
      phone: '+91 98765 43215',
      accountStatus: 'active',
      createdAt: isoHoursFromNow(-400),
      isDemo: true,
    },
    {
      id: 'u_hod2',
      name: 'Dr. Lakshmi Iyer',
      email: 'lakshmi@college.edu',
      role: 'hod',
      department: 'Mechanical',
      rollNo: 'HOD-ME-02',
      phone: '+91 98765 43216',
      accountStatus: 'active',
      createdAt: isoHoursFromNow(-380),
      isDemo: true,
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
      createdAt: isoHoursFromNow(-500),
      isDemo: true,
    },
  ];


  const leaveRequests: LeaveRequest[] = [
    {
      id: uid('lv'), studentId: 'u_student1', studentName: 'Arjun Sharma', rollNo: 'CS21B001',
      department: 'Computer Science', leaveType: 'Sick Leave', startDate: isoDaysFromNow(-2), endDate: isoDaysFromNow(-1),
      reason: 'Fever and cold, unable to attend classes', status: 'approved',
      teacherApproved: true, hodApproved: true, createdAt: isoHoursFromNow(-72),
      decidedBy: 'Dr. Rajesh Nair', decidedAt: isoHoursFromNow(-48), decisionNote: 'Approved. Get well soon.',
    },
    {
      id: uid('lv'), studentId: 'u_student1', studentName: 'Arjun Sharma', rollNo: 'CS21B001',
      department: 'Computer Science', leaveType: 'Personal Leave', startDate: isoDaysFromNow(5), endDate: isoDaysFromNow(6),
      reason: 'Family function out of town', status: 'pending',
      teacherApproved: false, hodApproved: false, createdAt: isoHoursFromNow(-5),
    },
    {
      id: uid('lv'), studentId: 'u_student2', studentName: 'Priya Patel', rollNo: 'EC22B015',
      department: 'Electronics', leaveType: 'Sick Leave', startDate: isoDaysFromNow(1), endDate: isoDaysFromNow(2),
      reason: 'Medical appointment', status: 'pending',
      teacherApproved: false, hodApproved: false, createdAt: isoHoursFromNow(-12),
    },
    {
      id: uid('lv'), studentId: 'u_student3', studentName: 'Rohan Verma', rollNo: 'ME20B042',
      department: 'Mechanical', leaveType: 'Conference Leave', startDate: isoDaysFromNow(10), endDate: isoDaysFromNow(12),
      reason: 'Attending national tech conference', status: 'rejected',
      teacherApproved: true, hodApproved: false, createdAt: isoHoursFromNow(-30),
      decidedBy: 'Dr. Lakshmi Iyer', decidedAt: isoHoursFromNow(-20), decisionNote: 'Conference not on approved list.',
    },
  ];

  const greenCardSlots: GreenCardSlot[] = [
    { id: uid('gc'), title: 'Library Study Session', date: isoDaysFromNow(1), startTime: '09:00', endTime: '11:00', capacity: 30, bookedIds: ['u_student1', 'u_student2'] },
    { id: uid('gc'), title: 'Lab Practice - Electronics', date: isoDaysFromNow(2), startTime: '14:00', endTime: '16:00', capacity: 20, bookedIds: ['u_student2'] },
    { id: uid('gc'), title: 'Group Discussion Room', date: isoDaysFromNow(3), startTime: '10:00', endTime: '12:00', capacity: 15, bookedIds: [] },
    { id: uid('gc'), title: 'Seminar Hall - Workshop', date: isoDaysFromNow(5), startTime: '13:00', endTime: '15:00', capacity: 50, bookedIds: ['u_student1', 'u_student3'] },
  ];

  const bookings: Booking[] = [
    { id: uid('bk'), slotId: greenCardSlots[0].id, studentId: 'u_student1', studentName: 'Arjun Sharma', bookedAt: isoHoursFromNow(-24) },
    { id: uid('bk'), slotId: greenCardSlots[0].id, studentId: 'u_student2', studentName: 'Priya Patel', bookedAt: isoHoursFromNow(-23) },
    { id: uid('bk'), slotId: greenCardSlots[1].id, studentId: 'u_student2', studentName: 'Priya Patel', bookedAt: isoHoursFromNow(-20) },
    { id: uid('bk'), slotId: greenCardSlots[3].id, studentId: 'u_student1', studentName: 'Arjun Sharma', bookedAt: isoHoursFromNow(-18) },
    { id: uid('bk'), slotId: greenCardSlots[3].id, studentId: 'u_student3', studentName: 'Rohan Verma', bookedAt: isoHoursFromNow(-17) },
  ];

  const classrooms: Classroom[] = [
    { id: uid('rm'), roomNumber: 'A-101', building: 'Block A', capacity: 60, floor: 1 },
    { id: uid('rm'), roomNumber: 'A-102', building: 'Block A', capacity: 40, floor: 1 },
    { id: uid('rm'), roomNumber: 'A-201', building: 'Block A', capacity: 80, floor: 2 },
    { id: uid('rm'), roomNumber: 'B-301', building: 'Block B', capacity: 120, floor: 3 },
    { id: uid('rm'), roomNumber: 'B-302', building: 'Block B', capacity: 45, floor: 3 },
    { id: uid('rm'), roomNumber: 'C-105', building: 'Block C', capacity: 35, floor: 1 },
  ];

  const classroomSchedules: ClassroomSchedule[] = [
    { id: uid('sc'), classroomId: classrooms[0].id, date: isoDaysFromNow(0), startTime: '09:00', endTime: '10:00', purpose: 'Data Structures Lecture', bookedBy: 'Dr. Anitha Rao' },
    { id: uid('sc'), classroomId: classrooms[0].id, date: isoDaysFromNow(0), startTime: '11:00', endTime: '12:00', purpose: 'Algorithms Tutorial', bookedBy: 'Dr. Anitha Rao' },
    { id: uid('sc'), classroomId: classrooms[2].id, date: isoDaysFromNow(0), startTime: '14:00', endTime: '16:00', purpose: 'Project Demo', bookedBy: 'Prof. Suresh Kumar' },
    { id: uid('sc'), classroomId: classrooms[3].id, date: isoDaysFromNow(1), startTime: '09:00', endTime: '11:00', purpose: 'Guest Lecture', bookedBy: 'Dr. Rajesh Nair' },
    { id: uid('sc'), classroomId: classrooms[1].id, date: isoDaysFromNow(0), startTime: '15:00', endTime: '16:00', purpose: 'Seminar', bookedBy: 'Dr. Lakshmi Iyer' },
  ];

  const notifications: Notification[] = [
    { id: uid('nt'), userId: 'u_student1', title: 'Leave Approved', message: 'Your Sick Leave request has been approved by HOD.', type: 'success', read: false, createdAt: isoHoursFromNow(-48) },
    { id: uid('nt'), userId: 'u_student1', title: 'Leave Submitted', message: 'Your Personal Leave request is pending review.', type: 'info', read: true, createdAt: isoHoursFromNow(-5) },
    { id: uid('nt'), userId: 'u_student3', title: 'Leave Rejected', message: 'Your Conference Leave was rejected by HOD.', type: 'error', read: false, createdAt: isoHoursFromNow(-20) },
    { id: uid('nt'), userId: 'u_teacher1', title: 'New Leave Request', message: 'A new leave request from Priya Patel needs your review.', type: 'info', read: false, createdAt: isoHoursFromNow(-12) },
    { id: uid('nt'), userId: 'u_hod1', title: 'Pending HOD Approval', message: 'Arjun Sharma\'s Personal Leave is awaiting HOD review.', type: 'warning', read: false, createdAt: isoHoursFromNow(-5) },
  ];

  return { users, leaveRequests, greenCardSlots, bookings, classrooms, classroomSchedules, notifications };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      if (parsed.users && parsed.users.length > 0) {
        parsed.users = parsed.users.map((u) => ({
          ...u,
          accountStatus: u.accountStatus || 'active',
          createdAt: u.createdAt || isoHoursFromNow(-100),
          isDemo: u.isDemo !== undefined ? u.isDemo : true,
          rollNo:
            u.rollNo ||
            (u.role === 'teacher'
              ? `TCH-${u.id}`
              : u.role === 'hod'
              ? `HOD-${u.id}`
              : u.role === 'admin'
              ? 'ADM-001'
              : 'STU-001'),
        }));
      }
      
      return parsed;
    }
  } catch {
    // fall through to seed
  }
  const data = seedData();
  saveData(data);
  return data;
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('localStorage quota reached, saving with slim leave cache:', err);
    try {
      const slim = {
        ...data,
        leaveRequests: data.leaveRequests.map((r, idx) =>
          idx > 2 ? { ...r, documentUrl: undefined } : r
        ),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {
      // Ignore fallback
    }
  }
}

export function resetData(): AppData {
  const data = seedData();
  saveData(data);
  return data;
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
}


export { uid, isoDaysFromNow, isoHoursFromNow };
