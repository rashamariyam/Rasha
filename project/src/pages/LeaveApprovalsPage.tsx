import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button, EmptyState, Textarea, Field } from '@/components/ui/Form';
import { SearchBar } from '@/components/layout/Topbar';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { formatDate, formatDateTime, toCSV, downloadCSV } from '@/lib/utils';
import { CheckSquare, Download, Check, X, Eye, Clock } from 'lucide-react';
import type { LeaveRequest } from '@/types';

export function LeaveApprovalsPage() {
  const { currentUser, data, decideLeave } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [viewReq, setViewReq] = useState<LeaveRequest | null>(null);
  const [decision, setDecision] = useState<{ req: LeaveRequest; approve: boolean } | null>(null);
  const [note, setNote] = useState('');

  if (!currentUser) return null;
  const role = currentUser.role;

  let requests = data.leaveRequests;
  if (role === 'teacher' || role === 'hod') {
    requests = requests.filter((r) => r.department === currentUser.department);
  }

  const filtered = requests
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) => {
      const q = search.toLowerCase();
      return r.studentName.toLowerCase().includes(q) ||
        r.leaveType.toLowerCase().includes(q) ||
        r.rollNo.toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const canDecide = (r: LeaveRequest): boolean => {
    if (r.status === 'approved') return false;
    if (role === 'teacher') return !r.teacherApproved && r.status === 'pending';
    if (role === 'hod') return r.teacherApproved && !r.hodApproved && r.status === 'pending';
    return false;
  };

  const exportCSV = () => {
    const rows = filtered.map((r) => ({
      Student: r.studentName, RollNo: r.rollNo, Department: r.department,
      LeaveType: r.leaveType, StartDate: r.startDate, EndDate: r.endDate,
      Reason: r.reason, Status: r.status, TeacherApproved: r.teacherApproved,
      HODApproved: r.hodApproved, DecidedBy: r.decidedBy || '', Note: r.decisionNote || '',
    }));
    downloadCSV('leave_approvals.csv', toCSV(rows));
  };

  const confirmDecision = () => {
    if (!decision) return;
    decideLeave(decision.req.id, decision.approve, note);
    setDecision(null);
    setNote('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by student name, roll no, or type..." />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 p-1">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${filter === f ? 'bg-navy-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={exportCSV}><Download size={16} /> CSV</Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Leave Requests"
          subtitle={role === 'teacher' ? 'Review and approve student leave requests' : role === 'hod' ? 'Final approval stage — review teacher-approved requests' : 'All leave requests across departments'}
        />
        {filtered.length === 0 ? (
          <EmptyState icon={<CheckSquare size={32} />} title="No requests found" message="No leave requests match your filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Roll No</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Teacher</th>
                  <th className="px-5 py-3">HOD</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{r.studentName}</td>
                    <td className="px-5 py-3 text-gray-600">{r.rollNo}</td>
                    <td className="px-5 py-3 text-gray-600">{r.leaveType}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(r.startDate)} → {formatDate(r.endDate)}</td>
                    <td className="px-5 py-3">{r.teacherApproved ? <StatusBadge status="approved" /> : <StatusBadge status="pending" />}</td>
                    <td className="px-5 py-3">{r.hodApproved ? <StatusBadge status="approved" /> : <StatusBadge status="pending" />}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewReq(r)} className="rounded-lg p-1.5 text-navy-600 hover:bg-navy-50" title="View details">
                          <Eye size={18} />
                        </button>
                        {canDecide(r) && (
                          <>
                            <button
                              onClick={() => { setDecision({ req: r, approve: true }); setNote(''); }}
                              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => { setDecision({ req: r, approve: false }); setNote(''); }}
                              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        {!canDecide(r) && r.status === 'pending' && (
                          <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={14} /> Waiting</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail modal */}
      <Modal
        open={!!viewReq}
        title="Leave Request Details"
        onClose={() => setViewReq(null)}
        size="lg"
        footer={
          viewReq && canDecide(viewReq) ? (
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setViewReq(null)}>Close</Button>
              <div className="flex gap-2">
                <Button variant="danger" onClick={() => { setDecision({ req: viewReq, approve: false }); setNote(''); }}>
                  <X size={16} /> Reject
                </Button>
                <Button onClick={() => { setDecision({ req: viewReq, approve: true }); setNote(''); }}>
                  <Check size={16} /> Approve
                </Button>
              </div>
            </div>
          ) : <Button variant="secondary" onClick={() => setViewReq(null)}>Close</Button>
        }
      >
        {viewReq && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Student" value={viewReq.studentName} />
              <InfoRow label="Roll No" value={viewReq.rollNo} />
              <InfoRow label="Department" value={viewReq.department} />
              <InfoRow label="Leave Type" value={viewReq.leaveType} />
              <InfoRow label="Start Date" value={formatDate(viewReq.startDate)} />
              <InfoRow label="End Date" value={formatDate(viewReq.endDate)} />
              <InfoRow label="Submitted On" value={formatDateTime(viewReq.createdAt)} />
              <InfoRow label="Document" value={viewReq.documentName || 'None'} />
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reason</p>
              <p className="mt-1 text-sm text-gray-800">{viewReq.reason}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Teacher Approved" value={viewReq.teacherApproved ? 'Yes' : 'No'} />
              <InfoRow label="HOD Approved" value={viewReq.hodApproved ? 'Yes' : 'No'} />
              {viewReq.decidedBy && <InfoRow label="Decided By" value={viewReq.decidedBy} />}
              {viewReq.decisionNote && <InfoRow label="Decision Note" value={viewReq.decisionNote} />}
            </div>
          </div>
        )}
      </Modal>

      {/* Decision dialog */}
      <Modal
        open={!!decision}
        title={decision?.approve ? 'Approve Leave Request' : 'Reject Leave Request'}
        onClose={() => setDecision(null)}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDecision(null)}>Cancel</Button>
            <Button variant={decision?.approve ? 'primary' : 'danger'} onClick={confirmDecision}>
              {decision?.approve ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </div>
        }
      >
        {decision && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You are about to <strong className={decision.approve ? 'text-emerald-600' : 'text-red-600'}>
                {decision.approve ? 'approve' : 'reject'}
              </strong> the {decision.req.leaveType} request from <strong>{decision.req.studentName}</strong>.
            </p>
            <Field label="Decision Note (optional)">
              <Textarea
                rows={3}
                placeholder="Add a note for the student..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm text-gray-800">{value}</p>
    </div>
  );
}
