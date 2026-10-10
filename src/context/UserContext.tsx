import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  switchUser: (userId: string) => Promise<void>;
  updateCurrentUserProfile: (updates: Partial<User>) => Promise<User>;
  createNewAccount: (data: { username: string; name: string; avatar?: string; bio?: string }) => Promise<User>;
  refreshUsers: () => Promise<User[]>;
  refreshCurrentUser: () => Promise<void>;
  toggleFollowUser: (targetUserId: string) => Promise<boolean>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  const refreshUsers = useCallback(async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
      return data;
    } catch (err) {
      console.error('Error fetching users:', err);
      return [];
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    if (!currentUser) return;
    try {
      const updated = await api.getUser(currentUser.id);
      setCurrentUser(updated);
    } catch (err) {
      console.error('Error refreshing current user:', err);
    }
  }, [currentUser]);

  const switchUser = useCallback(async (userId: string) => {
    api.setCurrentUserId(userId);
    localStorage.setItem('pulse_user_id', userId);
    try {
      const u = await api.getUser(userId);
      setCurrentUser(u);
      await refreshUsers();
      showToast(`Switched active profile to ${u.name}`);
    } catch (err) {
      console.error('Error switching user:', err);
    }
  }, [refreshUsers, showToast]);

  const updateCurrentUserProfile = useCallback(async (updates: Partial<User>) => {
    if (!currentUser) throw new Error('No user logged in');
    const updated = await api.updateUser(currentUser.id, updates);
    setCurrentUser(updated);
    await refreshUsers();
    showToast('Profile updated successfully');
    return updated;
  }, [currentUser, refreshUsers, showToast]);

  const createNewAccount = useCallback(async (data: { username: string; name: string; avatar?: string; bio?: string }) => {
    const newUser = await api.createUser(data);
    await switchUser(newUser.id);
    showToast(`Account @${newUser.username} created!`);
    return newUser;
  }, [switchUser, showToast]);

  const toggleFollowUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await api.toggleFollow(targetUserId);
      // Refresh current user and users list to update follow counts
      const updatedCurrent = await api.getUser(currentUser.id);
      setCurrentUser(updatedCurrent);
      await refreshUsers();
      showToast(res.isFollowing ? `Followed @${res.targetUser.username}` : `Unfollowed @${res.targetUser.username}`);
      return res.isFollowing;
    } catch (err: any) {
      showToast(err.message || 'Failed to update follow');
      return false;
    }
  }, [currentUser, refreshUsers, showToast]);

  useEffect(() => {
    const init = async () => {
      try {
        const userList = await api.getUsers();
        setUsers(userList);
        const storedId = localStorage.getItem('pulse_user_id');
        const initialUser = (storedId && userList.find(u => u.id === storedId)) || userList[0] || null;
        if (initialUser) {
          api.setCurrentUserId(initialUser.id);
          const fullUser = await api.getUser(initialUser.id);
          setCurrentUser(fullUser);
        }
      } catch (err) {
        console.error('Failed to initialize user session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        isLoading,
        switchUser,
        updateCurrentUserProfile,
        createNewAccount,
        refreshUsers,
        refreshCurrentUser,
        toggleFollowUser,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
