import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket, onSocketReady } from '../../../lib/socket.js';
import {
  getNotificationsService,
  getUnreadCountService,
  markAsReadService,
  markAllAsReadService,
  deleteNotificationService,
} from '../services/notificationService.js';

const BellIcon = ({ hasUnread }) => (
  <div className="relative">
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {hasUnread > 0 && (
      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
        {hasUnread > 9 ? '9+' : hasUnread}
      </span>
    )}
  </div>
);

const NOTIFICATION_ICONS = {
  assignment_graded: { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: '✓' },
  new_submission: { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: '📝' },
  direct_message: { bg: 'bg-sky-100', text: 'text-sky-600', icon: '💬' },
  announcement: { bg: 'bg-amber-100', text: 'text-amber-600', icon: '📢' },
  default: { bg: 'bg-gray-100', text: 'text-gray-600', icon: '🔔' },
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const getDropdownStyle = () => {
    if (window.innerWidth >= 1024) {
      return {
        position: 'absolute',
        width: 320,
        left: 0,
        right: 'auto',
        transform: 'none',
      };
    }
    return {
      position: 'fixed',
      top: 56,
      left: 8,
      right: 8,
      width: 'auto',
      transform: 'none',
    };
  };

  useEffect(() => {
    loadUnreadCount();
    onSocketReady((socket) => {
      socket.on('new_notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    });
    return () => {
      const socket = getSocket();
      socket?.off('new_notification');
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCountService();
      setUnreadCount(count);
    } catch (err) {
      console.error(err);
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotificationsService();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open) loadNotifications();
  };

  const handleClick = async (notification) => {
    if (!notification.is_read) {
      await markAsReadService(notification.id);
      setNotifications((prev) =>
        prev.map((n) => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsReadService();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotificationService(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      >
        <BellIcon hasUnread={unreadCount} />
      </button>

      {open && (
        <div
          className="z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
          style={getDropdownStyle()}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none">
                  <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={3} opacity={0.25} />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
                </svg>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm font-medium text-gray-900">No notifications</p>
                <p className="mt-1 text-xs text-gray-500">You&#x2019;re all caught up!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((n) => {
                  const style = NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.default;
                  return (
                    <li
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-indigo-50/50' : ''}`}
                    >
                      <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm ${style.bg} ${style.text}`}>
                        {style.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">{formatTime(n.created_at)}</p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1">
                        {!n.is_read && (
                          <span className="h-2 w-2 rounded-full bg-indigo-600" />
                        )}
                        <button
                          onClick={(e) => handleDelete(e, n.id)}
                          className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;