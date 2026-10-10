import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Compass, 
  Bookmark, 
  User as UserIcon, 
  PlusSquare, 
  Check, 
  UserPlus, 
  ChevronUp,
  Radio
} from 'lucide-react';
import { useUser } from '../context/UserContext.tsx';

interface NavigationSidebarProps {
  currentTab: 'feed' | 'explore' | 'bookmarks' | 'profile';
  onSelectTab: (tab: 'feed' | 'explore' | 'bookmarks' | 'profile') => void;
  onOpenNewPost: () => void;
  onOpenCreateAccount: () => void;
  onViewProfile: (userId: string) => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewPost,
  onOpenCreateAccount,
  onViewProfile,
}) => {
  const { currentUser, users, switchUser } = useUser();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'feed' as const, label: 'Feed', icon: Home },
    { id: 'explore' as const, label: 'Explore', icon: Compass },
    { id: 'bookmarks' as const, label: 'Bookmarks', icon: Bookmark },
    { id: 'profile' as const, label: 'Profile', icon: UserIcon },
  ];

  return (
    <aside className="w-full lg:w-64 flex flex-col justify-between py-6 px-4 lg:px-5 border-r border-slate-200/80 bg-white min-h-[calc(100vh-2px)] sticky top-0">
      <div>
        {/* Brand Area */}
        <div className="flex items-center gap-3 px-3 mb-8 cursor-pointer" onClick={() => onSelectTab('feed')}>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10">
            <Radio className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-display">Pulse</span>
            <div className="text-[11px] text-slate-500 font-normal">Social Network</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'profile' && currentUser) {
                    onViewProfile(currentUser.id);
                  }
                  onSelectTab(item.id);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Primary Post CTA Button */}
        <div className="mt-6 px-1">
          <button
            onClick={onOpenNewPost}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <PlusSquare className="w-4 h-4 shrink-0" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {/* Account / Active Profile Switcher */}
      <div className="relative mt-8 pt-4 border-t border-slate-100" ref={dropdownRef}>
        {currentUser && (
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-500 truncate">@{currentUser.username}</div>
              </div>
            </div>
            <ChevronUp className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Switch Account Popup Menu */}
        {showUserDropdown && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-200/80 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 tracking-wider">
              Switch Account
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {users.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                      isCurrent ? 'bg-indigo-50/70 text-indigo-950 font-medium' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 truncate">{u.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">@{u.username}</div>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 mt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  onOpenCreateAccount();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New User Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
