import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { UserPlus, UserMinus } from 'lucide-react';

const FollowButton = ({ actor, targetUserId, size = 'md' }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!targetUserId) return;
    checkFollowStatus();
  }, [targetUserId]);

  const checkFollowStatus = async () => {
    try {
      const normalizedPrincipal = typeof targetUserId === 'string'
        ? Principal.fromText(targetUserId)
        : targetUserId?._isPrincipal
          ? targetUserId
          : Principal.fromText(targetUserId.toString());
  
      const following = await actor.is_following(normalizedPrincipal);
      setIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };  

  const handleFollow = async () => {
    if (loading || !targetUserId) return;
    setLoading(true);
  
    try {
      const principal = typeof targetUserId === 'string'
        ? Principal.fromText(targetUserId)
        : targetUserId?._isPrincipal
          ? targetUserId
          : Principal.fromText(targetUserId.toString());
  
      const result = isFollowing
        ? await actor.unfollow_user(principal)
        : await actor.follow_user(principal);
  
      console.log('👥 Follow/unfollow result:', result);
      if (result.Ok) {
        setIsFollowing(!isFollowing);
      } else {
        alert(result.Err || "Error occurred");
      }
    } catch (error) {
      console.error('❌ Error updating follow status:', error);
    } finally {
      setLoading(false);
    }
  };  

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`inline-flex items-center ${sizeClasses[size]} font-medium rounded-lg transition-all duration-200 ${
        isFollowing
          ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className={`${iconSizes[size]} animate-spin rounded-full border-2 border-current border-t-transparent mr-2`}></div>
      ) : (
        <>
          {isFollowing ? (
            <UserMinus className={`${iconSizes[size]} mr-2`} />
          ) : (
            <UserPlus className={`${iconSizes[size]} mr-2`} />
          )}
        </>
      )}
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
