import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Select, Textarea, Button } from '@/components/ui/Form';
import { DatePicker } from '@/components/ui/DatePicker';
import { getLocalDateString } from '@/lib/utils';
import { FileText, CheckCircle2 } from 'lucide-react';

const leaveTypes = ['Sick Leave', 'Personal Leave', 'Conference Leave', 'Sports Leave', 'Family Event Leave', 'Other'];

export function ApplyLeavePage() {
  const { currentUser, addLeaveRequest, setPage } = useApp();
  const today = getLocalDateString();

  const [form, setForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!currentUser) return null;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const curToday = getLocalDateString();

    if (!form.leaveType) e.leaveType = 'Please select a leave type';
    
    if (!form.startDate) {
      e.startDate = 'Start date is required';
    } else if (form.startDate < curToday) {
      e.startDate = 'Start date cannot be in the past';
    }

    if (!form.endDate) {
      e.endDate = 'End date is required';
    } else if (form.endDate < curToday) {
      e.endDate = 'End date cannot be in the past';
    }

    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      e.endDate = 'End date cannot be before start date';
    }

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
    });
    setSubmitted(true);
    setForm({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
    });
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
              <DatePicker
                value={form.startDate}
                minDate={today}
                placeholder="Select start date"
                onChange={(d) => {
                  setForm((f) => {
                    const nextEndDate = f.endDate && f.endDate < d ? d : f.endDate;
                    return { ...f, startDate: d, endDate: nextEndDate };
                  });
                  if (errors.startDate) setErrors((e) => ({ ...e, startDate: '' }));
                }}
              />
            </Field>
            <Field label="End Date" required error={errors.endDate}>
              <DatePicker
                value={form.endDate}
                minDate={form.startDate || today}
                placeholder="Select end date"
                onChange={(d) => {
                  setForm((f) => ({ ...f, endDate: d }));
                  if (errors.endDate) setErrors((e) => ({ ...e, endDate: '' }));
                }}
              />
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

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setPage('dashboard')}>Cancel</Button>
            <Button type="submit"><FileText size={16} /> Submit Application</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
