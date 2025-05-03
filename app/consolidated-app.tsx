"use client";

import React, { createContext, useState, useContext, ReactNode, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ======================================================
// TYPES
// ======================================================

// User status options
export type UserStatus = 'online' | 'offline' | 'away' | 'busy' | 'do-not-disturb';

// User interface
export interface User {
  id: string;
  name: string;
  avatar: string;
  status: UserStatus;
  statusMessage?: string;
  lastSeen?: Date;
  email?: string;
}

// Message status options
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

// Message interface
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  reactions?: Reaction[];
  isDeleted?: boolean;
}

// Reaction interface
export interface Reaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: Date;
}

// Conversation interface (for organizing messages between two users)
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount?: number;
  isTyping?: { [userId: string]: boolean };
}

// UI State interface
export interface UIState {
  isMobileMenuOpen: boolean;
  selectedConversationId: string | null;
  isDarkMode: boolean;
}

// ======================================================
// MOCK DATA
// ======================================================

// Generate a random UUID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    status: 'online',
    statusMessage: 'Working on new features',
    lastSeen: new Date(),
    email: 'john.doe@example.com',
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    status: 'away',
    statusMessage: 'In a meeting',
    lastSeen: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    email: 'jane.smith@example.com',
  },
  {
    id: 'user3',
    name: 'Robert Johnson',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    status: 'offline',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    email: 'robert.johnson@example.com',
  },
  {
    id: 'user4',
    name: 'Emily Davis',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    status: 'busy',
    statusMessage: 'Deadline approaching',
    lastSeen: new Date(),
    email: 'emily.davis@example.com',
  },
  {
    id: 'user5',
    name: 'Michael Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    status: 'online',
    lastSeen: new Date(),
    email: 'michael.wilson@example.com',
  },
];

// Current user (logged in user)
export const currentUser: User = {
  id: 'current-user',
  name: 'Alex Morgan',
  avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
  status: 'online',
  statusMessage: 'Available for chat',
  lastSeen: new Date(),
  email: 'alex.morgan@example.com',
};

// Generate mock messages for a conversation
const generateMockMessages = (sender: User, receiver: User, count: number): Message[] => {
  const messages: Message[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const isFromSender = Math.random() > 0.5;
    const messageTime = new Date(now.getTime() - (count - i) * 5 * 60 * 1000); // 5 minutes between messages
    
    messages.push({
      id: generateId(),
      senderId: isFromSender ? sender.id : receiver.id,
      receiverId: isFromSender ? receiver.id : sender.id,
      content: `Message ${i + 1}: ${isFromSender ? 'From ' + sender.name : 'From ' + receiver.name}`,
      timestamp: messageTime,
      status: 'read' as MessageStatus,
      reactions: i % 3 === 0 ? [{ // Add reactions to every third message
        id: generateId(),
        userId: isFromSender ? receiver.id : sender.id,
        emoji: ['👍', '❤️', '😂', '😮', '😢'][Math.floor(Math.random() * 5)],
        timestamp: new Date(messageTime.getTime() + 30 * 1000), // 30 seconds after message
      }] : [],
    });
  }
  
  return messages;
};

// Generate mock conversations
export const generateMockConversations = (): Conversation[] => {
  return mockUsers.map((user, index) => ({
    id: `conv-${currentUser.id}-${user.id}`,
    participants: [currentUser.id, user.id],
    lastMessage: generateMockMessages(currentUser, user, 1)[0],
    unreadCount: index % 3, // Use deterministic values based on index
    isTyping: { [user.id]: index === 1 }, // Only the second user is typing
  }));
};

// Get mock messages for a specific conversation
export const getMockMessagesForConversation = (conversationId: string, count: number = 20): Message[] => {
  const conversation = mockConversations.find(conv => conv.id === conversationId);
  if (!conversation) return [];
  
  const otherUserId = conversation.participants.find(id => id !== currentUser.id);
  if (!otherUserId) return [];
  
  const otherUser = mockUsers.find(user => user.id === otherUserId);
  if (!otherUser) return [];
  
  return generateMockMessages(currentUser, otherUser, count);
};

// Create mock conversations
export const mockConversations = generateMockConversations();

// Function to simulate sending a new message
export const sendMessage = (
  conversationId: string, 
  content: string
): Message => {
  const conversation = mockConversations.find(conv => conv.id === conversationId);
  if (!conversation) throw new Error('Conversation not found');
  
  const receiverId = conversation.participants.find(id => id !== currentUser.id) as string;
  
  const newMessage: Message = {
    id: generateId(),
    senderId: currentUser.id,
    receiverId,
    content,
    timestamp: new Date(),
    status: 'sending',
  };
  
  // Update last message in conversation
  conversation.lastMessage = newMessage;
  conversation.unreadCount = 0;
  
  return newMessage;
};

// ======================================================
// CONTEXTS
// ======================================================

// User Context
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

// Message Context
interface MessageContextType {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  selectConversation: (conversationId: string) => void;
  sendMessage: (content: string) => void;
  setTyping: (isTyping: boolean) => void;
  addReaction: (messageId: string, emoji: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, selectedUserId } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Selected conversation object
  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId) || null;

  // Update selected conversation when selected user changes
  useEffect(() => {
    if (selectedUserId) {
      const conversation = conversations.find(conv => 
        conv.participants.includes(selectedUserId) && 
        conv.participants.includes(currentUser.id)
      );
      
      if (conversation) {
        selectConversation(conversation.id);
      }
    }
  }, [selectedUserId, currentUser.id, conversations]);

  // Load messages when selected conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      // In a real app, this would be an API call
      const conversationMessages = getMockMessagesForConversation(selectedConversationId, 20);
      setMessages(conversationMessages);
      
      // Mark conversation as read
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  const selectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const sendMessage = (content: string) => {
    if (!selectedConversationId || !content.trim()) return;
    
    // In a real app, this would be an API call
    const newMessage = sendMessage(selectedConversationId, content);
    
    // Add to local messages
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    }, 500);
    
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1500);
    
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        )
      );
    }, 3000);
    
    // Simulate response after a delay
    setTimeout(() => {
      if (!selectedConversation) return;
      
      const otherUserId = selectedConversation.participants.find(
        id => id !== currentUser.id
      );
      
      if (!otherUserId) return;
      
      const responseMessage: Message = {
        id: Math.random().toString(36).substring(2),
        senderId: otherUserId,
        receiverId: currentUser.id,
        content: `Thanks for your message: "${content}"`,
        timestamp: new Date(),
        status: 'read',
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversationId 
            ? { ...conv, lastMessage: responseMessage } 
            : conv
        )
      );
    }, 5000);
  };

  const setTyping = (isTyping: boolean) => {
    if (!selectedConversationId || !selectedConversation) return;
    
    // Update typing status in the selected conversation
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversationId 
          ? { 
              ...conv, 
              isTyping: { 
                ...conv.isTyping, 
                [currentUser.id]: isTyping 
              } 
            } 
          : conv
      )
    );
    
    // If user starts typing, simulate the other user typing after a delay
    if (isTyping) {
      const otherUserId = selectedConversation.participants.find(
        id => id !== currentUser.id
      );
      
      if (!otherUserId) return;
      
      // Simulate other user typing after 2 seconds
      setTimeout(() => {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversationId 
              ? { 
                  ...conv, 
                  isTyping: { 
                    ...conv.isTyping, 
                    [otherUserId]: true 
                  } 
                } 
              : conv
          )
        );
        
        // Stop typing after 4 seconds
        setTimeout(() => {
          setConversations(prev => 
            prev.map(conv => 
              conv.id === selectedConversationId 
                ? { 
                    ...conv, 
                    isTyping: { 
                      ...conv.isTyping, 
                      [otherUserId]: false 
                    } 
                  } 
                : conv
            )
          );
        }, 4000);
      }, 2000);
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    // Find the message to add reaction to
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;
    
    // Create a new reaction
    const newReaction: Reaction = {
      id: Math.random().toString(36).substring(2),
      userId: currentUser.id,
      emoji,
      timestamp: new Date(),
    };
    
    // Add reaction to message
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              reactions: [...(msg.reactions || []), newReaction] 
            } 
          : msg
      )
    );
  };

  return (
    <MessageContext.Provider
      value={{
        conversations,
        selectedConversation,
        messages,
        selectConversation,
        sendMessage,
        setTyping,
        addReaction,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

// UI Context
interface UIContextType extends UIState {
  toggleMobileMenu: () => void;
  toggleDarkMode: () => void;
  closeMobileMenu: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check system preferences for dark mode on initial load
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDarkMode);
  }, []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <UIContext.Provider
      value={{
        isMobileMenuOpen,
        selectedConversationId: null,
        isDarkMode,
        toggleMobileMenu,
        toggleDarkMode,
        closeMobileMenu,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

// Combined providers
export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <UIProvider>
      <UserProvider>
        <MessageProvider>
          {children}
        </MessageProvider>
      </UserProvider>
    </UIProvider>
  );
};

// ======================================================
// COMPONENTS
// ======================================================

// This component ensures that its children are only rendered on the client side
// to avoid hydration errors with random values
const ClientWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only render children on the client side
  if (!isClient) {
    return <div className="h-full w-full flex items-center justify-center">
      <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
    </div>;
  }

  return <>{children}</>;
};

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

// Layout component
const Layout: React.FC<{ sidebar: React.ReactNode; content: React.ReactNode }> = ({ sidebar, content }) => {
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUI();

  // Handle sidebar visibility based on screen size
  const handleResize = () => {
    if (window.innerWidth >= 768 && isMobileMenuOpen) {
      closeMobileMenu();
    }
  };

  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen, closeMobileMenu, handleResize]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Desktop Sidebar - always visible on md and above */}
      <div className="hidden md:flex md:w-80 lg:w-96 h-full border-r border-border bg-background">
        {sidebar}
      </div>

      {/* Mobile Sidebar - only visible when menu is open */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="relative h-full w-full max-w-xs bg-background">
              {/* Sidebar Content */}
              <div className="h-full overflow-y-auto">{sidebar}</div>
              
              {/* Close button */}
              <button
                onClick={closeMobileMenu}
                className="absolute top-4 right-4 p-2 rounded-full bg-secondary text-secondary-foreground"
                aria-label="Close menu"
              >
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
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 -z-10 bg-black"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile header with menu button */}
        <header className="md:hidden flex items-center px-4 h-14 border-b border-border">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-foreground"
            aria-label="Open menu"
          >
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
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 className="ml-4 text-lg font-semibold">Messaging App</h1>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">{content}</div>
      </div>
    </div>
  );
};

// User List component
const UserList: React.FC = () => {
  const { users, currentUser, selectedUserId, setSelectedUserId, updateUserStatus } = useUser();
  const { conversations } = useMessage();
  const { isDarkMode, toggleDarkMode, closeMobileMenu } = useUI();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.statusMessage && user.statusMessage.toLowerCase().includes(searchQuery.toLowerCase())) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time consistently without locale-specific formatting
  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
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

// User item component
const UserItem: React.FC<{ user: User; isSelected: boolean; onSelect: () => void }> = ({ 
  user, 
  isSelected,
  onSelect 
}) => {
  const { closeMobileMenu } = useUI();
  const { conversations } = useMessage();
  
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

// Status Update component
const StatusUpdate: React.FC = () => {
  const { currentUser, updateUserStatus } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState(currentUser.statusMessage || '');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Status options with icons
  const statusOptions: { value: UserStatus; label: string; icon: React.ReactNode }[] = [
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

// EmojiPicker component
interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface EmojiCategory {
  name: string;
  icon: React.ReactNode;
  emojis: string[];
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, isOpen, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('smileys');
  
  // Emoji categories with corresponding emojis
  const categories: EmojiCategory[] = [
    {
      name: 'smileys',
      icon: <span>😊</span>,
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓']
    },
    {
      name: 'people',
      icon: <span>👋</span>,
      emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲']
    },
    {
      name: 'nature',
      icon: <span>🌿</span>,
      emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🌱', '🌲', '🌳', '🌴', '🌵', '🌷', '🌸', '🌹', '🌺', '🌻', '🌼', '🌽', '🌾']
    },
    {
      name: 'food',
      icon: <span>🍔</span>,
      emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘']
    },
    {
      name: 'travel',
      icon: <span>✈️</span>,
      emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '✈️']
    },
    {
      name: 'symbols',
      icon: <span>💯</span>,
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️']
    },
  ];

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle emoji selection
  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  // Get active category emojis
  const activeCategoryEmojis = categories.find(cat => cat.name === activeCategory)?.emojis || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full mb-2 left-0 bg-background border border-border rounded-lg shadow-lg p-2 z-10 w-64"
        >
          {/* Emoji grid */}
          <div className="h-40 overflow-y-auto mb-2 p-1">
            <div className="grid grid-cols-8 gap-1">
              {activeCategoryEmojis.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  onClick={() => handleEmojiClick(emoji)}
                  className="flex items-center justify-center p-1 text-lg hover:bg-secondary rounded"
                  aria-label={`Emoji ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          {/* Category tabs */}
          <div className="border-t border-border pt-2 flex justify-between">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`p-1.5 rounded-md text-lg ${
                  activeCategory === category.name ? 'bg-secondary/80' : 'hover:bg-secondary/50'
                }`}
                aria-label={`${category.name} category`}
              >
                {category.icon}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Message Status component
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

// Message Reactions component
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

// Typing indicator component
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

// Chat window component
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
          <svg width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M149.54 25C123.039 25 99.7661 39.3716 89.1552 63.2208C78.5443 87.0699 82.7483 114.854 99.9813 134.147C101.21 135.624 101.764 137.556 101.501 139.45L95.4073 175H149.54H203.673L197.579 139.45C197.316 137.556 197.87 135.624 199.099 134.147C216.332 114.854 220.536 87.0699 209.925 63.2208C199.314 39.3716 176.041 25 149.54 25Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M117.46 85C117.46 85 127.46 100 149.46 100C171.46 100 181.46 85 181.46 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="120" cy="65" r="5" fill="currentColor"/>
            <circle cx="180" cy="65" r="5" fill="currentColor"/>
          </svg>
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

// Main App Component
const MessagingApp = () => {
  return (
    <ClientWrapper>
      <Layout
        sidebar={<UserList />}
        content={<ChatWindow />}
      />
    </ClientWrapper>
  );
};

export default MessagingApp; 