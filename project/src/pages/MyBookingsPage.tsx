import { useApp } from '@/store/AppContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, EmptyState } from '@/components/ui/Form';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useState } from 'react';
import { formatDate, formatTime, formatDateTime } from '@/lib/utils';
import { BookMarked, X, Calendar, Clock, MapPin } from 'lucide-react';

export function MyBookingsPage() {
  const { currentUser, data, cancelBooking, setPage } = useApp();
  const [cancelId, setCancelId] = useState<string | null>(null);

  if (!currentUser) return null;

  const myBookings = data.bookings.filter((b) => b.studentId === currentUser.id);
  const slotsMap = new Map(data.greenCardSlots.map((s) => [s.id, s]));

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader title="My Bookings" subtitle={`${myBookings.length} active booking(s)`} />
        {myBookings.length === 0 ? (
          <EmptyState
            icon={<BookMarked size={32} />}
            title="No bookings yet"
            message="Book a Green Card slot to see it here"
          />
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {myBookings.map((b) => {
              const slot = slotsMap.get(b.slotId);
              if (!slot) return null;
              return (
                <div key={b.id} className="rounded-xl border border-gray-200 p-4 transition hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-navy-900">{slot.title}</h4>
                      <Badge variant="success">Booked</Badge>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2"><Calendar size={16} className="text-navy-400" /> {formatDate(slot.date)}</p>
                    <p className="flex items-center gap-2"><Clock size={16} className="text-navy-400" /> {formatTime(slot.startTime)} - {formatTime(slot.endTime)}</p>
                    <p className="flex items-center gap-2"><MapPin size={16} className="text-navy-400" /> {slot.bookedIds.length}/{slot.capacity} seats booked</p>
                  </div>
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400">Booked on {formatDateTime(b.bookedAt)}</p>
                    <Button variant="danger" size="sm" className="mt-2 w-full" onClick={() => setCancelId(slot.id)}>
                      <X size={16} /> Cancel Booking
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {myBookings.length === 0 && (
        <div className="text-center">
          <Button onClick={() => setPage('green-card')}><BookMarked size={16} /> Browse Green Card Slots</Button>
        </div>
      )}

      <ConfirmDialog
        open={!!cancelId}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? The seat will become available again."
        confirmLabel="Yes, Cancel"
        variant="danger"
        onConfirm={() => { if (cancelId) cancelBooking(cancelId); setCancelId(null); }}
        onCancel={() => setCancelId(null)}
      />
    </div>
  );
}
