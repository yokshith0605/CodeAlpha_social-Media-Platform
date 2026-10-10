import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck } from 'lucide-react';
import { User } from '../types/index.ts';
import { useUser } from '../context/UserContext.tsx';
import { api } from '../services/api.ts';

interface FollowListModalProps {
  type: 'followers' | 'following';
  targetUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  type,
  targetUser,
  isOpen,
  onClose,
  onSelectUser,
}) => {
  const { currentUser, toggleFollowUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !targetUser) return;
    const fetchList = async () => {
      setLoading(true);
      try {
        const data = type === 'followers'
          ? await api.getFollowers(targetUser.id)
          : await api.getFollowing(targetUser.id);
        setUsers(data);
      } catch (err) {
        console.error('Failed to load follow list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [type, targetUser, isOpen]);

  if (!isOpen || !targetUser) return null;

  const handleToggle = async (userId: string) => {
    await toggleFollowUser(userId);
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          isFollowing: !u.isFollowing,
        };
      }
      return u;
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              {type === 'followers' ? 'Followers' : 'Following'}
            </h2>
            <div className="text-xs text-slate-400">@{targetUser.username}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading connections...</div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {type === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
            </div>
          ) : (
            users.map((u) => {
              const isSelf = currentUser?.id === u.id;
              return (
                <div key={u.id} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1 group"
                    onClick={() => {
                      onClose();
                      onSelectUser(u.id);
                    }}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-100 group-hover:ring-indigo-500 transition-all"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">@{u.username}</div>
                      {u.bio && (
                        <div className="text-[11px] text-slate-500 truncate mt-0.5 max-w-xs">{u.bio}</div>
                      )}
                    </div>
                  </div>

                  {!isSelf && (
                    <button
                      onClick={() => handleToggle(u.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                        u.isFollowing
                          ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {u.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
