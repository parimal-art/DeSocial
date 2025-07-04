import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Link, Users } from 'lucide-react';
import FollowButton from './FollowButton';
import PostCard from './PostCard';

const UserProfile = ({ actor, userId, currentUser, onUserProfileView }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId, actor]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const userData = await actor.get_user(userId);
      if (userData[0]) {
        setUser(userData[0]);
        
        // Load user's posts
        const userPosts = await actor.get_user_posts(userId);
        setPosts(userPosts);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm animate-pulse">
            {/* Cover skeleton */}
            <div className="h-64 bg-gray-200 rounded-t-2xl"></div>
            
            {/* Profile skeleton */}
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-16">
                <div className="h-32 w-32 bg-gray-200 rounded-full border-4 border-white"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
              </div>
              
              <div className="mt-4">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = user.user_principal.toString() === currentUser.user_principal.toString();

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            <img
              src={user.cover_image}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-16">
              <img
                src={user.profile_image}
                alt={user.name}
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              
              {!isOwnProfile && (
                <div className="mb-4">
                  <FollowButton
                    actor={actor}
                    targetUserId={user.principal}
                    size="lg"
                  />
                </div>
              )}
            </div>

            <div className="mt-4">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 text-lg">@{user.user_principal.toString().slice(-8)}</p>
              
              {user.bio && (
                <p className="text-gray-700 mt-4 text-lg leading-relaxed">{user.bio}</p>
              )}

              <div className="flex items-center mt-4 text-gray-500">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>

              {/* Stats */}
              <div className="flex space-x-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                  <div className="text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.followers.length}</div>
                  <div className="text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.following.length}</div>
                  <div className="text-gray-500">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Posts ({posts.length})
              </button>
            </div>
          </div>

          {/* Posts Content */}
          <div className="p-6">
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.post_id}
                    post={post}
                    actor={actor}
                    currentUser={currentUser}
                    onUserProfileView={onUserProfileView}
                    onPostUpdate={loadUserProfile}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isOwnProfile ? "You haven't posted anything yet" : "No posts yet"}
                </h3>
                <p className="text-gray-500">
                  {isOwnProfile 
                    ? "Share your first post to get started!"
                    : "This user hasn't shared any posts yet."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;