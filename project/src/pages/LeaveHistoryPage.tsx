import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button, EmptyState } from '@/components/ui/Form';
import { SearchBar } from '@/components/layout/Topbar';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatDateTime, toCSV, downloadCSV } from '@/lib/utils';
import { ClipboardList, Search, Download, Eye, FileText } from 'lucide-react';
import type { LeaveRequest } from '@/types';

export function LeaveHistoryPage() {
  const { currentUser, data, setPage } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [viewReq, setViewReq] = useState<LeaveRequest | null>(null);

  if (!currentUser) return null;

  const myLeaves = data.leaveRequests.filter((r) => r.studentId === currentUser.id);
  const filtered = myLeaves
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) => {
      const q = search.toLowerCase();
      return r.leaveType.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q);
    });

  const exportCSV = () => {
    const rows = filtered.map((r) => ({
      LeaveType: r.leaveType, StartDate: r.startDate, EndDate: r.endDate,
      Reason: r.reason, Status: r.status, TeacherApproved: r.teacherApproved,
      HODApproved: r.hodApproved, DecidedBy: r.decidedBy || '', DecidedAt: r.decidedAt || '',
      DecisionNote: r.decisionNote || '',
    }));
    downloadCSV('my_leave_history.csv', toCSV(rows));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by type or reason..." />
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
        <CardHeader title="My Leave Applications" subtitle={`${filtered.length} application(s)`} />
        {filtered.length === 0 ? (
          <EmptyState icon={<ClipboardList size={32} />} title="No applications found" message="Apply for leave to see it here" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">Leave Type</th>
                  <th className="px-5 py-3">Start Date</th>
                  <th className="px-5 py-3">End Date</th>
                  <th className="px-5 py-3">Teacher</th>
                  <th className="px-5 py-3">HOD</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{r.leaveType}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(r.startDate)}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(r.endDate)}</td>
                    <td className="px-5 py-3">
                      {r.teacherApproved ? <StatusBadge status="approved" /> : <StatusBadge status="pending" />}
                    </td>
                    <td className="px-5 py-3">
                      {r.hodApproved ? <StatusBadge status="approved" /> : r.status === 'rejected' && r.decidedBy && r.hodApproved === false && r.teacherApproved ? <StatusBadge status="rejected" /> : <StatusBadge status="pending" />}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3">
                      <button onClick={() => setViewReq(r)} className="rounded-lg p-1.5 text-navy-600 hover:bg-navy-50">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {filtered.length === 0 && (
        <div className="text-center">
          <Button onClick={() => setPage('apply-leave')}><FileText size={16} /> Apply for Leave</Button>
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={!!viewReq}
        title="Leave Application Details"
        onClose={() => setViewReq(null)}
        size="lg"
        footer={<Button variant="secondary" onClick={() => setViewReq(null)}>Close</Button>}
      >
        {viewReq && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Leave Type" value={viewReq.leaveType} />
              <InfoRow label="Status" value={<StatusBadge status={viewReq.status} />} />
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
              {viewReq.decidedAt && <InfoRow label="Decided On" value={formatDateTime(viewReq.decidedAt)} />}
            </div>
            {viewReq.decisionNote && (
              <div className="rounded-lg bg-navy-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">Decision Note</p>
                <p className="mt-1 text-sm text-navy-800">{viewReq.decisionNote}</p>
              </div>
            )}
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
