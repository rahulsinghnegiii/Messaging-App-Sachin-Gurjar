"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Conversation, Message, Reaction } from '../types';
import { 
  mockConversations, 
  getMockMessagesForConversation, 
  sendMessage as sendMockMessage 
} from '../mockData';
import { useUser } from './UserContext';

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
    const newMessage = sendMockMessage(selectedConversationId, content);
    
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