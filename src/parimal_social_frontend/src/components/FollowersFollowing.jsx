import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserPlus } from 'lucide-react';
import FollowButton from './FollowButton';

const FollowersFollowing = ({ actor, user, onUserProfileView }) => {
  const [activeTab, setActiveTab] = useState('followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersData, setFollowersData] = useState([]);
  const [followingData, setFollowingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowData();
  }, [actor, user]);

  const loadFollowData = async () => {
    try {
      setLoading(true);
      
      // Get followers and following lists
      const [followersPrincipals, followingPrincipals] = await Promise.all([
        actor.get_followers(user.principal),
        actor.get_following(user.principal)
      ]);

      setFollowers(followersPrincipals);
      setFollowing(followingPrincipals);

      // Load user data for followers
      const followersUserData = await Promise.all(
        followersPrincipals.map(async (principal) => {
          try {
            const userData = await actor.get_user(principal);
            return userData[0];
          } catch (error) {
            console.error('Error loading follower data:', error);
            return null;
          }
        })
      );

      // Load user data for following
      const followingUserData = await Promise.all(
        followingPrincipals.map(async (principal) => {
          try {
            const userData = await actor.get_user(principal);
            return userData[0];
          } catch (error) {
            console.error('Error loading following data:', error);
            return null;
          }
        })
      );

      setFollowersData(followersUserData.filter(user => user !== null));
      setFollowingData(followingUserData.filter(user => user !== null));
    } catch (error) {
      console.error('Error loading follow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const UserCard = ({ userData }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onUserProfileView(userData.principal)}
          className="flex-shrink-0"
        >
          <img
            src={userData.profile_image}
            alt={userData.name}
            className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 hover:border-blue-300 transition-colors"
          />
        </button>
        
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onUserProfileView(userData.principal)}
            className="text-left"
          >
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {userData.name}
            </h3>
            <p className="text-gray-500 text-sm">
              @{userData.user_principal.toString().slice(-8)}
            </p>
            {userData.bio && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {userData.bio}
              </p>
            )}
          </button>
          
          <div className="flex space-x-4 mt-2 text-sm text-gray-500">
            <span>{userData.followers.length} followers</span>
            <span>{userData.following.length} following</span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <FollowButton
            actor={actor}
            targetUserId={userData.principal}
            size="md"
          />
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Users className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
        </div>
        
        {/* Stats */}
        <div className="flex space-x-6 text-sm">
          <div className="flex items-center">
            <UserCheck className="h-4 w-4 text-green-600 mr-1" />
            <span className="font-semibold text-gray-900">{followers.length}</span>
            <span className="text-gray-500 ml-1">Followers</span>
          </div>
          <div className="flex items-center">
            <UserPlus className="h-4 w-4 text-blue-600 mr-1" />
            <span className="font-semibold text-gray-900">{following.length}</span>
            <span className="text-gray-500 ml-1">Following</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('followers')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'followers'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Followers ({followers.length})
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'following'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Following ({following.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-4">
          {activeTab === 'followers' ? (
            followersData.length > 0 ? (
              followersData.map((userData) => (
                <UserCard key={userData.user_principal.toString()} userData={userData} />
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No followers yet</h3>
                <p className="text-gray-500">
                  Start sharing great content to attract followers!
                </p>
              </div>
            )
          ) : (
            followingData.length > 0 ? (
              followingData.map((userData) => (
                <UserCard key={userData.user_principal.toString()} userData={userData} />
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                <UserPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Not following anyone yet</h3>
                <p className="text-gray-500">
                  Discover interesting users in the explore section!
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default FollowersFollowing;