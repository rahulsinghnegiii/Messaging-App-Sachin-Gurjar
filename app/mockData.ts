import { User, Message, Conversation, MessageStatus } from './types';

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