import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, EmptyState, Field, Input, Select } from '@/components/ui/Form';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { formatDate, formatTime, toCSV, downloadCSV } from '@/lib/utils';
import { CalendarCheck, Plus, Trash2, Edit, Download, Users, Clock, Calendar, Check, X } from 'lucide-react';
import type { GreenCardSlot } from '@/types';

export function GreenCardPage() {
  const { currentUser, data, bookSlot, cancelBooking, addSlot, updateSlot, deleteSlot } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editSlot, setEditSlot] = useState<GreenCardSlot | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', capacity: 20 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';

  const sortedSlots = [...data.greenCardSlots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const openAdd = () => {
    setForm({ title: '', date: '', startTime: '', endTime: '', capacity: 20 });
    setEditSlot(null);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (slot: GreenCardSlot) => {
    setForm({ title: slot.title, date: slot.date, startTime: slot.startTime, endTime: slot.endTime, capacity: slot.capacity });
    setEditSlot(slot);
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.startTime) e.startTime = 'Start time is required';
    if (!form.endTime) e.endTime = 'End time is required';
    if (form.startTime && form.endTime && form.startTime >= form.endTime) e.endTime = 'End time must be after start time';
    if (form.capacity < 1) e.capacity = 'Capacity must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editSlot) {
      updateSlot(editSlot.id, { title: form.title.trim(), date: form.date, startTime: form.startTime, endTime: form.endTime, capacity: form.capacity });
    } else {
      addSlot({ title: form.title.trim(), date: form.date, startTime: form.startTime, endTime: form.endTime, capacity: form.capacity });
    }
    setShowForm(false);
  };

  const isBookedByMe = (slot: GreenCardSlot) => slot.bookedIds.includes(currentUser.id);
  const isFull = (slot: GreenCardSlot) => slot.bookedIds.length >= slot.capacity;
  const available = (slot: GreenCardSlot) => slot.capacity - slot.bookedIds.length;

  const exportCSV = () => {
    const rows = sortedSlots.map((s) => ({
      Title: s.title, Date: s.date, StartTime: s.startTime, EndTime: s.endTime,
      Capacity: s.capacity, Booked: s.bookedIds.length, Available: available(s),
    }));
    downloadCSV('green_card_slots.csv', toCSV(rows));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Book study and lab slots. Seats update in real-time.</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCSV}><Download size={16} /> CSV</Button>
          {isAdmin && <Button size="sm" onClick={openAdd}><Plus size={16} /> Add Slot</Button>}
        </div>
      </div>

      {sortedSlots.length === 0 ? (
        <Card>
          <EmptyState icon={<CalendarCheck size={32} />} title="No slots available" message={isAdmin ? "Click 'Add Slot' to create one" : 'Check back later for new slots'} />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedSlots.map((slot) => (
            <Card key={slot.id} className="overflow-hidden transition hover:shadow-md">
              <div className="bg-gradient-to-r from-navy-800 to-navy-700 p-4 text-white">
                <h4 className="font-semibold">{slot.title}</h4>
                <div className="mt-2 flex items-center gap-3 text-sm text-navy-200">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(slot.date)}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-sm text-navy-200">
                  <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Capacity</p>
                      <p className="text-sm font-medium text-gray-800">{slot.bookedIds.length}/{slot.capacity} booked</p>
                    </div>
                  </div>
                  <Badge variant={available(slot) > 0 ? 'success' : 'error'}>
                    {available(slot) > 0 ? `${available(slot)} seats left` : 'Full'}
                  </Badge>
                </div>

                {/* Capacity bar */}
                <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full transition-all ${isFull(slot) ? 'bg-red-500' : available(slot) <= 3 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${(slot.bookedIds.length / slot.capacity) * 100}%` }}
                  />
                </div>

                <div className="flex gap-2">
                  {!isAdmin && (
                    isBookedByMe(slot) ? (
                      <Button variant="danger" size="sm" className="flex-1" onClick={() => cancelBooking(slot.id)}>
                        <X size={16} /> Cancel Booking
                      </Button>
                    ) : isFull(slot) ? (
                      <Button size="sm" className="flex-1" disabled>Fully Booked</Button>
                    ) : (
                      <Button size="sm" className="flex-1" onClick={() => bookSlot(slot.id)}>
                        <Check size={16} /> Book Slot
                      </Button>
                    )
                  )}
                  {isAdmin && (
                    <>
                      <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(slot)}>
                        <Edit size={16} /> Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteId(slot.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        open={showForm}
        title={editSlot ? 'Edit Slot' : 'Add Green Card Slot'}
        onClose={() => setShowForm(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editSlot ? 'Update' : 'Add Slot'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Slot Title" required error={errors.title}>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Library Study Session" />
          </Field>
          <Field label="Date" required error={errors.date}>
            <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Time" required error={errors.startTime}>
              <Input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
            </Field>
            <Field label="End Time" required error={errors.endTime}>
              <Input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
            </Field>
          </div>
          <Field label="Capacity" required error={errors.capacity}>
            <Input type="number" min={1} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Slot"
        message="This will permanently delete the slot and all associated bookings. Continue?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (deleteId) deleteSlot(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
