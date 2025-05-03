"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, UserStatus } from '../types';
import { mockUsers, currentUser } from '../mockData';

interface UserContextType {
  users: User[];
  currentUser: User;
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
  updateUserStatus: (userId: string, status: UserStatus, statusMessage?: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentUserState, setCurrentUserState] = useState<User>(currentUser);

  const updateUserStatus = (userId: string, status: UserStatus, statusMessage?: string) => {
    if (userId === currentUserState.id) {
      setCurrentUserState(prev => ({
        ...prev,
        status,
        statusMessage: statusMessage || prev.statusMessage,
        lastSeen: new Date(),
      }));
    } else {
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? {
                ...user,
                status,
                statusMessage: statusMessage || user.statusMessage,
                lastSeen: new Date(),
              }
            : user
        )
      );
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser: currentUserState,
        selectedUserId,
        setSelectedUserId,
        updateUserStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 