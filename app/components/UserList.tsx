"use client";

import React, { useState } from 'react';
import { useUser, useMessage, useUI } from '../contexts';
import { User } from '../types';
import { motion } from 'framer-motion';
import StatusUpdate from './StatusUpdate';

// Status indicator component
const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    'do-not-disturb': 'bg-red-500',
  };

  return (
    <span 
      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${statusColors[status as keyof typeof statusColors]}`}
      aria-label={`Status: ${status}`}
    />
  );
};

// User item component
const UserItem: React.FC<{ user: User; isSelected: boolean; onSelect: () => void }> = ({ 
  user, 
  isSelected,
  onSelect 
}) => {
  const { conversations } = useMessage();
  const { closeMobileMenu } = useUI();
  
  // Find conversation for this user to get unread count
  const conversation = conversations.find(
    (conv) => conv.participants.includes(user.id)
  );
  
  const unreadCount = conversation?.unreadCount || 0;
  const isTyping = conversation?.isTyping?.[user.id] || false;
  
  // Format time consistently without locale-specific formatting
  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const handleClick = () => {
    onSelect();
    closeMobileMenu(); // Close mobile menu when a user is selected
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
        isSelected
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-secondary/80'
      }`}
    >
      {/* Avatar with status indicator */}
      <div className="relative">
        <img
          src={user.avatar}
          alt={`${user.name}'s avatar`}
          className="h-12 w-12 rounded-full object-cover"
        />
        <StatusIndicator status={user.status} />
      </div>
      
      {/* User info */}
      <div className="flex-1 flex flex-col items-start overflow-hidden">
        <div className="flex justify-between w-full">
          <span className="font-medium truncate">{user.name}</span>
          {/* Always render the badge container, but conditionally show content */}
          <div className="ml-2 min-w-[20px] min-h-[20px] flex items-center justify-center">
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full text-xs px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        
        {/* Status message or typing indicator */}
        <div className="text-sm text-muted-foreground truncate w-full">
          {isTyping ? (
            <span className="text-primary typing-indicator">
              Typing<span>.</span><span>.</span><span>.</span>
            </span>
          ) : (
            user.statusMessage || (
              <span className="text-xs opacity-70">
                {user.status === 'online' 
                  ? 'Online' 
                  : user.status === 'offline' && user.lastSeen
                  ? `Last seen ${formatTime(user.lastSeen)}`
                  : user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            )
          )}
        </div>
      </div>
    </motion.button>
  );
};

// Main user list component
const UserList: React.FC = () => {
  const { users, currentUser, selectedUserId, setSelectedUserId } = useUser();
  const { isDarkMode, toggleDarkMode } = useUI();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.statusMessage && user.statusMessage.toLowerCase().includes(searchQuery.toLowerCase())) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with current user info and dark mode toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt="Your avatar"
              className="h-10 w-10 rounded-full object-cover"
            />
            <StatusIndicator status={currentUser.status} />
          </div>
          <div className="font-semibold">{currentUser.name}</div>
        </div>
        
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-secondary text-secondary-foreground"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* Status update selector */}
      <div className="px-4 py-2 border-b border-border">
        <StatusUpdate />
      </div>
      
      {/* Search box */}
      <div className="p-4">
        <div className="relative">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..." 
            className="w-full bg-secondary/50 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* User list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
            <svg 
              xmlns="http://www.w3.org/2000/svg"
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="mb-2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <p>No users found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredUsers.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                isSelected={selectedUserId === user.id}
                onSelect={() => setSelectedUserId(user.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList; 