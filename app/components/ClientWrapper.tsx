"use client";

import React, { useEffect, useState } from 'react';

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

export default ClientWrapper; 