// User status options
export type UserStatus = 'online' | 'offline' | 'away' | 'busy' | 'do-not-disturb';

// User interface
export interface User {
  id: string;
  name: string;
  avatar: string; // URL to avatar image from randomuser.me
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
  participants: string[]; // User IDs
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