import React from 'react';
import { Heart, MessageCircle, UserPlus, Repeat2, Check } from 'lucide-react';

const Notifications = ({ actor, notifications, onNotificationUpdate, onUserProfileView }) => {
  const handleMarkAsRead = async (notificationId) => {
    try {
      await actor.mark_notification_read(notificationId);
      if (onNotificationUpdate) onNotificationUpdate();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'Comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'Follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'Repost':
        return <Repeat2 className="h-5 w-5 text-purple-500" />;
      default:
        return <Heart className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">Stay updated with your latest interactions</p>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200 hover:shadow-md ${
                notification.read 
                  ? 'border-gray-100' 
                  : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.notification_type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900">
                        <button
                          onClick={() => onUserProfileView(notification.sender)}
                          className="font-semibold hover:text-blue-600 transition-colors"
                        >
                          User
                        </button>
                        {' '}{notification.message}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>

                    {/* Mark as read button */}
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.notification_id)}
                        className="ml-4 p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5-5-5h5v-6h0V4a1 1 0 011-1h8a1 1 0 011 1v7h0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500">
              When someone likes, comments, or follows you, you'll see it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;