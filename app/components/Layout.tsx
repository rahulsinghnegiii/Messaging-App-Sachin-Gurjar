"use client";

import React from 'react';
import { useUI } from '../contexts';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ sidebar, content }) => {
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
  }, [isMobileMenuOpen, closeMobileMenu]);

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

export default Layout; 