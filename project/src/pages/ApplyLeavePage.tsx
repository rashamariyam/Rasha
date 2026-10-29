import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select, Textarea, Button } from '@/components/ui/Form';
import { DocumentViewerModal } from '@/components/ui/DocumentViewerModal';
import { FileText, Paperclip, CheckCircle2, Eye, Trash2, AlertCircle } from 'lucide-react';

const leaveTypes = ['Sick Leave', 'Personal Leave', 'Conference Leave', 'Sports Leave', 'Family Event Leave', 'Other'];

export function ApplyLeavePage() {
  const { currentUser, addLeaveRequest, setPage } = useApp();
  const [form, setForm] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    documentName: '',
    documentUrl: '',
    documentType: '',
  });
  const [fileError, setFileError] = useState<string | null>(null);
  const [showDocPreview, setShowDocPreview] = useState(false);
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
      documentUrl: form.documentUrl || undefined,
      documentType: form.documentType || undefined,
    });
    setSubmitted(true);
    setForm({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      documentName: '',
      documentUrl: '',
      documentType: '',
    });
    setFileError(null);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File exceeds 5MB size limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const detectedType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      setForm((f) => ({
        ...f,
        documentName: file.name,
        documentUrl: result,
        documentType: detectedType,
      }));
    };
    reader.onerror = () => {
      setFileError('Could not read the selected file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setForm((f) => ({
      ...f,
      documentName: '',
      documentUrl: '',
      documentType: '',
    }));
    setFileError(null);
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
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-2xs transition">
                  <Paperclip size={16} className="text-navy-600" />
                  {form.documentName ? 'Replace File' : 'Choose File (PDF or Image)'}
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={handleFile}
                  />
                </label>

                {form.documentName && (
                  <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-1.5 text-xs text-indigo-900">
                    <span className="font-semibold truncate max-w-[200px]">{form.documentName}</span>
                    <button
                      type="button"
                      onClick={() => setShowDocPreview(true)}
                      className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:text-indigo-900 ml-1"
                      title="Preview uploaded document"
                    >
                      <Eye size={14} /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 ml-1 p-0.5"
                      title="Remove document"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {fileError ? (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle size={13} /> {fileError}
                </p>
              ) : (
                <p className="text-xs text-gray-400">
                  Upload medical certificates, event permissions, or proof (PDF, PNG, JPG up to 5MB). Teachers will be able to inspect and verify this document directly.
                </p>
              )}
            </div>
          </Field>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="secondary" onClick={() => setPage('dashboard')}>Cancel</Button>
            <Button type="submit"><FileText size={16} /> Submit Application</Button>
          </div>
        </form>
      </Card>

      {/* Preview Modal for student prior to submission */}
      <DocumentViewerModal
        open={showDocPreview}
        onClose={() => setShowDocPreview(false)}
        documentName={form.documentName}
        documentUrl={form.documentUrl}
        documentType={form.documentType}
        studentName={currentUser.name}
        rollNo={currentUser.rollNo}
        department={currentUser.department}
        leaveType={form.leaveType}
        reason={form.reason}
        startDate={form.startDate}
        endDate={form.endDate}
      />
    </div>
  );
}
