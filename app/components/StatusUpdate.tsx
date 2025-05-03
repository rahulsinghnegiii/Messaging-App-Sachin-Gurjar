"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts';
import { UserStatus } from '../types';

interface StatusOption {
  value: UserStatus;
  label: string;
  icon: React.ReactNode;
}

const StatusUpdate: React.FC = () => {
  const { currentUser, updateUserStatus } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState(currentUser.statusMessage || '');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Status options with icons
  const statusOptions: StatusOption[] = [
    {
      value: 'online',
      label: 'Online',
      icon: (
        <span className="h-3 w-3 rounded-full bg-green-500" />
      )
    },
    {
      value: 'away',
      label: 'Away',
      icon: (
        <span className="h-3 w-3 rounded-full bg-yellow-500" />
      )
    },
    {
      value: 'busy',
      label: 'Busy',
      icon: (
        <span className="h-3 w-3 rounded-full bg-red-500" />
      )
    },
    {
      value: 'do-not-disturb',
      label: 'Do Not Disturb',
      icon: (
        <span className="h-3 w-3 rounded-full bg-red-500" />
      )
    },
    {
      value: 'offline',
      label: 'Appear Offline',
      icon: (
        <span className="h-3 w-3 rounded-full bg-gray-400" />
      )
    },
  ];

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle status option click
  const handleStatusOptionClick = (status: UserStatus) => {
    updateUserStatus(currentUser.id, status, statusMessage);
    setIsOpen(false);
  };

  // Handle status message update
  const handleStatusMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserStatus(currentUser.id, currentUser.status, statusMessage);
    setIsOpen(false);
  };

  // Find current status option
  const currentStatusOption = statusOptions.find(option => option.value === currentUser.status);

  return (
    <div ref={containerRef} className="relative">
      {/* Status button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/80 transition-colors text-sm"
      >
        {currentStatusOption?.icon}
        <span className="truncate">{currentUser.statusMessage || currentStatusOption?.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Status dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 overflow-hidden"
          >
            <div className="p-3">
              <h3 className="text-sm font-medium mb-2">Set status</h3>
              
              {/* Status options */}
              <div className="space-y-1 mb-3">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusOptionClick(option.value)}
                    className={`w-full flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                      currentUser.status === option.value
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary/80'
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Status message input */}
              <form onSubmit={handleStatusMessageSubmit}>
                <div className="mb-2">
                  <label htmlFor="status-message" className="block text-xs text-muted-foreground mb-1">
                    Status message
                  </label>
                  <input
                    id="status-message"
                    type="text"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="What's happening?"
                    className="w-full p-2 rounded-md bg-secondary/50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    maxLength={40}
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground rounded-md py-1.5 text-sm font-medium"
                >
                  Update Status
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatusUpdate; 