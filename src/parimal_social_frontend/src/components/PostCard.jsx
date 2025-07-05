import { MessageCircle, MoreHorizontal, Repeat2 } from "lucide-react";
import { memo, useEffect, useState } from "react";
import CommentBox from "./CommentBox";
import FollowButton from "./FollowButton";
import LikeButton from "./LikeButton";

const PostCard = ({
  post,
  actor,
  currentUser,
  onUserProfileView,
  onPostUpdate,
}) => {
  const [postAuthor, setPostAuthor] = useState(null);
  const [originalAuthor, setOriginalAuthor] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);

  useEffect(() => {
    loadPostAuthor();
  }, [post.post_id]);

  const loadPostAuthor = async () => {
    try {
      const author = await actor.get_user(post.author);
      if (author[0]) setPostAuthor(author[0]);

      if (post.original_post_id && post.reposted_by) {
        const originalPosts = await actor.get_all_posts();
        const original = originalPosts.find(
          (p) => p.post_id === post.original_post_id[0]
        );
        if (original) {
          const origAuthor = await actor.get_user(original.author);
          if (origAuthor[0]) setOriginalAuthor(origAuthor[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load author:", err);
    }
  };

  const handleRepost = async () => {
    if (processing) return;
    setProcessing(true);
    try {
      const result = await actor.repost_post(post.post_id);
      if (result.Ok) onPostUpdate?.();
      else alert(result.Err);
    } catch (err) {
      console.error("Repost failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = () => {
    setEditedContent(post.content);
    setIsEditing(true);
    setShowOptions(false);
  };

  const handleSaveEdit = async () => {
    try {
      const result = await actor.edit_post(
        post.post_id,
        editedContent,
        post.image?.[0] ? [post.image[0]] : [],
        post.video?.[0] ? [post.video[0]] : []
      );
      if (result.Ok) {
        setIsEditing(false);
        onPostUpdate?.();
      } else {
        alert(result.Err);
      }
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(post.content);
  };

  const handleDelete = async () => {
    setShowOptions(false);
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const result = await actor.delete_post(post.post_id);
      if (result.Ok) onPostUpdate?.();
      else alert(result.Err);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const formatDate = (ts) => {
    const date = new Date(Number(ts) / 1000000);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
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

  const isOwner =
    (originalAuthor?.user_principal ?? postAuthor.user_principal).toString() ===
    currentUser.user_principal.toString();

  const displayAuthor = originalAuthor ?? postAuthor;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {post.reposted_by && originalAuthor && (
        <div className="px-6 pt-4 pb-2 border-b border-gray-50">
          <div className="flex items-center text-sm text-gray-500">
            <Repeat2 className="h-4 w-4 mr-2" />
            <span>
              Reposted by{" "}
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
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center flex-1">
            <button
              onClick={() => onUserProfileView(displayAuthor.principal)}
              className="flex-shrink-0"
            >
              <img
                src={
                  displayAuthor.profile_image === ""
                    ? "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    : displayAuthor.profile_image
                }
                alt={displayAuthor.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-gray-100 hover:border-blue-300"
              />
            </button>
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <button
                  onClick={() =>
                    onUserProfileView(displayAuthor.user_principal)
                  }
                  className="font-semibold text-gray-900 hover:text-blue-600"
                >
                  {displayAuthor.name}
                </button>
                <span className="ml-2 text-sm text-gray-500">
                  @{displayAuthor.user_principal.toString().slice(-8)}
                </span>
              </div>
              <div className="flex items-center mt-1">
                <time className="text-sm text-gray-500">
                  {formatDate(post.created_at)}
                </time>
                {!isOwner && (
                  <div className="ml-3">
                    <FollowButton
                      actor={actor}
                      targetUserId={displayAuthor.user_principal}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowOptions((prev) => !prev)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {showOptions && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Edit Post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="mb-4">
          {isEditing ? (
            <>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 text-sm text-gray-800"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            post.content && (
              <p className="text-gray-900 text-base leading-relaxed mb-4">
                {post.content}
              </p>
            )
          )}

          {post.image?.[0] && (
            <div className="rounded-xl overflow-hidden mb-4">
              <img
                src={post.image[0]}
                alt="Post content"
                className="w-full h-auto object-contain"
                style={{ maxHeight: "96vh" }}
              />
            </div>
          )}
          {post.video?.[0] && (
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
          <LikeButton
            post={post}
            actor={actor}
            currentUser={currentUser}
            onPostUpdate={onPostUpdate}
          />
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{post.comments.length}</span>
          </button>
          <button
            onClick={handleRepost}
            disabled={processing}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-gray-500 hover:text-green-600 hover:bg-green-50 ${
              processing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Repeat2 className="h-5 w-5" />
            <span className="text-sm font-medium">Repost</span>
          </button>
        </div>

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

const areEqual = (prevProps, nextProps) =>
  prevProps.post.post_id === nextProps.post.post_id &&
  prevProps.post.likes.length === nextProps.post.likes.length &&
  prevProps.post.comments.length === nextProps.post.comments.length &&
  prevProps.currentUser.user_principal.toString() ===
    nextProps.currentUser.user_principal.toString();

export default memo(PostCard, areEqual);
