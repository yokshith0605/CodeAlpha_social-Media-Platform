import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Trash2, 
  Send,
  MoreHorizontal
} from 'lucide-react';
import { Post, Comment } from '../types/index.ts';
import { useUser } from '../context/UserContext.tsx';
import { api } from '../services/api.ts';

interface PostCardProps {
  post: Post;
  onPostUpdated: (updatedPost: Post) => void;
  onPostDeleted?: (postId: string) => void;
  onSelectTag?: (tag: string) => void;
  onSelectUser?: (userId: string) => void;
  onOpenImage?: (imageUrl: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostUpdated,
  onPostDeleted,
  onSelectTag,
  onSelectUser,
  onOpenImage,
}) => {
  const { currentUser, showToast } = useUser();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  const isOwner = currentUser?.id === post.authorId;

  // Format relative timestamp
  const formatTimeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleToggleLike = async () => {
    if (!currentUser) return;
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    
    // Optimistic UI
    setIsLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      const res = await api.toggleLikePost(post.id);
      setIsLiked(res.isLiked);
      setLikesCount(res.likesCount);
      onPostUpdated({
        ...post,
        isLiked: res.isLiked,
        likesCount: res.likesCount,
      });
    } catch (err: any) {
      // Revert on error
      setIsLiked(!nextLiked);
      setLikesCount(likesCount);
      showToast(err.message || 'Failed to update like');
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentUser) return;
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);

    try {
      const res = await api.toggleBookmarkPost(post.id);
      setIsBookmarked(res.isBookmarked);
      showToast(res.isBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
      onPostUpdated({
        ...post,
        isBookmarked: res.isBookmarked,
      });
    } catch (err: any) {
      setIsBookmarked(!nextBookmarked);
      showToast(err.message || 'Failed to update bookmark');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    } catch {
      showToast('Post link ready');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(post.id);
      showToast('Post deleted');
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete post');
    }
  };

  const toggleCommentsSection = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && comments.length === 0) {
      setLoadingComments(true);
      try {
        const fetched = await api.getComments(post.id);
        setComments(fetched);
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentUser) return;

    setIsSubmittingComment(true);
    try {
      const created = await api.addComment(post.id, newCommentText.trim());
      setComments(prev => [...prev, created]);
      setNewCommentText('');
      setCommentsCount(c => c + 1);
      showToast('Comment posted');
    } catch (err: any) {
      showToast(err.message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) return;
    try {
      const res = await api.toggleLikeComment(commentId);
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            isLiked: res.isLiked,
            likesCount: res.likesCount,
          };
        }
        return c;
      }));
    } catch (err: any) {
      showToast(err.message || 'Failed to like comment');
    }
  };

  // Render text with clickable #hashtags
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        const tag = part.slice(1);
        return (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectTag) onSelectTag(tag);
            }}
            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline inline-block cursor-pointer"
          >
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const author = post.author;

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 p-5 mb-4 shadow-sm hover:border-slate-300 transition-all">
      {/* Author Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => author && onSelectUser && onSelectUser(author.id)}
        >
          <img
            src={author?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
            alt={author?.name || 'Author'}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-100 group-hover:ring-indigo-400 transition-all shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
                {author?.name || 'Unknown Author'}
              </span>
              {/* Zero-Pill rule: clean unboxed metadata with dot separator */}
              <span className="text-xs text-slate-400 font-normal">
                @{author?.username || 'user'}
              </span>
              <span className="text-slate-300 text-xs" aria-hidden="true">·</span>
              <span className="text-xs text-slate-400 font-normal">
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
            {author?.role && (
              <div className="text-[11px] text-slate-500 font-normal truncate max-w-xs">
                {author.role}
              </div>
            )}
          </div>
        </div>

        {/* Delete post button if owner */}
        {isOwner && (
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Text Content */}
      <div className="text-slate-800 text-sm sm:text-base leading-relaxed mb-3.5 whitespace-pre-line">
        {renderFormattedText(post.content)}
      </div>

      {/* Post Image with Lightbox trigger */}
      {post.image && (
        <div 
          className="relative rounded-xl overflow-hidden border border-slate-200/80 mb-3.5 cursor-pointer group bg-slate-100 max-h-[460px]"
          onClick={() => onOpenImage && onOpenImage(post.image!)}
        >
          <img
            src={post.image}
            alt="Post media"
            className="w-full h-full object-cover max-h-[460px] group-hover:scale-[1.01] transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </div>
      )}

      {/* Tags row */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          {post.tags.map(tag => (
            <button
              key={tag}
              onClick={() => onSelectTag && onSelectTag(tag)}
              className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-slate-500">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like Button */}
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg transition-all cursor-pointer ${
              isLiked ? 'text-rose-600 bg-rose-50' : 'hover:text-rose-600 hover:bg-slate-100'
            }`}
            title="Like"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''} transition-transform`} />
            <span className="tabular-nums">{likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={toggleCommentsSection}
            className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
              showComments ? 'text-indigo-600 bg-indigo-50' : 'hover:text-indigo-600 hover:bg-slate-100'
            }`}
            title="Comments"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="tabular-nums">{commentsCount}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Copy link"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleToggleBookmark}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isBookmarked ? 'text-indigo-600 bg-indigo-50' : 'hover:text-indigo-600 hover:bg-slate-100'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-600 text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
          <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center justify-between">
            <span>Comments ({commentsCount})</span>
          </div>

          {/* New Comment Input */}
          {currentUser && (
            <form onSubmit={handleAddComment} className="flex gap-2.5 mb-4 items-center">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a thoughtful reply..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim() || isSubmittingComment}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reply</span>
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <div className="py-4 text-center text-xs text-slate-400">Loading discussion...</div>
          ) : comments.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">No replies yet. Be the first to start the conversation!</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <img
                    src={comment.author?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Commenter'}
                    alt={comment.author?.name || 'User'}
                    className="w-7 h-7 rounded-full object-cover shrink-0 cursor-pointer"
                    onClick={() => comment.author && onSelectUser && onSelectUser(comment.author.id)}
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span 
                        className="text-xs font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer"
                        onClick={() => comment.author && onSelectUser && onSelectUser(comment.author.id)}
                      >
                        {comment.author?.name || 'User'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        @{comment.author?.username || 'user'}
                      </span>
                      <span className="text-slate-300 text-xs" aria-hidden="true">·</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                  {/* Like on comment */}
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className={`flex items-center gap-1 text-[11px] p-1 rounded hover:bg-white transition-colors shrink-0 ${
                      comment.isLiked ? 'text-rose-600 font-medium' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-rose-500' : ''}`} />
                    <span className="tabular-nums">{comment.likesCount}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
