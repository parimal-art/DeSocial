// CommentBox.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

const CommentBox = ({
  actor,
  postId,
  comments,
  currentUser,
  onCommentAdded,
  onUserProfileView,
}) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentAuthors, setCommentAuthors] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    loadCommentAuthors();
  }, [comments]);

  const loadCommentAuthors = async () => {
    const authors = {};
    for (const c of comments) {
      const key = c.author.toString();
      if (!authors[key]) {
        try {
          const res = await actor.get_user(c.author);
          if (res[0]) authors[key] = res[0];
        } catch (e) {
          console.error('Error loading comment author:', e);
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
      const content = newComment.trim();
      const result = await actor.comment_post(postId, content);

      // optimistic comment
      const optimistic = {
        comment_id: Date.now().toString(),
        content,
        author: currentUser.user_principal,
        created_at: BigInt(Date.now() * 1_000_000), // ms -> ns
      };

      setNewComment('');
      onCommentAdded && onCommentAdded(optimistic, !!result?.Ok);
      // keep focus ready for next comment
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts) => {
    const d = new Date(Number(ts) / 1_000_000);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* ✅ Input FIRST */}
      <form onSubmit={handleSubmit} className="flex space-x-3 mb-6">
        <img
          src={currentUser.profile_image || '/no-profile.jpg'}
          alt={currentUser.name || 'You'}
          className="h-8 w-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
        />
        <div className="flex-1 flex space-x-2">
          <input
            ref={inputRef}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            aria-label="Post comment"
            title="Post comment"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Comments list BELOW */}
      <div className="space-y-4">
        {comments.map((c) => {
          const author = commentAuthors[c.author.toString()];
          return (
            <div key={c.comment_id} className="flex space-x-3">
              <button onClick={() => onUserProfileView?.(c.author)} className="flex-shrink-0">
                <img
                  src={author?.profile_image || '/no-profile.jpg'}
                  alt={author?.name || 'User'}
                  className="h-8 w-8 rounded-full object-cover border border-gray-200 hover:border-blue-300 transition-colors"
                />
              </button>
              <div className="flex-1 bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => onUserProfileView?.(c.author)}
                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm"
                  >
                    {author?.name || 'Unknown User'}
                  </button>
                  <time className="text-xs text-gray-500">{formatDate(c.created_at)}</time>
                </div>
                <p className="text-gray-700 text-sm">{c.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommentBox;
