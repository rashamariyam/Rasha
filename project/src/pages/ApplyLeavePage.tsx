import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select, Textarea, Button } from '@/components/ui/Form';
import { formatDate } from '@/lib/utils';
import { FileText, Paperclip, CheckCircle2 } from 'lucide-react';

const leaveTypes = ['Sick Leave', 'Personal Leave', 'Conference Leave', 'Sports Leave', 'Family Event Leave', 'Other'];

export function ApplyLeavePage() {
  const { currentUser, addLeaveRequest, setPage } = useApp();
  const [form, setForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    documentName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!currentUser) return null;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.leaveType) e.leaveType = 'Please select a leave type';
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.endDate) e.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      e.endDate = 'End date cannot be before start date';
    if (!form.reason.trim()) e.reason = 'Reason is required';
    if (form.reason.trim().length < 10) e.reason = 'Please provide a detailed reason (min 10 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    addLeaveRequest({
      studentId: currentUser.id,
      studentName: currentUser.name,
      rollNo: currentUser.rollNo || '',
      department: currentUser.department,
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason.trim(),
      documentName: form.documentName || undefined,
    });
    setSubmitted(true);
    setForm({ leaveType: '', startDate: '', endDate: '', reason: '', documentName: '' });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm((f) => ({ ...f, documentName: file.name }));
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 size={48} />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-navy-900">Leave Application Submitted!</h3>
        <p className="mt-2 text-sm text-gray-500">Your request has been sent for approval. You can track its status in Leave History.</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => setSubmitted(false)}>Apply Another</Button>
          <Button variant="secondary" onClick={() => setPage('leave-history')}>View Leave History</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="max-w-2xl mx-auto">
        <CardHeader title="Apply for Leave" subtitle="Fill in the details below to submit a leave request" />
        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {/* Student info (read-only) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Student Name</p>
              <p className="font-medium text-gray-800">{currentUser.name}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Roll No / Department</p>
              <p className="font-medium text-gray-800">{currentUser.rollNo} · {currentUser.department}</p>
            </div>
          </div>

          <Field label="Leave Type" required error={errors.leaveType}>
            <Select value={form.leaveType} onChange={(e) => setForm((f) => ({ ...f, leaveType: e.target.value }))}>
              <option value="">Select leave type</option>
              {leaveTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start Date" required error={errors.startDate}>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </Field>
            <Field label="End Date" required error={errors.endDate}>
              <Input type="date" value={form.endDate} min={form.startDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            </Field>
          </div>

          <Field label="Reason" required error={errors.reason}>
            <Textarea
              rows={4}
              placeholder="Explain the reason for your leave request..."
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            />
          </Field>

          <Field label="Supporting Document (optional)">
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Paperclip size={16} />
                {form.documentName || 'Choose file'}
                <input type="file" className="hidden" onChange={handleFile} />
              </label>
              {form.documentName && (
                <button type="button" onClick={() => setForm((f) => ({ ...f, documentName: '' }))} className="text-sm text-red-500 hover:underline">
                  Remove
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400">Only the filename is saved in this demo</p>
          </Field>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setPage('dashboard')}>Cancel</Button>
            <Button type="submit"><FileText size={16} /> Submit Application</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
