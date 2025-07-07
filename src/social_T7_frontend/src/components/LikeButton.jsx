import { Heart } from "lucide-react";
import { memo, useEffect, useState } from "react";

const LikeButton = ({
  post,
  actor,
  currentUser,
  onPostUpdate,
  size = "md",
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!post || !currentUser) return;
    setIsLiked(
      post.likes.some(
        (p) => p.toString() === currentUser.user_principal.toString()
      )
    );
    setLikesCount(post.likes.length);
  }, [post.post_id, post.likes.length, currentUser.user_principal]); // More specific dependencies

  const handleLike = async () => {
    if (processing) return;

    setProcessing(true);
    try {
      const result = await actor.like_post(post.post_id);
      if (result.Ok) {
        setIsLiked(!isLiked);
        setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
        // Don't call onPostUpdate for likes since we manage the state locally
        // This prevents unnecessary re-rendering of all posts
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setProcessing(false);
    }
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <button
      onClick={handleLike}
      disabled={processing}
      className={`flex items-center space-x-2 ${
        sizeClasses[size]
      } rounded-lg transition-all duration-200 ${
        isLiked
          ? "text-red-600 bg-red-50 hover:bg-red-100"
          : "text-gray-500 hover:text-red-600 hover:bg-red-50"
      } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Heart
        className={`${iconSizes[size]} ${isLiked ? "fill-current" : ""}`}
      />
      <span className="font-medium">{likesCount}</span>
    </button>
  );
};

// Custom comparison function to prevent unnecessary re-renders
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.post.post_id === nextProps.post.post_id &&
    prevProps.post.likes.length === nextProps.post.likes.length &&
    prevProps.currentUser.user_principal.toString() ===
      nextProps.currentUser.user_principal.toString() &&
    prevProps.size === nextProps.size
  );
};

export default memo(LikeButton, areEqual);
