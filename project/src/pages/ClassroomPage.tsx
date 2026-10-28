import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, EmptyState, Field, Input, Select } from '@/components/ui/Form';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { SearchBar } from '@/components/layout/Topbar';
import { formatDate, formatTime, rangesOverlap, toCSV, downloadCSV } from '@/lib/utils';
import {
  DoorOpen, Search as SearchIcon, Plus, Edit, Trash2, Download,
  Calendar, Clock, Users, Building, Check, X,
} from 'lucide-react';
import type { Classroom } from '@/types';

export function ClassroomPage() {
  const { currentUser, data, addClassroom, updateClassroom, deleteClassroom, addSchedule, deleteSchedule } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkStart, setCheckStart] = useState('');
  const [checkEnd, setCheckEnd] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editRoom, setEditRoom] = useState<Classroom | null>(null);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [scheduleModal, setScheduleModal] = useState<Classroom | null>(null);
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);
  const [roomForm, setRoomForm] = useState({ roomNumber: '', building: '', capacity: 40, floor: 1 });
  const [roomErrors, setRoomErrors] = useState<Record<string, string>>({});
  const [schedForm, setSchedForm] = useState({ date: '', startTime: '', endTime: '', purpose: '', bookedBy: '' });
  const [schedErrors, setSchedErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';

  const isRoomAvailable = (roomId: string, date: string, start: string, end: string): boolean => {
    if (!date || !start || !end) return true;
    const conflicts = data.classroomSchedules.filter(
      (s) => s.classroomId === roomId && s.date === date && rangesOverlap(start, end, s.startTime, s.endTime)
    );
    return conflicts.length === 0;
  };

  const filteredRooms = data.classrooms.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.roomNumber.toLowerCase().includes(q) || r.building.toLowerCase().includes(q);
  });

  const searchResults = hasSearched
    ? data.classrooms.map((r) => ({
        room: r,
        available: isRoomAvailable(r.id, checkDate, checkStart, checkEnd),
        conflicts: data.classroomSchedules.filter(
          (s) => s.classroomId === r.id && s.date === checkDate && (!checkStart || !checkEnd || rangesOverlap(checkStart, checkEnd, s.startTime, s.endTime))
        ),
      }))
    : [];

  const openAddRoom = () => {
    setRoomForm({ roomNumber: '', building: '', capacity: 40, floor: 1 });
    setEditRoom(null);
    setRoomErrors({});
    setShowRoomForm(true);
  };

  const openEditRoom = (r: Classroom) => {
    setRoomForm({ roomNumber: r.roomNumber, building: r.building, capacity: r.capacity, floor: r.floor });
    setEditRoom(r);
    setRoomErrors({});
    setShowRoomForm(true);
  };

  const validateRoom = (): boolean => {
    const e: Record<string, string> = {};
    if (!roomForm.roomNumber.trim()) e.roomNumber = 'Room number is required';
    if (!roomForm.building.trim()) e.building = 'Building is required';
    if (roomForm.capacity < 1) e.capacity = 'Capacity must be at least 1';
    setRoomErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitRoom = () => {
    if (!validateRoom()) return;
    if (editRoom) {
      updateClassroom(editRoom.id, { roomNumber: roomForm.roomNumber.trim(), building: roomForm.building.trim(), capacity: roomForm.capacity, floor: roomForm.floor });
    } else {
      addClassroom({ roomNumber: roomForm.roomNumber.trim(), building: roomForm.building.trim(), capacity: roomForm.capacity, floor: roomForm.floor });
    }
    setShowRoomForm(false);
  };

  const validateSchedule = (): boolean => {
    const e: Record<string, string> = {};
    if (!schedForm.date) e.date = 'Date is required';
    if (!schedForm.startTime) e.startTime = 'Start time is required';
    if (!schedForm.endTime) e.endTime = 'End time is required';
    if (schedForm.startTime && schedForm.endTime && schedForm.startTime >= schedForm.endTime) e.endTime = 'End time must be after start time';
    if (!schedForm.purpose.trim()) e.purpose = 'Purpose is required';
    if (!schedForm.bookedBy.trim()) e.bookedBy = 'Booked by is required';
    setSchedErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitSchedule = () => {
    if (!validateSchedule() || !scheduleModal) return;
    addSchedule({
      classroomId: scheduleModal.id,
      date: schedForm.date,
      startTime: schedForm.startTime,
      endTime: schedForm.endTime,
      purpose: schedForm.purpose.trim(),
      bookedBy: schedForm.bookedBy.trim(),
    });
    setScheduleModal(null);
    setSchedForm({ date: '', startTime: '', endTime: '', purpose: '', bookedBy: '' });
  };

  const exportCSV = () => {
    const rows = data.classrooms.map((r) => {
      const scheds = data.classroomSchedules.filter((s) => s.classroomId === r.id);
      return {
        Room: r.roomNumber, Building: r.building, Floor: r.floor,
        Capacity: r.capacity, Schedules: scheds.length,
      };
    });
    downloadCSV('classrooms.csv', toCSV(rows));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Availability checker */}
      <Card>
        <CardHeader title="Check Classroom Availability" subtitle="Select a date and time to find free rooms" />
        <div className="p-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Date" required>
              <Input type="date" value={checkDate} onChange={(e) => setCheckDate(e.target.value)} />
            </Field>
            <Field label="Start Time" required>
              <Input type="time" value={checkStart} onChange={(e) => setCheckStart(e.target.value)} />
            </Field>
            <Field label="End Time" required>
              <Input type="time" value={checkEnd} onChange={(e) => setCheckEnd(e.target.value)} />
            </Field>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() => {
                  if (!checkDate || !checkStart || !checkEnd) return;
                  setHasSearched(true);
                }}
              >
                <SearchIcon size={16} /> Check
              </Button>
            </div>
          </div>

          {hasSearched && (
            <div className="mt-6 space-y-3 animate-fade-in">
              <p className="text-sm font-medium text-gray-600">
                Results for <strong>{formatDate(checkDate)}</strong>, {formatTime(checkStart)} - {formatTime(checkEnd)}:
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map(({ room, available, conflicts }) => (
                  <div
                    key={room.id}
                    className={`rounded-xl border-2 p-4 ${available ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{room.roomNumber}</h4>
                        <p className="text-xs text-gray-500">{room.building} · Floor {room.floor}</p>
                      </div>
                      <Badge variant={available ? 'success' : 'error'}>
                        {available ? <><Check size={12} /> Available</> : <><X size={12} /> Booked</>}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <Users size={14} /> Capacity: {room.capacity}
                    </div>
                    {!available && conflicts.length > 0 && (
                      <div className="mt-2 text-xs text-red-600">
                        {conflicts.map((c) => (
                          <p key={c.id}>{formatTime(c.startTime)}-{formatTime(c.endTime)}: {c.purpose}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Classroom list */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by room number or building..." />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCSV}><Download size={16} /> CSV</Button>
          {isAdmin && <Button size="sm" onClick={openAddRoom}><Plus size={16} /> Add Classroom</Button>}
        </div>
      </div>

      <Card>
        <CardHeader title="All Classrooms" subtitle={`${filteredRooms.length} room(s)`} />
        {filteredRooms.length === 0 ? (
          <EmptyState icon={<DoorOpen size={32} />} title="No classrooms found" message={isAdmin ? "Click 'Add Classroom' to create one" : 'No rooms available'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3">Building</th>
                  <th className="px-5 py-3">Floor</th>
                  <th className="px-5 py-3">Capacity</th>
                  <th className="px-5 py-3">Schedules</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((r) => {
                  const scheds = data.classroomSchedules.filter((s) => s.classroomId === r.id);
                  return (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{r.roomNumber}</td>
                      <td className="px-5 py-3 text-gray-600">{r.building}</td>
                      <td className="px-5 py-3 text-gray-600">{r.floor}</td>
                      <td className="px-5 py-3 text-gray-600">{r.capacity}</td>
                      <td className="px-5 py-3">
                        <Badge variant={scheds.length > 0 ? 'info' : 'neutral'}>{scheds.length} schedule(s)</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setScheduleModal(r);
                              setSchedForm({ date: '', startTime: '', endTime: '', purpose: '', bookedBy: currentUser.name });
                              setSchedErrors({});
                            }}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                            title="View schedules / Add"
                          >
                            <Calendar size={18} />
                          </button>
                          {isAdmin && (
                            <>
                              <button onClick={() => openEditRoom(r)} className="rounded-lg p-1.5 text-navy-600 hover:bg-navy-50" title="Edit">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => setDeleteRoomId(r.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" title="Delete">
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
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

      {/* Add/Edit room modal */}
      <Modal
        open={showRoomForm}
        title={editRoom ? 'Edit Classroom' : 'Add Classroom'}
        onClose={() => setShowRoomForm(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowRoomForm(false)}>Cancel</Button>
            <Button onClick={submitRoom}>{editRoom ? 'Update' : 'Add'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Room Number" required error={roomErrors.roomNumber}>
            <Input value={roomForm.roomNumber} onChange={(e) => setRoomForm((f) => ({ ...f, roomNumber: e.target.value }))} placeholder="e.g. A-101" />
          </Field>
          <Field label="Building" required error={roomErrors.building}>
            <Input value={roomForm.building} onChange={(e) => setRoomForm((f) => ({ ...f, building: e.target.value }))} placeholder="e.g. Block A" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Floor" required>
              <Input type="number" min={0} value={roomForm.floor} onChange={(e) => setRoomForm((f) => ({ ...f, floor: Number(e.target.value) }))} />
            </Field>
            <Field label="Capacity" required error={roomErrors.capacity}>
              <Input type="number" min={1} value={roomForm.capacity} onChange={(e) => setRoomForm((f) => ({ ...f, capacity: Number(e.target.value) }))} />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Schedule modal */}
      <Modal
        open={!!scheduleModal}
        title={`Schedules — ${scheduleModal?.roomNumber || ''}`}
        onClose={() => setScheduleModal(null)}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setScheduleModal(null)}>Close</Button>
            <Button onClick={submitSchedule}><Plus size={16} /> Add Schedule</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Existing schedules */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">Existing Schedules</p>
            {data.classroomSchedules.filter((s) => s.classroomId === scheduleModal?.id).length === 0 ? (
              <p className="text-sm text-gray-400">No schedules for this room</p>
            ) : (
              <div className="space-y-2">
                {data.classroomSchedules
                  .filter((s) => s.classroomId === scheduleModal?.id)
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{s.purpose}</p>
                        <p className="text-xs text-gray-500">{formatDate(s.date)} · {formatTime(s.startTime)} - {formatTime(s.endTime)} · {s.bookedBy}</p>
                      </div>
                      <button onClick={() => setDeleteScheduleId(s.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Add schedule form */}
          <div className="border-t border-gray-100 pt-4">
            <p className="mb-3 text-sm font-medium text-gray-600">Add New Schedule</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Date" required error={schedErrors.date}>
                <Input type="date" value={schedForm.date} onChange={(e) => setSchedForm((f) => ({ ...f, date: e.target.value }))} />
              </Field>
              <div></div>
              <Field label="Start Time" required error={schedErrors.startTime}>
                <Input type="time" value={schedForm.startTime} onChange={(e) => setSchedForm((f) => ({ ...f, startTime: e.target.value }))} />
              </Field>
              <Field label="End Time" required error={schedErrors.endTime}>
                <Input type="time" value={schedForm.endTime} onChange={(e) => setSchedForm((f) => ({ ...f, endTime: e.target.value }))} />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Purpose" required error={schedErrors.purpose}>
                <Input value={schedForm.purpose} onChange={(e) => setSchedForm((f) => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Data Structures Lecture" />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Booked By" required error={schedErrors.bookedBy}>
                <Input value={schedForm.bookedBy} onChange={(e) => setSchedForm((f) => ({ ...f, bookedBy: e.target.value }))} placeholder="e.g. Dr. Anitha Rao" />
              </Field>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteRoomId}
        title="Delete Classroom"
        message="This will delete the classroom and all its schedules. Continue?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (deleteRoomId) deleteClassroom(deleteRoomId); setDeleteRoomId(null); }}
        onCancel={() => setDeleteRoomId(null)}
      />
      <ConfirmDialog
        open={!!deleteScheduleId}
        title="Remove Schedule"
        message="Remove this schedule entry?"
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => { if (deleteScheduleId) deleteSchedule(deleteScheduleId); setDeleteScheduleId(null); }}
        onCancel={() => setDeleteScheduleId(null)}
      />
    </div>
  );
}
