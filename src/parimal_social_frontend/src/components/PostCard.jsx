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

  useEffect(() => {
    loadPostAuthor();
  }, [post.post_id]); // Only re-run when post ID changes, not on every currentUser change

  const loadPostAuthor = async () => {
    try {
      const author = await actor.get_user(post.author);
      if (author[0]) {
        setPostAuthor(author[0]);
      }

      // If this is a repost, load the original author
      if (post.original_post_id && post.reposted_by) {
        const originalPost = await actor.get_all_posts();
        const original = originalPost.find(
          (p) => p.post_id === post.original_post_id[0]
        );
        if (original) {
          const origAuthor = await actor.get_user(original.author);
          if (origAuthor[0]) {
            setOriginalAuthor(origAuthor[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error loading post author:", error);
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
      console.error("Error reposting:", error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
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
              onClick={() =>
                onUserProfileView(
                  originalAuthor
                    ? originalAuthor.principal
                    : postAuthor.principal
                )
              }
              className="flex-shrink-0"
            >
              <img
                src={
                  ((originalAuthor
                    ? originalAuthor.profile_image
                    : postAuthor.profile_image) === "" )?("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"):(originalAuthor
                    ? originalAuthor.profile_image
                    : postAuthor.profile_image )
                }
                alt={originalAuthor ? originalAuthor.name : postAuthor.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-gray-100 hover:border-blue-300 transition-colors"
              />
            </button>
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <button
                  onClick={() =>
                    onUserProfileView(
                      originalAuthor
                        ? originalAuthor.user_principal
                        : postAuthor.user_principal
                    )
                  }
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {originalAuthor ? originalAuthor.name : postAuthor.name}
                </button>
                <span className="ml-2 text-sm text-gray-500">
                  @
                  {(originalAuthor
                    ? originalAuthor.user_principal
                    : postAuthor.user_principal
                  )
                    .toString()
                    .slice(-8)}
                </span>
              </div>
              <div className="flex items-center mt-1">
                <time className="text-sm text-gray-500">
                  {formatDate(post.created_at)}
                </time>
                {(originalAuthor
                  ? originalAuthor.user_principal
                  : postAuthor.user_principal
                ).toString() !== currentUser.user_principal.toString() && (
                  <div className="ml-3">
                    <FollowButton
                      actor={actor}
                      targetUserId={
                        originalAuthor
                          ? originalAuthor.user_principal
                          : postAuthor.user_principal
                      }
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="relative">
            {(originalAuthor
              ? originalAuthor.user_principal
              : postAuthor.user_principal
            ).toString() === currentUser.user_principal.toString() && (
              <>
                <button
                  onClick={() => setShowOptions((prev) => !prev)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                {showOptions && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={() => {
                        setShowOptions(false);
                        // TODO: CREATE FUNCTION IN BACKEND AND IMPLEMENT IT HERE

                        console.log("Edit post", post.post_id);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      Edit Post
                    </button>
                    <button
                      onClick={() => {
                        setShowOptions(false);
                        // TODO: CREATE FUNCTION IN BACKEND AND IMPLEMENT IT HERE

                        console.log("Delete post", post.post_id);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          {post.content && (
            <p className="text-gray-900 text-base leading-relaxed mb-4">
              {post.content}
            </p>
          )}

          {post.image && post.image[0] && (
            <div className="rounded-xl overflow-hidden mb-4">
              <img
                src={post.image[0]}
                alt="Post content"
                className="w-full h-auto object-contain"
                style={{ maxHeight: "96vh" }}
                onLoad={(e) => {
                  // If image is wider than tall, limit width to 100%
                  // If image is taller than wide, limit height to a reasonable value
                  const img = e.target;
                  if (img.naturalWidth > img.naturalHeight) {
                    img.style.maxHeight = "none";
                  } else if (img.naturalHeight > img.naturalWidth * 2) {
                    img.style.maxHeight = "96vh";
                  }
                }}
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
          <LikeButton
            post={post}
            actor={actor}
            currentUser={currentUser}
            onPostUpdate={onPostUpdate}
          />

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
              processing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Repeat2 className="h-5 w-5" />
            <span className="text-sm font-medium">Repost</span>
          </button>

          {/* <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
            <Share className="h-5 w-5" />
          </button> */}
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

// Custom comparison function to prevent unnecessary re-renders
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.post.post_id === nextProps.post.post_id &&
    prevProps.post.likes.length === nextProps.post.likes.length &&
    prevProps.post.comments.length === nextProps.post.comments.length &&
    prevProps.currentUser.user_principal.toString() ===
      nextProps.currentUser.user_principal.toString()
  );
};

export default memo(PostCard, areEqual);
