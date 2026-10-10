/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Filter, 
  Radio, 
  Home, 
  Compass, 
  Bookmark, 
  User as UserIcon,
  PlusSquare,
  Search,
  X
} from 'lucide-react';
import { User, Post } from './types/index.ts';
import { useUser, UserProvider } from './context/UserContext.tsx';
import { api } from './services/api.ts';
import { NavigationSidebar } from './components/NavigationSidebar.tsx';
import { RightSidebar } from './components/RightSidebar.tsx';
import { PostComposer } from './components/PostComposer.tsx';
import { PostCard } from './components/PostCard.tsx';
import { UserProfileView } from './components/UserProfileView.tsx';
import { EditProfileModal } from './components/EditProfileModal.tsx';
import { FollowListModal } from './components/FollowListModal.tsx';
import { CreateAccountModal } from './components/CreateAccountModal.tsx';
import { ImageLightboxModal } from './components/ImageLightboxModal.tsx';
import { Toast } from './components/Toast.tsx';

function MainApp() {
  const { currentUser, toastMessage } = useUser();
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'bookmarks' | 'profile'>('feed');
  const [feedFilter, setFeedFilter] = useState<'foryou' | 'following' | 'explore'>('foryou');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Modals state
  const [isComposerModalOpen, setIsComposerModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [followListModal, setFollowListModal] = useState<{
    isOpen: boolean;
    type: 'followers' | 'following';
    user: User | null;
  }>({
    isOpen: false,
    type: 'followers',
    user: null,
  });

  const loadPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const data = await api.getPosts({
        feed: activeTab === 'explore' ? 'explore' : feedFilter,
        bookmarks: activeTab === 'bookmarks',
        tag: activeTag || undefined,
        search: searchQuery || undefined,
      });
      setPosts(data);
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [activeTab, feedFilter, activeTag, searchQuery]);

  useEffect(() => {
    if (!selectedUserId) {
      loadPosts();
    }
  }, [loadPosts, selectedUserId, currentUser?.id]);

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
  };

  const handleSelectTag = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null);
    } else {
      setActiveTag(tag);
      setSelectedUserId(null);
      if (activeTab === 'profile') setActiveTab('feed');
    }
  };

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavSelect = (tab: 'feed' | 'explore' | 'bookmarks' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'feed' || tab === 'explore' || tab === 'bookmarks') {
      setSelectedUserId(null);
    } else if (tab === 'profile' && currentUser) {
      setSelectedUserId(currentUser.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex justify-center selection:bg-indigo-500/10 selection:text-indigo-600">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row min-h-screen">
        
        {/* Mobile Top Header (Hidden on Desktop) */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavSelect('feed')}>
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Radio className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-bold text-lg text-slate-900 font-display">Pulse</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsComposerModalOpen(true)}
              className="p-2 rounded-lg bg-indigo-600 text-white"
              aria-label="New post"
            >
              <PlusSquare className="w-4 h-4" />
            </button>
            {currentUser && (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                onClick={() => handleViewProfile(currentUser.id)}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 cursor-pointer"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </header>

        {/* Left Navigation Sidebar (Desktop) */}
        <div className="hidden lg:block shrink-0">
          <NavigationSidebar
            currentTab={activeTab}
            onSelectTab={handleNavSelect}
            onOpenNewPost={() => setIsComposerModalOpen(true)}
            onOpenCreateAccount={() => setIsCreateAccountModalOpen(true)}
            onViewProfile={handleViewProfile}
          />
        </div>

        {/* Center Main Content Feed */}
        <main className="flex-1 max-w-2xl border-x-0 lg:border-r border-slate-200/80 min-h-screen pb-20 lg:pb-12">
          {selectedUserId ? (
            /* Profile View */
            <div className="p-4 sm:p-5">
              <UserProfileView
                userId={selectedUserId}
                onBack={() => {
                  setSelectedUserId(null);
                  setActiveTab('feed');
                }}
                onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
                onOpenFollowList={(type, targetUser) => {
                  setFollowListModal({
                    isOpen: true,
                    type,
                    user: targetUser,
                  });
                }}
                onOpenImage={(url) => setLightboxImage(url)}
                onSelectTag={handleSelectTag}
                onSelectUser={handleViewProfile}
              />
            </div>
          ) : (
            /* Feed / Explore / Bookmarks View */
            <div className="p-4 sm:p-5">
              {/* Header Feed Switcher */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-3 mb-5 shadow-xs sticky top-3 z-10 backdrop-blur-md bg-white/90">
                <div className="flex items-center justify-between">
                  {/* Segmented Feed Controls */}
                  <div className="flex items-center gap-1">
                    {activeTab === 'bookmarks' ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-slate-900">
                        <Bookmark className="w-4 h-4 text-indigo-600" />
                        <span>Saved Bookmarks</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setFeedFilter('foryou');
                            setActiveTag(null);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            feedFilter === 'foryou' && !activeTag
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          For You
                        </button>

                        <button
                          onClick={() => {
                            setFeedFilter('following');
                            setActiveTag(null);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            feedFilter === 'following' && !activeTag
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          Following
                        </button>

                        <button
                          onClick={() => {
                            setFeedFilter('explore');
                            setActiveTag(null);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            feedFilter === 'explore' && !activeTag
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          Explore
                        </button>
                      </>
                    )}
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={() => loadPosts()}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Refresh feed"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingPosts ? 'animate-spin text-indigo-600' : ''}`} />
                  </button>
                </div>

                {/* Active Tag Filter Indicator */}
                {activeTag && (
                  <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                      <span>Filtering by #{activeTag}</span>
                    </div>
                    <button
                      onClick={() => setActiveTag(null)}
                      className="text-slate-400 hover:text-slate-700 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Post Composer (Only shown on primary feed) */}
              {activeTab === 'feed' && !activeTag && !searchQuery && (
                <PostComposer onPostCreated={handlePostCreated} />
              )}

              {/* Posts Feed Stream */}
              {isLoadingPosts ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading feed updates...
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-500 shadow-sm">
                  <p className="text-sm font-medium">No posts found in this view.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {feedFilter === 'following'
                      ? 'Follow creators from the "Who to Follow" panel to see their posts here.'
                      : 'Be the first to create a post or clear search filters.'}
                  </p>
                  {feedFilter === 'following' && (
                    <button
                      onClick={() => setFeedFilter('foryou')}
                      className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                    >
                      Browse For You Feed
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPostUpdated={handlePostUpdated}
                      onPostDeleted={handlePostDeleted}
                      onSelectTag={handleSelectTag}
                      onSelectUser={handleViewProfile}
                      onOpenImage={(url) => setLightboxImage(url)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar (Discovery, Who to follow, Trending) */}
        <div className="hidden lg:block shrink-0">
          <RightSidebar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectTag={handleSelectTag}
            onSelectUser={handleViewProfile}
            activeTag={activeTag}
          />
        </div>

        {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from Mobile reference) */}
        <nav 
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 h-16 flex items-center justify-around px-2"
          aria-label="Mobile Navigation"
        >
          <button
            onClick={() => handleNavSelect('feed')}
            className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] ${
              activeTab === 'feed' ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Feed</span>
          </button>

          <button
            onClick={() => handleNavSelect('explore')}
            className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] ${
              activeTab === 'explore' ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Explore</span>
          </button>

          <button
            onClick={() => setIsComposerModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] text-indigo-600"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <PlusSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Post</span>
          </button>

          <button
            onClick={() => handleNavSelect('bookmarks')}
            className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] ${
              activeTab === 'bookmarks' ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Saved</span>
          </button>

          <button
            onClick={() => {
              if (currentUser) handleViewProfile(currentUser.id);
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] ${
              activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1">Profile</span>
          </button>
        </nav>

        {/* Composer Modal */}
        {isComposerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div 
              className="relative w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <PostComposer
                isModal={true}
                onClose={() => setIsComposerModalOpen(false)}
                onPostCreated={(newPost) => {
                  handlePostCreated(newPost);
                  setIsComposerModalOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
        />

        {/* Create Account Modal */}
        <CreateAccountModal
          isOpen={isCreateAccountModalOpen}
          onClose={() => setIsCreateAccountModalOpen(false)}
        />

        {/* Followers / Following List Modal */}
        <FollowListModal
          isOpen={followListModal.isOpen}
          type={followListModal.type}
          targetUser={followListModal.user}
          onClose={() => setFollowListModal(prev => ({ ...prev, isOpen: false }))}
          onSelectUser={(userId) => {
            handleViewProfile(userId);
            setFollowListModal(prev => ({ ...prev, isOpen: false }));
          }}
        />

        {/* Image Lightbox Modal */}
        <ImageLightboxModal
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />

        {/* Floating Notification Toast */}
        <Toast message={toastMessage} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}
