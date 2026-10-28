import { useApp } from '@/store/AppContext';
import { StatCard, Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Form';
import { formatDate, formatTime, toCSV, downloadCSV } from '@/lib/utils';
import {
  FileText, Clock, CheckCircle2, CalendarCheck, Users, DoorOpen,
  ClipboardList, TrendingUp, Download, ArrowRight, XCircle,
} from 'lucide-react';
import type { Page } from '@/types';

export function DashboardPage() {
  const { currentUser, data, setPage } = useApp();
  if (!currentUser) return null;

  const role = currentUser.role;

  // Student dashboard
  if (role === 'student') {
    const myLeaves = data.leaveRequests.filter((r) => r.studentId === currentUser.id);
    const pending = myLeaves.filter((r) => r.status === 'pending').length;
    const approved = myLeaves.filter((r) => r.status === 'approved').length;
    const myBookings = data.bookings.filter((b) => b.studentId === currentUser.id).length;

    const quickActions = [
      { label: 'Apply for Leave', icon: <FileText size={20} />, page: 'apply-leave' as Page, desc: 'Submit a new leave request' },
      { label: 'View My Applications', icon: <ClipboardList size={20} />, page: 'leave-history' as Page, desc: 'Track your leave status' },
      { label: 'Book Green Card Slot', icon: <CalendarCheck size={20} />, page: 'green-card' as Page, desc: 'Reserve a study slot' },
      { label: 'Check Classroom Availability', icon: <DoorOpen size={20} />, page: 'classroom' as Page, desc: 'Find free rooms' },
    ];

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-xl bg-gradient-to-r from-navy-800 to-navy-700 p-6 text-white">
          <h3 className="text-xl font-semibold">Welcome back, {currentUser.name.split(' ')[0]}!</h3>
          <p className="mt-1 text-navy-200 text-sm">{currentUser.department} · Year {currentUser.year} · Roll No: {currentUser.rollNo}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Leave Requests" value={myLeaves.length} icon={<FileText size={24} />} accent="navy" />
          <StatCard label="Pending Requests" value={pending} icon={<Clock size={24} />} accent="amber" />
          <StatCard label="Approved Requests" value={approved} icon={<CheckCircle2 size={24} />} accent="emerald" />
          <StatCard label="Green Card Bookings" value={myBookings} icon={<CalendarCheck size={24} />} accent="blue" />
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-navy-900">Quick Actions</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setPage(action.page)}
                className="group flex flex-col items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-navy-300 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-700 transition group-hover:bg-navy-100">
                  {action.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-navy-900">{action.label}</h4>
                  <p className="text-sm text-gray-500">{action.desc}</p>
                </div>
                <ArrowRight size={18} className="mt-auto text-navy-400 transition group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader title="Recent Leave Applications" subtitle="Your latest requests" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">Leave Type</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.slice(0, 5).map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{r.leaveType}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(r.startDate)} → {formatDate(r.endDate)}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
                {myLeaves.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">No leave applications yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // Teacher / HOD dashboard
  if (role === 'teacher' || role === 'hod') {
    const dept = currentUser.department;
    const deptLeaves = data.leaveRequests.filter((r) => r.department === dept);
    const pending = role === 'teacher'
      ? deptLeaves.filter((r) => !r.teacherApproved && r.status === 'pending').length
      : deptLeaves.filter((r) => r.teacherApproved && !r.hodApproved && r.status === 'pending').length;
    const approved = deptLeaves.filter((r) => r.status === 'approved').length;
    const rejected = deptLeaves.filter((r) => r.status === 'rejected').length;
    const deptStudents = data.users.filter((u) => u.role === 'student' && u.department === dept).length;

    const exportCSV = () => {
      const rows = deptLeaves.map((r) => ({
        Student: r.studentName, RollNo: r.rollNo, Department: r.department,
        LeaveType: r.leaveType, StartDate: r.startDate, EndDate: r.endDate,
        Reason: r.reason, Status: r.status, TeacherApproved: r.teacherApproved,
        HODApproved: r.hodApproved, DecidedBy: r.decidedBy || '',
      }));
      downloadCSV(`leave_requests_${dept}.csv`, toCSV(rows));
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-xl bg-gradient-to-r from-navy-800 to-navy-700 p-6 text-white">
          <h3 className="text-xl font-semibold">{role === 'hod' ? 'HOD Dashboard' : 'Teacher Dashboard'}</h3>
          <p className="mt-1 text-navy-200 text-sm">{currentUser.name} · Department of {dept}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Dept. Students" value={deptStudents} icon={<Users size={24} />} accent="navy" />
          <StatCard label={role === 'teacher' ? 'Awaiting Your Review' : 'Awaiting HOD Review'} value={pending} icon={<Clock size={24} />} accent="amber" />
          <StatCard label="Approved" value={approved} icon={<CheckCircle2 size={24} />} accent="emerald" />
          <StatCard label="Rejected" value={rejected} icon={<XCircle size={24} />} accent="red" />
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </Button>
        </div>

        <Card>
          <CardHeader
            title="Pending Leave Requests"
            subtitle={role === 'teacher' ? 'Requests awaiting your approval' : 'Teacher-approved requests needing HOD review'}
            action={<Button size="sm" onClick={() => setPage('leave-approvals')}>View All</Button>}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Teacher</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {deptLeaves
                  .filter((r) => role === 'teacher' ? !r.teacherApproved && r.status === 'pending' : r.teacherApproved && !r.hodApproved && r.status === 'pending')
                  .slice(0, 5)
                  .map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{r.studentName}</td>
                      <td className="px-5 py-3 text-gray-600">{r.leaveType}</td>
                      <td className="px-5 py-3 text-gray-600">{formatDate(r.startDate)} → {formatDate(r.endDate)}</td>
                      <td className="px-5 py-3">
                        {r.teacherApproved ? <StatusBadge status="approved" /> : <StatusBadge status="pending" />}
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                {pending === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No pending requests</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // Admin dashboard
  const totalUsers = data.users.length;
  const totalLeaves = data.leaveRequests.length;
  const totalSlots = data.greenCardSlots.length;
  const totalRooms = data.classrooms.length;
  const pendingLeaves = data.leaveRequests.filter((r) => r.status === 'pending').length;
  const approvedLeaves = data.leaveRequests.filter((r) => r.status === 'approved').length;
  const totalBookings = data.bookings.length;

  const exportAllCSV = () => {
    const rows = data.leaveRequests.map((r) => ({
      Student: r.studentName, RollNo: r.rollNo, Department: r.department,
      LeaveType: r.leaveType, StartDate: r.startDate, EndDate: r.endDate,
      Reason: r.reason, Status: r.status, TeacherApproved: r.teacherApproved,
      HODApproved: r.hodApproved, DecidedBy: r.decidedBy || '', CreatedAt: r.createdAt,
    }));
    downloadCSV('all_leave_requests.csv', toCSV(rows));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-xl bg-gradient-to-r from-navy-800 to-navy-700 p-6 text-white">
        <h3 className="text-xl font-semibold">Admin Dashboard</h3>
        <p className="mt-1 text-navy-200 text-sm">System overview and management · {currentUser.name}</p>
      </div>

      {data.users.filter((u) => u.role === 'teacher' && u.accountStatus === 'pending').length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
              {data.users.filter((u) => u.role === 'teacher' && u.accountStatus === 'pending').length}
            </div>
            <div>
              <h4 className="font-bold text-amber-900">Faculty Accounts Awaiting Verification</h4>
              <p className="text-xs text-amber-700">New teacher registrations require administrator approval before granting access.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setPage('users')}>Review in User Management</Button>
        </div>
      )}


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={totalUsers} icon={<Users size={24} />} accent="navy" />
        <StatCard label="Leave Requests" value={totalLeaves} icon={<FileText size={24} />} accent="blue" />
        <StatCard label="Green Card Slots" value={totalSlots} icon={<CalendarCheck size={24} />} accent="emerald" />
        <StatCard label="Classrooms" value={totalRooms} icon={<DoorOpen size={24} />} accent="amber" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending Leaves" value={pendingLeaves} icon={<Clock size={24} />} accent="amber" />
        <StatCard label="Approved Leaves" value={approvedLeaves} icon={<CheckCircle2 size={24} />} accent="emerald" />
        <StatCard label="Total Bookings" value={totalBookings} icon={<TrendingUp size={24} />} accent="blue" />
        <StatCard label="Schedules" value={data.classroomSchedules.length} icon={<ClipboardList size={24} />} accent="navy" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setPage('users')}><Users size={16} /> Manage Users</Button>
        <Button variant="secondary" onClick={() => setPage('green-card')}><CalendarCheck size={16} /> Manage Slots</Button>
        <Button variant="secondary" onClick={() => setPage('classroom')}><DoorOpen size={16} /> Manage Classrooms</Button>
        <Button variant="secondary" onClick={exportAllCSV}><Download size={16} /> Export All Leaves</Button>
      </div>

      <Card>
        <CardHeader title="Recent Leave Requests" subtitle="All departments" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.leaveRequests.slice(0, 7).map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{r.studentName}</td>
                  <td className="px-5 py-3 text-gray-600">{r.department}</td>
                  <td className="px-5 py-3 text-gray-600">{r.leaveType}</td>
                  <td className="px-5 py-3 text-gray-600">{formatDate(r.startDate)}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Upcoming Green Card Slots" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Capacity</th>
                <th className="px-5 py-3">Booked</th>
              </tr>
            </thead>
            <tbody>
              {data.greenCardSlots.slice(0, 5).map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{s.title}</td>
                  <td className="px-5 py-3 text-gray-600">{formatDate(s.date)}</td>
                  <td className="px-5 py-3 text-gray-600">{formatTime(s.startTime)} - {formatTime(s.endTime)}</td>
                  <td className="px-5 py-3 text-gray-600">{s.capacity}</td>
                  <td className="px-5 py-3 text-gray-600">{s.bookedIds.length}/{s.capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
