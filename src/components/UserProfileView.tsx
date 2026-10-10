import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Edit3, 
  UserCheck, 
  UserPlus,
  Grid,
  Heart,
  Image as ImageIcon
} from 'lucide-react';
import { User, Post } from '../types/index.ts';
import { useUser } from '../context/UserContext.tsx';
import { api } from '../services/api.ts';
import { PostCard } from './PostCard.tsx';

interface UserProfileViewProps {
  userId: string;
  onBack: () => void;
  onOpenEditProfile: () => void;
  onOpenFollowList: (type: 'followers' | 'following', targetUser: User) => void;
  onOpenImage: (imageUrl: string) => void;
  onSelectTag: (tag: string) => void;
  onSelectUser: (userId: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userId,
  onBack,
  onOpenEditProfile,
  onOpenFollowList,
  onOpenImage,
  onSelectTag,
  onSelectUser,
}) => {
  const { currentUser, toggleFollowUser } = useUser();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'media'>('posts');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const u = await api.getUser(userId);
        setProfileUser(u);
        setIsFollowing(u.isFollowing || false);
        setFollowersCount(u.followersCount || 0);

        // Load posts for this user
        const userPosts = await api.getPosts({ userId });
        setPosts(userPosts);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId, currentUser]);

  const handleToggleFollow = async () => {
    if (!profileUser || isOwnProfile) return;
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));

    try {
      const res = await toggleFollowUser(profileUser.id);
      setIsFollowing(res);
    } catch {
      setIsFollowing(!nextState);
      setFollowersCount(profileUser.followersCount);
    }
  };

  const handlePostUpdated = (updated: Post) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
    if (profileUser) {
      setProfileUser({
        ...profileUser,
        postsCount: Math.max(0, profileUser.postsCount - 1),
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400">
        Loading profile details...
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-500">
        <p>User not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  // Filter posts based on active profile tab
  const displayedPosts = posts.filter(p => {
    if (activeTab === 'media') return Boolean(p.image);
    if (activeTab === 'likes') return p.isLiked;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Header Navigation */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 sticky top-0 z-20 shadow-xs">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Back to feed"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight font-display">
            {profileUser.name}
          </h2>
          <span className="text-xs text-slate-400 font-normal">
            {profileUser.postsCount} posts
          </span>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
        {/* Cover Photo Banner */}
        <div className="h-44 sm:h-52 w-full bg-slate-200 relative overflow-hidden">
          <img
            src={profileUser.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'}
            alt="Profile cover"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Profile Info Section */}
        <div className="px-5 sm:px-6 pb-6 relative pt-0">
          {/* Avatar and Action button row */}
          <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-4">
            <img
              src={profileUser.avatar}
              alt={profileUser.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white shadow-md bg-white shrink-0"
              referrerPolicy="no-referrer"
            />

            <div>
              {isOwnProfile ? (
                <button
                  onClick={onOpenEditProfile}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={handleToggleFollow}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                    isFollowing
                      ? 'border border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Name & Title */}
          <div className="mb-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              {profileUser.name}
            </h1>
            <div className="text-sm text-slate-400 font-normal">
              @{profileUser.username}
            </div>
            {profileUser.role && (
              <div className="text-xs text-indigo-600 font-medium mt-0.5">
                {profileUser.role}
              </div>
            )}
          </div>

          {/* Bio */}
          {profileUser.bio && (
            <p className="text-sm text-slate-700 leading-relaxed mb-4 max-w-2xl">
              {profileUser.bio}
            </p>
          )}

          {/* Location, Website, Joined Date metadata (Zero-Pill discipline) */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-5">
            {profileUser.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profileUser.location}</span>
              </div>
            )}
            {profileUser.website && (
              <a
                href={profileUser.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-indigo-600 hover:underline"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{profileUser.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Joined {profileUser.joinedDate}</span>
            </div>
          </div>

          {/* Follow Stats Counters */}
          <div className="flex items-center gap-6 pt-4 border-t border-slate-100 text-sm">
            <button
              onClick={() => onOpenFollowList('following', profileUser)}
              className="hover:underline cursor-pointer"
            >
              <strong className="text-slate-900 font-semibold tabular-nums">
                {profileUser.followingCount}
              </strong>{' '}
              <span className="text-slate-500 font-normal">Following</span>
            </button>

            <button
              onClick={() => onOpenFollowList('followers', profileUser)}
              className="hover:underline cursor-pointer"
            >
              <strong className="text-slate-900 font-semibold tabular-nums">
                {followersCount}
              </strong>{' '}
              <span className="text-slate-500 font-normal">Followers</span>
            </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'posts'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Posts ({profileUser.postsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'media'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media</span>
          </button>

          <button
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'likes'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Liked</span>
          </button>
        </div>
      </div>

      {/* User's Posts Feed */}
      <div>
        {displayedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center text-slate-400 text-sm">
            No posts found in this tab.
          </div>
        ) : (
          displayedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
              onSelectTag={onSelectTag}
              onSelectUser={onSelectUser}
              onOpenImage={onOpenImage}
            />
          ))
        )}
      </div>
    </div>
  );
};
