import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

const CommentBox = ({ actor, postId, comments, currentUser, onCommentAdded, onUserProfileView }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentAuthors, setCommentAuthors] = useState({});

  useEffect(() => {
    loadCommentAuthors();
  }, [comments]);

  const loadCommentAuthors = async () => {
    const authors = {};
    for (const comment of comments) {
      if (!authors[comment.author.toString()]) {
        try {
          const author = await actor.get_user(comment.author);
          if (author[0]) {
            authors[comment.author.toString()] = author[0];
          }
        } catch (error) {
          console.error('Error loading comment author:', error);
        }
      }
    }
    setCommentAuthors(authors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || loading) return;

    setLoading(true);
    try {
      const result = await actor.comment_post(postId, newComment);
      if (result.Ok) {
        setNewComment('');
        if (onCommentAdded) onCommentAdded();
      } else {
        alert(result.Err);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Existing Comments */}
      <div className="space-y-4 mb-6">
        {comments.map((comment) => {
          const author = commentAuthors[comment.author.toString()];
          return (
            <div key={comment.comment_id} className="flex space-x-3">
              <button
                onClick={() => onUserProfileView(comment.author)}
                className="flex-shrink-0"
              >
                <img
                  src={author?.profile_image || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200'}
                  alt={author?.name || 'User'}
                  className="h-8 w-8 rounded-full object-cover border border-gray-200 hover:border-blue-300 transition-colors"
                />
              </button>
              <div className="flex-1 bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => onUserProfileView(comment.author)}
                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm"
                  >
                    {author?.name || 'Unknown User'}
                  </button>
                  <time className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </time>
                </div>
                <p className="text-gray-700 text-sm">{comment.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <img
          src={currentUser.profile_image}
          alt={currentUser.name}
          className="h-8 w-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
        />
        <div className="flex-1 flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentBox;