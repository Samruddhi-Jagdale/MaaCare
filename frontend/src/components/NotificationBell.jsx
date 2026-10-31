// src/components/NotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Calendar, AlertCircle, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { t } = useLanguage();

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count');
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // quiet fail for unread count polling
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/notifications?limit=15');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/api/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err.message);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'appointment_scheduled':
      case 'appointment_rescheduled':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      case 'overdue_alert':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'checkup_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-pink-600" />;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2 rounded-full text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition focus:outline-none focus:ring-2 focus:ring-pink-400"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-pink-600 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-pink-100 z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-teal-50 border-b border-pink-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-pink-600" />
              <h3 className="font-semibold text-gray-800 text-sm">{t('notifications')}</h3>
              {unreadCount > 0 && (
                <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                {t('markAllRead')}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 text-center text-gray-400 text-xs">{t('loading')}</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">{t('noNotifications')}</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`p-3.5 text-xs transition flex items-start space-x-3 ${
                    item.isRead ? 'bg-white hover:bg-gray-50' : 'bg-pink-50/50 hover:bg-pink-50'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-full bg-white border border-gray-100 shadow-sm shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold ${item.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 leading-relaxed line-clamp-2">{item.message}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      {!item.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(item._id, e)}
                          className="text-teal-600 hover:text-teal-800 font-medium"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
