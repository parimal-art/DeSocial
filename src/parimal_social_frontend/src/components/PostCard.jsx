import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from 'lucide-react';
import CommentBox from './CommentBox';
import FollowButton from './FollowButton';

const PostCard = ({ post, actor, currentUser, onUserProfileView, onPostUpdate }) => {
  const [postAuthor, setPostAuthor] = useState(null);
  const [originalAuthor, setOriginalAuthor] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPostAuthor();
    setIsLiked(post.likes.some(p => p.toString() === currentUser.user_principal.toString()));
    setLikesCount(post.likes.length);
  }, [post, currentUser]);

  const loadPostAuthor = async () => {
    try {
      const author = await actor.get_user(post.author);
      if (author[0]) {
        setPostAuthor(author[0]);
      }

      // If this is a repost, load the original author
      if (post.original_post_id && post.reposted_by) {
        const originalPost = await actor.get_all_posts();
        const original = originalPost.find(p => p.post_id === post.original_post_id[0]);
        if (original) {
          const origAuthor = await actor.get_user(original.author);
          if (origAuthor[0]) {
            setOriginalAuthor(origAuthor[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading post author:', error);
    }
  };

  const handleLike = async () => {
    if (processing) return;
    
    setProcessing(true);
    try {
      const result = await actor.like_post(post.post_id);
      if (result.Ok) {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
        if (onPostUpdate) onPostUpdate();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRepost = async () => {
    if (processing) return;
    
    setProcessing(true);
    try {
      const result = await actor.repost_post(post.post_id);
      if (result.Ok) {
        if (onPostUpdate) onPostUpdate();
      } else {
        alert(result.Err);
      }
    } catch (error) {
      console.error('Error reposting:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!postAuthor) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div className="ml-3">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Repost indicator */}
      {post.reposted_by && originalAuthor && (
        <div className="px-6 pt-4 pb-2 border-b border-gray-50">
          <div className="flex items-center text-sm text-gray-500">
            <Repeat2 className="h-4 w-4 mr-2" />
            <span>
              Reposted by{' '}
              <button
                onClick={() => onUserProfileView(post.reposted_by)}
                className="font-medium text-blue-600 hover:underline"
              >
                {postAuthor.name}
              </button>
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center flex-1">
            <button
              onClick={() => onUserProfileView(originalAuthor ? originalAuthor.principal : postAuthor.principal)}
              className="flex-shrink-0"
            >
              <img
                src={originalAuthor ? originalAuthor.profile_image : postAuthor.profile_image}
                alt={originalAuthor ? originalAuthor.name : postAuthor.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-gray-100 hover:border-blue-300 transition-colors"
              />
            </button>
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <button
                  onClick={() => onUserProfileView(originalAuthor ? originalAuthor.principal : postAuthor.principal)}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {originalAuthor ? originalAuthor.name : postAuthor.name}
                </button>
                <span className="ml-2 text-sm text-gray-500">
                  @{(originalAuthor ? originalAuthor.user_principal : postAuthor.user_principal).toString().slice(-8)}
                </span>
              </div>
              <div className="flex items-center mt-1">
                <time className="text-sm text-gray-500">
                  {formatDate(post.created_at)}
                </time>
                {(originalAuthor ? originalAuthor.user_principal : postAuthor.user_principal).toString() !== currentUser.user_principal.toString() && (
                  <div className="ml-3">
                    <FollowButton
                      actor={actor}
                      targetUserId={originalAuthor ? originalAuthor.principal : postAuthor.principal}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          {post.content && (
            <p className="text-gray-900 text-base leading-relaxed mb-4">{post.content}</p>
          )}
          
          {post.image && post.image[0] && (
            <div className="rounded-xl overflow-hidden mb-4">
              <img
                src={post.image[0]}
                alt="Post content"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
          
          {post.video && post.video[0] && (
            <div className="rounded-xl overflow-hidden mb-4">
              <video
                src={post.video[0]}
                controls
                className="w-full h-auto max-h-96"
              />
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <button
            onClick={handleLike}
            disabled={processing}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              isLiked
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
            } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{post.comments.length}</span>
          </button>

          <button
            onClick={handleRepost}
            disabled={processing}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-500 hover:text-green-600 hover:bg-green-50 ${
              processing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Repeat2 className="h-5 w-5" />
            <span className="text-sm font-medium">Repost</span>
          </button>

          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
            <Share className="h-5 w-5" />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <CommentBox
              actor={actor}
              postId={post.post_id}
              comments={post.comments}
              currentUser={currentUser}
              onCommentAdded={onPostUpdate}
              onUserProfileView={onUserProfileView}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;