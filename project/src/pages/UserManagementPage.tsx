import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, EmptyState, Field, Input, Select } from '@/components/ui/Form';
import { SearchBar } from '@/components/layout/Topbar';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { toCSV, downloadCSV } from '@/lib/utils';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { validatePhone } from '@/lib/validation';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Download,
  GraduationCap,
  BookOpen,
  Building2,
  ShieldCheck,
  Check,
  X,
  Ban,
  CheckCircle2,
  Clock,
  Lock,
} from 'lucide-react';
import type { User, Role, AccountStatus } from '@/types';

const roleLabels: Record<Role, string> = {
  student: 'Student',
  teacher: 'Teacher',
  hod: 'HOD',
  admin: 'Admin',
};

const roleIcons: Record<Role, React.ReactNode> = {
  student: <GraduationCap size={14} />,
  teacher: <BookOpen size={14} />,
  hod: <Building2 size={14} />,
  admin: <ShieldCheck size={14} />,
};

const roleVariants: Record<Role, 'navy' | 'blue' | 'success' | 'warning' | 'neutral'> = {
  student: 'navy',
  teacher: 'blue',
  hod: 'success',
  admin: 'warning',
};

const departments = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Information Technology',
  'Administration',
];

export function UserManagementPage() {
  const { data, updateUser, deleteUser, createAdminUser, verifyUserAccount } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'student' as Role,
    department: 'Computer Science',
    year: 1,
    rollNo: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const pendingCount = data.users.filter((u) => u.accountStatus === 'pending').length;

  const filtered = data.users
    .filter((u) => roleFilter === 'all' || u.role === roleFilter)
    .filter((u) => statusFilter === 'all' || u.accountStatus === statusFilter)
    .filter((u) => {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.rollNo || '').toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
      );
    });

  const roleCounts: Record<string, number> = {
    student: data.users.filter((u) => u.role === 'student').length,
    teacher: data.users.filter((u) => u.role === 'teacher').length,
    hod: data.users.filter((u) => u.role === 'hod').length,
    admin: data.users.filter((u) => u.role === 'admin').length,
  };

  const openAdd = (presetRole: Role = 'student') => {
    setForm({
      name: '',
      email: '',
      role: presetRole,
      department: 'Computer Science',
      year: 1,
      rollNo: '',
      phone: '',
      password: '',
    });
    setEditUser(null);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (u: User) => {
    setForm({
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      year: u.year || 1,
      rollNo: u.rollNo || '',
      phone: u.phone || '',
      password: '',
    });
    setEditUser(u);
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';

    if (!editUser && !form.password) {
      e.password = 'Initial password is required';
    } else if (!editUser && form.password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }

    if (form.phone.trim()) {
      const phoneRes = validatePhone(form.phone);
      if (!phoneRes.isValid) {
        e.phone = phoneRes.error || 'Please enter a valid 10-digit mobile number';
      }
    }

    if (!form.rollNo.trim()) {
      e.rollNo =
        form.role === 'student'
          ? 'Roll number is required for students'
          : form.role === 'hod'
          ? 'HOD / Employee ID is required'
          : 'Employee ID is required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      if (editUser) {
        updateUser(editUser.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          department: form.department,
          rollNo: form.rollNo.trim().toUpperCase(),
          phone: form.phone.trim() || undefined,
          ...(form.role === 'student' ? { year: form.year } : {}),
        });
        setShowForm(false);
      } else {
        const res = await createAdminUser({
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          department: form.department,
          rollNo: form.rollNo.trim().toUpperCase(),
          phone: form.phone.trim() || undefined,
          year: form.role === 'student' ? form.year : undefined,
          password: form.password,
        });

        if (res.success) {
          setShowForm(false);
        } else {
          setErrors({ form: res.error || 'Failed to create user.' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const rows = filtered.map((u) => ({
      Name: u.name,
      Email: u.email,
      Role: roleLabels[u.role],
      Department: u.department,
      Status: u.accountStatus,
      RollNo: u.rollNo || '',
      Phone: u.phone || '',
      Created: u.createdAt,
    }));
    downloadCSV('users_directory.csv', toCSV(rows));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Pending verification alert banner if applicable */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
              {pendingCount}
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Faculty Accounts Awaiting Verification</h3>
              <p className="text-xs text-amber-700">
                Newly registered teachers must be verified before they can review student leaves.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setRoleFilter('teacher');
              setStatusFilter('pending');
            }}
          >
            Review Pending ({pendingCount})
          </Button>
        </div>
      )}

      {/* Role summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(['student', 'teacher', 'hod', 'admin'] as Role[]).map((r) => (
          <div
            key={r}
            onClick={() => setRoleFilter(roleFilter === r ? 'all' : r)}
            className={`cursor-pointer rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
              roleFilter === r ? 'border-navy-500 bg-navy-50/50 ring-2 ring-navy-400' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
                  {roleIcons[r]}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{roleLabels[r]} Directory</p>
                  <p className="text-xl font-bold text-navy-900">{roleCounts[r]}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-navy-600">Filter</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls & Quick HOD provision */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, roll no, department..."
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | Role)}
            className="w-auto"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="hod">HODs</option>
            <option value="admin">Admins</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | AccountStatus)}
            className="w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="disabled">Disabled</option>
          </Select>

          <Button variant="secondary" size="sm" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => openAdd('hod')}
            className="bg-emerald-700 hover:bg-emerald-800 text-white"
            title="Create an authorized Head of Department account"
          >
            <Building2 size={16} /> Provision HOD
          </Button>

          <Button size="sm" onClick={() => openAdd('student')}>
            <Plus size={16} /> Add User
          </Button>
        </div>
      </div>

      {/* Users table */}
      <Card>
        <CardHeader
          title="User Management Console"
          subtitle={`Showing ${filtered.length} of ${data.users.length} account(s)`}
        />
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={32} />}
            title="No users match filters"
            message="Try clearing your search query or role/status filters"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">College / Employee ID</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Verification & Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isPending = u.accountStatus === 'pending';
                  const isDisabled = u.accountStatus === 'disabled';
                  return (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-700">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 block">{u.name}</span>
                            <span className="text-xs text-gray-400">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-700">
                        {u.rollNo || '—'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={roleVariants[u.role]}>
                          {roleIcons[u.role]} {roleLabels[u.role]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{u.department}</td>
                      <td className="px-5 py-3">
                        {u.accountStatus === 'active' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        )}
                        {u.accountStatus === 'pending' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                            <Clock size={12} /> Pending Verification
                          </span>
                        )}
                        {u.accountStatus === 'disabled' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-medium text-red-700">
                            <Ban size={12} /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Pending Review Actions */}
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => verifyUserAccount(u.id, 'active')}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                                title="Approve & Activate Account"
                              >
                                <Check size={14} /> Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => verifyUserAccount(u.id, 'rejected')}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                                title="Reject Application"
                              >
                                <X size={14} /> Reject
                              </button>
                            </>
                          )}

                          {/* Active / Disable toggle */}
                          {!isPending && !isDisabled && (
                            <button
                              type="button"
                              onClick={() => verifyUserAccount(u.id, 'disabled')}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-700"
                              title="Disable Account"
                            >
                              <Ban size={16} />
                            </button>
                          )}

                          {isDisabled && (
                            <button
                              type="button"
                              onClick={() => verifyUserAccount(u.id, 'active')}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200"
                              title="Re-enable Account"
                            >
                              <CheckCircle2 size={14} /> Re-enable
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openEdit(u)}
                            className="rounded-lg p-1.5 text-navy-600 hover:bg-navy-50"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteUserId(u.id)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit User Modal */}
      <Modal
        open={showForm}
        title={
          editUser
            ? `Edit User: ${editUser.name}`
            : form.role === 'hod'
            ? 'Provision Head of Department (HOD) Account'
            : 'Add New Institutional User'
        }
        onClose={() => setShowForm(false)}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={loading}>
              {loading
                ? 'Saving...'
                : editUser
                ? 'Update User'
                : form.role === 'hod'
                ? 'Provision HOD'
                : 'Create User'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {errors.form && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {errors.form}
            </div>
          )}

          {form.role === 'hod' && !editUser && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 flex items-start gap-2">
              <Building2 size={16} className="shrink-0 text-emerald-700 mt-0.5" />
              <p>
                <strong>Secure HOD Account Creation:</strong> This assigns final departmental leave approval authority to the department head.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Role" required>
              <Select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                disabled={!!editUser}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher (Faculty)</option>
                <option value="hod">HOD (Head of Department)</option>
                <option value="admin">Administrator</option>
              </Select>
            </Field>

            <Field label="Department" required>
              <Select
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Full Name" required error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Dr. Rajesh Nair"
            />
          </Field>

          <Field label="Official Email Address" required error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="e.g. rajesh@college.edu"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label={
                form.role === 'student'
                  ? 'Roll Number'
                  : form.role === 'hod'
                  ? 'HOD / Employee ID'
                  : 'Employee ID'
              }
              required
              error={errors.rollNo}
            >
              <Input
                value={form.rollNo}
                onChange={(e) => setForm((f) => ({ ...f, rollNo: e.target.value }))}
                placeholder={
                  form.role === 'student'
                    ? 'CS21B001'
                    : form.role === 'hod'
                    ? 'HOD-CS-01'
                    : 'TCH-CS-01'
                }
              />
            </Field>

            <Field label="Phone Number (Optional)" error={errors.phone}>
              <PhoneInput
                value={form.phone}
                error={errors.phone}
                onChange={(phone) => {
                  setForm((f) => ({ ...f, phone }));
                  if (errors.phone) setErrors((e) => ({ ...e, phone: '' }));
                }}
                placeholder="9876543210"
              />
            </Field>
          </div>

          {!editUser && (
            <Field label="Initial Temporary Password" required error={errors.password}>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Set account password (min. 6 characters)"
                  className="pl-10"
                />
              </div>
            </Field>
          )}

          {form.role === 'student' && (
            <Field label="Current Year of Study">
              <Select
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </Select>
            </Field>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteUserId}
        title="Delete User"
        message="This will permanently remove the user and their credentials from the system. Continue?"
        confirmLabel="Delete User"
        variant="danger"
        onConfirm={() => {
          if (deleteUserId) deleteUser(deleteUserId);
          setDeleteUserId(null);
        }}
        onCancel={() => setDeleteUserId(null)}
      />
    </div>
  );
}
