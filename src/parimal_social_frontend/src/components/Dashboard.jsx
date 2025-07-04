import React, { useState, useEffect } from 'react';
import { 
  Home, 
  PlusCircle, 
  User, 
  Search, 
  Bell, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import Feed from './Feed';
import CreatePost from './CreatePost';
import EditProfile from './EditProfile';
import ExploreUsers from './ExploreUsers';
import Notifications from './Notifications';
import FollowersFollowing from './FollowersFollowing';
import UserProfile from './UserProfile';

const Dashboard = ({ actor, user, principal, onLogout, onUserUpdate }) => {
  const [currentView, setCurrentView] = useState('feed');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [actor]);

  const loadNotifications = async () => {
    try {
      const notifs = await actor.get_notifications();
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
    setSelectedUserId(null);
  };

  const handleUserProfileView = (userId) => {
    setSelectedUserId(userId);
    setCurrentView('userProfile');
    setSidebarOpen(false);
  };

  const sidebarItems = [
    { id: 'feed', label: 'Home', icon: Home },
    { id: 'createPost', label: 'Create Post', icon: PlusCircle },
    { id: 'editProfile', label: 'Edit Profile', icon: User },
    { id: 'explore', label: 'Explore Users', icon: Search },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'following', label: 'Followers/Following', icon: Users },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'feed':
        return <Feed actor={actor} user={user} onUserProfileView={handleUserProfileView} />;
      case 'createPost':
        return <CreatePost actor={actor} onPostCreated={() => handleViewChange('feed')} />;
      case 'editProfile':
        return <EditProfile actor={actor} user={user} onUserUpdate={onUserUpdate} />;
      case 'explore':
        return <ExploreUsers actor={actor} currentUser={user} onUserProfileView={handleUserProfileView} />;
      case 'notifications':
        return <Notifications actor={actor} notifications={notifications} onNotificationUpdate={loadNotifications} onUserProfileView={handleUserProfileView} />;
      case 'following':
        return <FollowersFollowing actor={actor} user={user} onUserProfileView={handleUserProfileView} />;
      case 'userProfile':
        return <UserProfile actor={actor} userId={selectedUserId} currentUser={user} onUserProfileView={handleUserProfileView} />;
      default:
        return <Feed actor={actor} user={user} onUserProfileView={handleUserProfileView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="ml-3 text-xl font-bold text-gray-900">DeSocial</h1>
        </div>
        <div className="flex items-center space-x-2">
          <img
            src={user.profile_image}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:shadow-none border-r transition-transform duration-300 ease-in-out`}>
          {/* Desktop Header */}
          <div className="hidden lg:block p-6 border-b">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">DeSocial</h1>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6">
            <div className="flex items-center">
              <img
                src={user.profile_image}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">@{user.user_principal.toString().slice(-8)}</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-4 text-sm text-gray-500">
              <span>{user.following.length} Following</span>
              <span>{user.followers.length} Followers</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  className={`w-full flex items-center px-3 py-3 rounded-xl mb-1 transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-white">
            <button
              onClick={onLogout}
              className="w-full flex items-center px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;