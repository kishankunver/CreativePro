import React, { useState, useEffect } from 'react';
import { Bell, X, Check, User, Heart, MessageCircle, Trophy, Star } from 'lucide-react';
import { Notification } from '../types';
import { socialService } from '../services/social';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user && isOpen) {
      loadNotifications();
    }
  }, [user, isOpen, filter]);

  const loadNotifications = () => {
    if (!user) return;

    const allNotifications = socialService.getNotifications(user.id);
    const filteredNotifications = filter === 'unread' 
      ? allNotifications.filter(n => !n.isRead)
      : allNotifications;
    
    setNotifications(filteredNotifications);
    setUnreadCount(socialService.getUnreadNotificationCount(user.id));
  };

  const markAsRead = (notificationId: string) => {
    if (!user) return;

    socialService.markNotificationAsRead(user.id, notificationId);
    loadNotifications();
  };

  const markAllAsRead = () => {
    if (!user) return;

    socialService.markAllNotificationsAsRead(user.id);
    loadNotifications();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'follow':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'idea_upvote':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'achievement':
        return <Trophy className="h-5 w-5 text-orange-500" />;
      case 'idea_featured':
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
      {/* Notification Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'all'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'unread'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={markAllAsRead}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.fromUser?.name && (
                              <Link 
                                to={`/profile/${notification.fromUserId}`}
                                className="font-medium text-indigo-600 hover:text-indigo-800"
                              >
                                {notification.fromUser.name}
                              </Link>
                            )}
                            {notification.fromUser?.name && ' '}
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {notification.actionUrl && (
                        <Link
                          to={notification.actionUrl}
                          onClick={() => {
                            markAsRead(notification.id);
                            onClose();
                          }}
                          className="inline-block mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="font-medium text-gray-800 mb-2">No notifications</h4>
              <p className="text-sm">
                {filter === 'unread' 
                  ? "You're all caught up!"
                  : "Notifications will appear here when you have activity"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;