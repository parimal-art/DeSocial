import React, { useState, useEffect } from 'react';
import { Search, Users as UsersIcon } from 'lucide-react';
import FollowButton from './FollowButton';

const ExploreUsers = ({ actor, currentUser, onUserProfileView }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [actor]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await actor.get_all_users();
      // Filter out current user
      const filteredUsers = allUsers.filter(
        user => user.user_principal.toString() !== currentUser.user_principal.toString()
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await actor.search_users(searchQuery);
      // Filter out current user
      const filteredResults = searchResults.filter(
        user => user.user_principal.toString() !== currentUser.user_principal.toString()
      );
      setUsers(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Explore Users</h1>
        </div>
        
        {/* Search */}
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search users by name or bio..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.user_principal.toString()} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                <img
                  src={user.cover_image}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Profile Content */}
              <div className="p-6 -mt-8 relative">
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => onUserProfileView(user.principal)}
                    className="flex items-start space-x-4 flex-1"
                  >
                    <img
                      src={user.profile_image}
                      alt={user.name}
                      className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-md hover:shadow-lg transition-shadow"
                    />
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                        {user.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">
                        @{user.user_principal.toString().slice(-8)}
                      </p>
                      {user.bio && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </button>
                  
                  <div className="ml-4">
                    <FollowButton
                      actor={actor}
                      targetUserId={user.principal}
                      size="md"
                    />
                  </div>
                </div>
                
                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex space-x-6 text-sm text-gray-500">
                    <span>
                      <span className="font-semibold text-gray-900">{user.followers.length}</span> Followers
                    </span>
                    <span>
                      <span className="font-semibold text-gray-900">{user.following.length}</span> Following
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-2xl p-12 shadow-sm text-center">
            <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No users found' : 'No users to explore'}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Be the first to create a profile and start connecting!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreUsers;