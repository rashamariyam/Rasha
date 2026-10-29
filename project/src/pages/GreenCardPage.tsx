import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, EmptyState, Field, Input } from '@/components/ui/Form';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { validateInteger } from '@/lib/validation';
import { formatDate, formatTime, toCSV, downloadCSV, getLocalDateString, cn } from '@/lib/utils';
import { CalendarCheck, Plus, Trash2, Edit, Download, Users, Clock, Calendar, Check, X, CalendarDays, Filter } from 'lucide-react';
import type { GreenCardSlot } from '@/types';

export function GreenCardPage() {
  const { currentUser, data, bookSlot, cancelBooking, addSlot, updateSlot, deleteSlot } = useApp();
  const today = getLocalDateString();

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [viewMode, setViewMode] = useState<'selected' | 'all'>('selected');
  const [showForm, setShowForm] = useState(false);
  const [editSlot, setEditSlot] = useState<GreenCardSlot | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', capacity: 20 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';

  // Only consider active/future slots (never display past dates as bookable)
  const allActiveSlots = [...data.greenCardSlots]
    .filter((s) => s.date >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));

  // Filter slots based on user selection mode
  const displayedSlots = viewMode === 'selected'
    ? allActiveSlots.filter((s) => s.date === selectedDate)
    : allActiveSlots;

  const openAdd = () => {
    setForm({ title: '', date: selectedDate || today, startTime: '', endTime: '', capacity: 20 });
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
    const curToday = getLocalDateString();

    if (!form.title.trim()) e.title = 'Title is required';
    
    if (!form.date) {
      e.date = 'Date is required';
    } else if (form.date < curToday) {
      e.date = 'Slot date cannot be in the past';
    }

    if (!form.startTime) e.startTime = 'Start time is required';
    if (!form.endTime) e.endTime = 'End time is required';
    if (form.startTime && form.endTime && form.startTime >= form.endTime) e.endTime = 'End time must be after start time';
    const capRes = validateInteger(form.capacity, 'Capacity', 1, 1000);
    if (!capRes.isValid) e.capacity = capRes.error || 'Capacity must be between 1 and 1000';
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editSlot) {
      updateSlot(editSlot.id, { title: form.title.trim(), date: form.date, startTime: form.startTime, endTime: form.endTime, capacity: form.capacity });
    } else {
      addSlot({ title: form.title.trim(), date: form.date, startTime: form.startTime, endTime: form.endTime, capacity: form.capacity });
      // Switch to the newly created slot's date so admin sees it immediately
      setSelectedDate(form.date);
      setViewMode('selected');
    }
    setShowForm(false);
  };

  const isBookedByMe = (slot: GreenCardSlot) => slot.bookedIds.includes(currentUser.id);
  const isFull = (slot: GreenCardSlot) => slot.bookedIds.length >= slot.capacity;
  const available = (slot: GreenCardSlot) => slot.capacity - slot.bookedIds.length;

  const exportCSV = () => {
    const rows = allActiveSlots.map((s) => ({
      Title: s.title, Date: s.date, StartTime: s.startTime, EndTime: s.endTime,
      Capacity: s.capacity, Booked: s.bookedIds.length, Available: available(s),
    }));
    downloadCSV('green_card_slots.csv', toCSV(rows));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Book a Slot</h2>
          <p className="text-sm text-gray-500">Reserve study, discussion, or lab slots with real-time seat availability</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={exportCSV}><Download size={16} /> CSV</Button>
          {isAdmin && <Button size="sm" onClick={openAdd}><Plus size={16} /> Add Slot</Button>}
        </div>
      </div>

      {/* Doctor-Appointment Style Date Selection Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-800">
              <CalendarCheck size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">Select Booking Date</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {viewMode === 'selected' ? (
                  <>Showing available slots for <strong className="text-navy-900">{formatDate(selectedDate)}</strong></>
                ) : (
                  <>Showing all upcoming scheduled slots across all dates</>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Appointment-style DatePicker dropdown */}
            <div className="w-full sm:w-64">
              <DatePicker
                value={selectedDate}
                minDate={today}
                placeholder="Choose booking date"
                onChange={(d) => {
                  setSelectedDate(d);
                  setViewMode('selected');
                }}
              />
            </div>

            {/* View filter toggles */}
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('selected')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition',
                  viewMode === 'selected'
                    ? 'bg-white text-navy-900 shadow-2xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <CalendarDays size={14} /> Selected Date
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition',
                  viewMode === 'all'
                    ? 'bg-white text-navy-900 shadow-2xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Filter size={14} /> All Upcoming ({allActiveSlots.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Slots Display */}
      {displayedSlots.length === 0 ? (
        <Card className="p-8 text-center">
          <EmptyState
            icon={<CalendarCheck size={36} className="text-gray-400" />}
            title={
              viewMode === 'selected'
                ? `No slots available for ${formatDate(selectedDate)}`
                : 'No upcoming slots available'
            }
            message={
              viewMode === 'selected'
                ? `There are no sessions scheduled on ${formatDate(selectedDate)}. Please choose another future date or view all upcoming slots.`
                : (isAdmin ? "Click 'Add Slot' above to create study sessions." : 'Check back later for new study and lab sessions.')
            }
          />
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {viewMode === 'selected' && (
              <Button variant="secondary" size="sm" onClick={() => setViewMode('all')}>
                View All Upcoming Slots ({allActiveSlots.length})
              </Button>
            )}
            {selectedDate !== today && (
              <Button size="sm" onClick={() => { setSelectedDate(today); setViewMode('selected'); }}>
                Go to Today ({formatDate(today)})
              </Button>
            )}
            {isAdmin && (
              <Button size="sm" onClick={openAdd}>
                <Plus size={16} /> Add Slot for {formatDate(selectedDate)}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              {viewMode === 'selected'
                ? `${displayedSlots.length} slot(s) on ${formatDate(selectedDate)}`
                : `${displayedSlots.length} total upcoming slot(s)`}
            </span>
            {selectedDate !== today && viewMode === 'selected' && (
              <button
                type="button"
                onClick={() => setSelectedDate(today)}
                className="text-navy-700 font-semibold hover:underline"
              >
                Jump to Today
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedSlots.map((slot) => (
              <Card key={slot.id} className="overflow-hidden transition hover:shadow-md border border-gray-200">
                <div className="bg-gradient-to-r from-navy-800 to-navy-700 p-4 text-white">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-base leading-tight">{slot.title}</h4>
                    {slot.date === today && (
                      <span className="shrink-0 rounded bg-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200 border border-emerald-400/30">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5 flex items-center gap-3 text-xs text-navy-200">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {formatDate(slot.date)}</span>
                    <span className="text-navy-400">·</span>
                    <span className="flex items-center gap-1"><Clock size={13} /> {formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
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
                      className={cn(
                        'h-full transition-all',
                        isFull(slot) ? 'bg-red-500' : available(slot) <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                      style={{ width: `${Math.min(100, (slot.bookedIds.length / slot.capacity) * 100)}%` }}
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
                        <Button variant="danger" size="sm" onClick={() => setDeleteId(slot.id)} title="Delete Slot">
                          <Trash2 size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Admin Add/Edit Modal */}
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
            <DatePicker
              value={form.date}
              minDate={today}
              placeholder="Select slot date"
              onChange={(d) => {
                setForm((f) => ({ ...f, date: d }));
                if (errors.date) setErrors((e) => ({ ...e, date: '' }));
              }}
            />
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
            <Input
              type="number"
              min={1}
              max={1000}
              step="1"
              value={form.capacity}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setForm((f) => ({ ...f, capacity: val !== '' ? Number(val) : ('' as unknown as number) }));
                if (errors.capacity) setErrors((err) => ({ ...err, capacity: '' }));
              }}
              placeholder="e.g. 20"
            />
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
