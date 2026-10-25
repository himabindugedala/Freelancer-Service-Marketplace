import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, ExternalLink, Clock } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Notifications Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated on bids, order milestones, reviews, and contract activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} leftIcon={<Check className="w-4 h-4" />}>
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You're all caught up! New proposal alerts, order deliverables, and messages will appear here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && markAsRead(notif._id)}
              className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs ${
                  notif.isRead
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-indigo-600 text-white shadow-indigo-200'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`text-sm tracking-tight ${notif.isRead ? 'font-semibold text-slate-800' : 'font-extrabold text-indigo-950'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-2">{notif.message}</p>

                {notif.link && (
                  <Link
                    to={notif.link}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {!notif.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
