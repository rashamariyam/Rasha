import { useApp } from '@/store/AppContext';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button, EmptyState } from '@/components/ui/Form';
import { NotificationTypeIcon } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { Bell, CheckCheck, Circle } from 'lucide-react';

export function NotificationsPage() {
  const { currentUser, data, markNotificationRead, markAllRead } = useApp();

  if (!currentUser) return null;

  const myNotifications = data.notifications
    .filter((n) => n.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = myNotifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {unreadCount > 0 ? `${unreadCount} unread notification(s)` : 'All caught up!'}
        </p>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            <CheckCheck size={16} /> Mark All Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader title="Notifications" subtitle={`${myNotifications.length} total`} />
        {myNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={32} />}
            title="No notifications"
            message="You have no notifications yet"
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {myNotifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.read && markNotificationRead(n.id)}
                className={`flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-gray-50 ${!n.read ? 'bg-navy-50/50' : ''}`}
              >
                <div className="mt-0.5 shrink-0">
                  <NotificationTypeIcon type={n.type} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-800">{n.title}</h4>
                    {!n.read && <Circle size={8} className="fill-navy-600 text-navy-600" />}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-600">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDateTime(n.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
