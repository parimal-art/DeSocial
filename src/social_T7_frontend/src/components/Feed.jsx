import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import { RefreshCw } from 'lucide-react';

const Feed = ({ actor, user, onUserProfileView }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [actor]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const feedPosts = await actor.get_feed();
      setPosts(feedPosts);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="ml-3">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Feed</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.post_id}
              post={post}
              actor={actor}
              currentUser={user}
              onUserProfileView={onUserProfileView}
              onPostUpdate={loadFeed}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-6">
              Start following users to see their posts in your feed, or check out the explore page to discover new content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;