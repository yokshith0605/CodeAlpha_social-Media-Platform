import React, { useState, useEffect } from 'react';
import { Search, Hash, Users, Sparkles, Check, UserPlus } from 'lucide-react';
import { useUser } from '../context/UserContext.tsx';
import { TrendingTag, User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface RightSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTag: (tag: string) => void;
  onSelectUser: (userId: string) => void;
  activeTag: string | null;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  searchQuery,
  onSearchChange,
  onSelectTag,
  onSelectUser,
  activeTag,
}) => {
  const { currentUser, users, toggleFollowUser, switchUser } = useUser();
  const [trending, setTrending] = useState<{ tags: TrendingTag[]; suggestedUsers: User[] }>({
    tags: [],
    suggestedUsers: [],
  });
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const data = await api.getTrending();
        setTrending(data);
      } catch (err) {
        console.error('Error fetching trending:', err);
      }
    };
    loadTrending();
  }, []);

  // Filter recommendations: people other than current user
  const whoToFollow = users
    .filter(u => u.id !== currentUser?.id)
    .slice(0, 4);

  const handleFollowClick = async (targetId: string) => {
    const isNowFollowing = await toggleFollowUser(targetId);
    setFollowingStates(prev => ({
      ...prev,
      [targetId]: isNowFollowing,
    }));
  };

  return (
    <aside className="w-full lg:w-80 space-y-5 py-6 px-4 lg:px-5">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search posts, topics, @people..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-transparent focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Persona Quick Switcher for Easy Testing */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Test Personas</span>
          </div>
          <span className="text-[11px] text-slate-400">1-click switch</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {users.map((u) => {
            const isCurrent = currentUser?.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`flex items-center gap-2 p-1.5 rounded-lg text-left text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-medium shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="truncate">{u.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Who To Follow */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3 font-display">Who to Follow</h3>
        <div className="space-y-3">
          {whoToFollow.map((user) => {
            const isFollowing = followingStates[user.id] ?? user.isFollowing ?? false;
            return (
              <div key={user.id} className="flex items-center justify-between gap-3">
                <div 
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
                  onClick={() => onSelectUser(user.id)}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-100 group-hover:ring-indigo-500 transition-all"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">@{user.username}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleFollowClick(user.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                    isFollowing
                      ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 font-display">Trending Topics</h3>
          {activeTag && (
            <button
              onClick={() => onSelectTag('')}
              className="text-xs text-indigo-600 hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {trending.tags.map((t) => {
            const isActive = activeTag?.toLowerCase() === t.tag.toLowerCase();
            return (
              <button
                key={t.tag}
                onClick={() => onSelectTag(t.tag)}
                className={`w-full text-left p-2 rounded-xl transition-all block cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="text-[11px] text-slate-400 font-normal">
                  {t.category || 'Trending'}
                </div>
                <div className={`text-xs font-semibold mt-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-900'}`}>
                  #{t.tag}
                </div>
                {/* Zero-Pill rule: unboxed metric text */}
                <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                  {t.count.toLocaleString()} posts
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
