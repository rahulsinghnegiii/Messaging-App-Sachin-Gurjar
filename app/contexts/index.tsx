"use client";

import React, { ReactNode } from 'react';
import { UserProvider } from './UserContext';
import { MessageProvider } from './MessageContext';
import { UIProvider } from './UIContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
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

export { useUI } from './UIContext';
export { useUser } from './UserContext';
export { useMessage } from './MessageContext'; 