"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessage, useUser } from '../contexts';
import { Message, User } from '../types';
import { mockUsers } from '../mockData';
import EmojiPicker from './EmojiPicker';

// Message status component
const MessageStatus: React.FC<{ status: string }> = ({ status }) => {
  const statusMap = {
    sending: 'Sending...',
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Read',
  };

  const iconMap = {
    sending: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    sent: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    delivered: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    read: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L7 17L2 12" />
        <path d="M22 10L13 19L11 17" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {status in iconMap && iconMap[status as keyof typeof iconMap]}
      <span>{statusMap[status as keyof typeof statusMap]}</span>
    </div>
  );
};

// Message time component
const MessageTime: React.FC<{ time: Date }> = ({ time }) => {
  // Format time consistently without locale-specific formatting
  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <span className="text-xs text-muted-foreground">
      {formatTime(time)}
    </span>
  );
};

// Message reactions component
const MessageReactions: React.FC<{ message: Message }> = ({ message }) => {
  if (!message.reactions || message.reactions.length === 0) return null;

  return (
    <div className="flex gap-1 mt-1">
      {message.reactions.map((reaction) => (
        <span
          key={reaction.id}
          className="inline-flex items-center justify-center bg-secondary rounded-full px-2 py-0.5 text-sm"
        >
          {reaction.emoji}
        </span>
      ))}
    </div>
  );
};

// Individual message component
const MessageItem: React.FC<{ message: Message; isCurrentUser: boolean }> = ({ message, isCurrentUser }) => {
  const { addReaction } = useMessage();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAddReaction = (emoji: string) => {
    addReaction(message.id, emoji);
    setShowReactionPicker(false);
  };

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowReactionPicker(false);
      }
    };

    if (showReactionPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReactionPicker]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4 group`}
    >
      <div
        ref={containerRef}
        className={`relative max-w-[75%] ${isCurrentUser ? 'order-1' : 'order-2'}`}
      >
        <div
          className={`px-4 py-2 rounded-2xl ${
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-secondary text-secondary-foreground rounded-bl-none'
          }`}
        >
          <div className="mb-1">{message.content}</div>
          <div className="flex justify-between items-center text-xs">
            <MessageTime time={message.timestamp} />
            {isCurrentUser && <MessageStatus status={message.status} />}
          </div>
        </div>

        <MessageReactions message={message} />

        {/* Reaction button */}
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className={`absolute bottom-0 ${
            isCurrentUser ? 'left-0 -translate-x-full -ml-2' : 'right-0 translate-x-full mr-2'
          } opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 p-1 rounded-full bg-background border border-border`}
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
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </button>

        {/* Simple Reaction Picker */}
        <AnimatePresence>
          {showReactionPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute bottom-8 ${
                isCurrentUser ? 'left-0' : 'right-0'
              } bg-background border border-border rounded-lg shadow-lg p-2 z-10`}
            >
              <div className="flex gap-2">
                {['👍', '❤️', '😂', '😮', '😢'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAddReaction(emoji)}
                    className="text-lg hover:bg-secondary rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Message input component
const MessageInput: React.FC = () => {
  const { sendMessage, setTyping } = useMessage();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Animate send button
      setIsSending(true);
      
      // Send message
      sendMessage(message.trim());
      
      // Clear input
      setMessage('');
      
      // Reset animation after a short delay
      setTimeout(() => {
        setIsSending(false);
        // Focus the input after sending
        inputRef.current?.focus();
      }, 300);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Set typing indicator
    setTyping(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  const handleEmojiSelect = (emoji: string) => {
    // Insert emoji at cursor position or append to end
    if (inputRef.current) {
      const cursorPosition = inputRef.current.selectionStart || 0;
      const textBeforeCursor = message.substring(0, cursorPosition);
      const textAfterCursor = message.substring(cursorPosition);
      setMessage(textBeforeCursor + emoji + textAfterCursor);
      
      // Set cursor position after inserted emoji
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPosition = cursorPosition + emoji.length;
          inputRef.current.selectionStart = newCursorPosition;
          inputRef.current.selectionEnd = newCursorPosition;
          inputRef.current.focus();
        }
      }, 0);
    } else {
      setMessage((prev) => prev + emoji);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="w-full bg-secondary/50 rounded-full py-3 px-4 pr-10 outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-full"
            >
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
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </button>
            
            {/* Enhanced Emoji Picker */}
            <div className="relative">
              <EmojiPicker 
                isOpen={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
                onEmojiSelect={handleEmojiSelect}
              />
            </div>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="submit"
          disabled={!message.trim() || isSending}
          className="bg-primary text-primary-foreground p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
        >
          <motion.div
            animate={isSending ? { y: -30 } : { y: 0 }}
            transition={{ duration: 0.2 }}
          >
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
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: 30 }}
            animate={isSending ? { y: 0 } : { y: 30 }}
            transition={{ duration: 0.2 }}
          >
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
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </motion.div>
        </motion.button>
      </div>
    </form>
  );
};

// Chat window header component
const ChatHeader: React.FC<{ selectedUser: User | null }> = ({ selectedUser }) => {
  if (!selectedUser) return null;

  // Format time consistently without locale-specific formatting
  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="px-4 py-3 border-b border-border flex items-center gap-3">
      <div className="relative">
        <img
          src={selectedUser.avatar}
          alt={`${selectedUser.name}'s avatar`}
          className="h-10 w-10 rounded-full object-cover"
        />
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
            selectedUser.status === 'online'
              ? 'bg-green-500'
              : selectedUser.status === 'offline'
              ? 'bg-gray-400'
              : selectedUser.status === 'away'
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        />
      </div>
      <div className="flex-1">
        <div className="font-medium">{selectedUser.name}</div>
        <div className="text-xs text-muted-foreground">
          {selectedUser.status === 'online'
            ? 'Online'
            : selectedUser.status === 'offline' && selectedUser.lastSeen
            ? `Last seen ${formatTime(selectedUser.lastSeen)}`
            : selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
        </div>
      </div>
    </div>
  );
};

// Typing indicator component with improved animation
const TypingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start mb-4"
    >
      <div className="bg-secondary rounded-2xl rounded-bl-none px-4 py-3 max-w-[200px]">
        <div className="flex gap-1.5 items-center justify-center">
          <span className="text-sm text-muted-foreground">Typing</span>
          <div className="flex gap-1 items-center">
            <motion.div 
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
            <motion.div 
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main chat window component
const ChatWindow: React.FC = () => {
  const { selectedConversation, messages } = useMessage();
  const { currentUser, selectedUserId } = useUser();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Find the selected user from the mockUsers array
  const selectedUser = selectedUserId
    ? mockUsers.find((user) => user.id === selectedUserId) || null
    : null;

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If no user is selected, show a placeholder
  if (!selectedUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold mb-2">Welcome to Messaging App</h2>
          <p className="text-muted-foreground mb-6">
            Select a conversation from the sidebar to start chatting
          </p>
          <img
            src="/convo-placeholder.svg"
            alt="Select a conversation"
            className="mx-auto max-w-[300px] opacity-70"
          />
        </div>
      </div>
    );
  }

  // Check if the other user is typing
  const isOtherUserTyping = selectedConversation?.isTyping?.[selectedUser.id] || false;

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <ChatHeader selectedUser={selectedUser} />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isCurrentUser={message.senderId === currentUser.id}
            />
          ))}
          {isOtherUserTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow; 