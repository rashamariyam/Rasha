import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button, EmptyState, Textarea, Field } from '@/components/ui/Form';
import { SearchBar } from '@/components/layout/Topbar';
import { Modal } from '@/components/ui/Modal';
import { DocumentViewerModal } from '@/components/ui/DocumentViewerModal';
import { formatDate, formatDateTime, toCSV, downloadCSV } from '@/lib/utils';
import { downloadDocument, getDocumentUrl } from '@/lib/documentUtils';
import { CheckSquare, Download, Check, X, Eye, Clock, Paperclip } from 'lucide-react';
import type { LeaveRequest } from '@/types';

export function LeaveApprovalsPage() {
  const { currentUser, data, decideLeave } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [deptScope, setDeptScope] = useState<'my' | 'all'>('my');
  const [viewReq, setViewReq] = useState<LeaveRequest | null>(null);
  const [viewingDoc, setViewingDoc] = useState<LeaveRequest | null>(null);
  const [decision, setDecision] = useState<{ req: LeaveRequest; approve: boolean } | null>(null);
  const [note, setNote] = useState('');

  if (!currentUser) return null;
  const role = currentUser.role;

  let requests = data.leaveRequests;
  if (role === 'teacher' || role === 'hod') {
    const userDept = (currentUser.department || '').trim().toLowerCase();
    if (deptScope === 'my') {
      const myDeptRequests = requests.filter(
        (r) => (r.department || '').trim().toLowerCase() === userDept
      );
      // Auto-fallback: if no requests found specifically in teacher's department, show all so requests are never lost
      requests = myDeptRequests.length > 0 ? myDeptRequests : requests;
    }
  }

  const filtered = requests
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) => {
      const q = search.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.leaveType.toLowerCase().includes(q) ||
        r.rollNo.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
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
      Student: r.studentName,
      RollNo: r.rollNo,
      Department: r.department,
      LeaveType: r.leaveType,
      StartDate: r.startDate,
      EndDate: r.endDate,
      Reason: r.reason,
      Document: r.documentName || 'None',
      Status: r.status,
      TeacherApproved: r.teacherApproved,
      HODApproved: r.hodApproved,
      DecidedBy: r.decidedBy || '',
      Note: r.decisionNote || '',
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
          <SearchBar value={search} onChange={setSearch} placeholder="Search student, roll no, department..." />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Scope Selector */}
          {(role === 'teacher' || role === 'hod') && (
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs">
              <button
                type="button"
                onClick={() => setDeptScope('my')}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  deptScope === 'my'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {currentUser.department || 'My Dept'}
              </button>
              <button
                type="button"
                onClick={() => setDeptScope('all')}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  deptScope === 'all'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                All Depts
              </button>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex rounded-lg border border-gray-200 p-1">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium capitalize transition ${
                  filter === f ? 'bg-navy-800 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            <Download size={16} /> CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Leave Requests"
          subtitle={
            role === 'teacher'
              ? 'Review, inspect student supporting documents, and approve leave requests'
              : role === 'hod'
              ? 'Final approval stage — review teacher-approved requests & verified documents'
              : 'All leave requests across departments'
          }
        />
        {filtered.length === 0 ? (
          <EmptyState icon={<CheckSquare size={32} />} title="No requests found" message="No leave requests match your filters" />
        ) : (
          <>
            {/* Mobile Touch-Optimized Cards View (Phone Screens) */}
            <div className="block sm:hidden divide-y divide-gray-100">
              {filtered.map((r) => (
                <div key={r.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{r.studentName}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{r.rollNo} · {r.department}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="font-semibold text-navy-800 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                      {r.leaveType}
                    </span>
                    <span>{formatDate(r.startDate)} → {formatDate(r.endDate)}</span>
                  </div>

                  {r.reason && (
                    <p className="text-xs text-gray-600 line-clamp-2 italic bg-navy-50/30 p-2 rounded">
                      "{r.reason}"
                    </p>
                  )}

                  {/* Mobile Document Attachment Row */}
                  {r.documentName && (
                    <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/60 p-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Paperclip size={14} className="text-indigo-600 shrink-0" />
                        <span className="font-medium text-indigo-900 truncate max-w-[170px]">{r.documentName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingDoc(r)}
                        className="shrink-0 inline-flex items-center gap-1 rounded bg-indigo-600 px-2 py-0.5 font-semibold text-white hover:bg-indigo-700 shadow-2xs transition"
                      >
                        <Eye size={12} /> View Doc
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Teacher: {r.teacherApproved ? '✅ Verified' : '⏳ Pending'}</span>
                    <span>HOD: {r.hodApproved ? '✅ Verified' : '⏳ Pending'}</span>
                  </div>

                  {/* Mobile Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setViewReq(r)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                    >
                      <Eye size={15} /> Details
                    </button>
                    {canDecide(r) && (
                      <>
                        <button
                          type="button"
                          onClick={() => { setDecision({ req: r, approve: false }); setNote(''); }}
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 active:bg-red-200"
                        >
                          <X size={15} /> Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDecision({ req: r, approve: true }); setNote(''); }}
                          className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800"
                        >
                          <Check size={15} /> Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Full Table View (Tablet & Desktop Screens) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3">Student</th>
                    <th className="px-5 py-3">Roll No</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3">Document</th>
                    <th className="px-5 py-3">Teacher</th>
                    <th className="px-5 py-3">HOD</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{r.studentName}</td>
                      <td className="px-5 py-3 text-gray-600">{r.rollNo}</td>
                      <td className="px-5 py-3 text-gray-600">{r.leaveType}</td>
                      <td className="px-5 py-3 text-gray-600">{formatDate(r.startDate)} → {formatDate(r.endDate)}</td>
                      <td className="px-5 py-3">
                        {r.documentName ? (
                          <button
                            type="button"
                            onClick={() => setViewingDoc(r)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition shadow-2xs"
                            title="Click to view supporting document"
                          >
                            <Paperclip size={13} className="text-indigo-600" />
                            <span className="max-w-[110px] truncate">{r.documentName}</span>
                            <Eye size={12} className="text-indigo-500 ml-0.5" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </td>
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
          </>
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
            </div>

            {/* Supporting Document Section */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Supporting Document</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Paperclip size={16} className={viewReq.documentName ? "text-indigo-600" : "text-gray-400"} />
                    <span className="text-sm font-semibold text-gray-900">
                      {viewReq.documentName || 'No document submitted'}
                    </span>
                  </div>
                </div>
                {viewReq.documentName && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingDoc(viewReq)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
                    >
                      <Eye size={14} /> View Document
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const doc = getDocumentUrl(viewReq);
                        downloadDocument(doc.url, viewReq.documentName || 'leave_document');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Download size={14} /> Download
                    </button>
                  </div>
                )}
              </div>
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

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        open={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        documentName={viewingDoc?.documentName}
        documentUrl={viewingDoc?.documentUrl}
        documentType={viewingDoc?.documentType}
        studentName={viewingDoc?.studentName}
        rollNo={viewingDoc?.rollNo}
        department={viewingDoc?.department}
        leaveType={viewingDoc?.leaveType}
        reason={viewingDoc?.reason}
        startDate={viewingDoc?.startDate}
        endDate={viewingDoc?.endDate}
        createdAt={viewingDoc?.createdAt}
      />
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
