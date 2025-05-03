# Usage Guide - Messaging App

This document provides instructions on how to run and use both the modular version and the single-file consolidated version of the messaging app.

## Running the Modular Version

The modular version is the default setup with proper code organization across multiple files:

1. Start the development server:
```bash
npm run dev
# or
yarn dev
```

2. Open your browser and navigate to `http://localhost:3000`

The modular version is organized in a maintainable file structure:
- `/app/components/` - UI components
- `/app/contexts/` - State management
- `/app/types.ts` - Type definitions
- `/app/mockData.ts` - Data simulation

## Running the Consolidated Version

The consolidated version contains all code in a single file as required by the project specification:

1. Create a new page that imports the consolidated app (add the following to `/app/consolidated.tsx`):

```tsx
"use client";

import MessagingApp from './consolidated-app';

export default function ConsolidatedPage() {
  return <MessagingApp />;
}
```

2. Start the development server if not already running:
```bash
npm run dev
# or
yarn dev
```

3. Navigate to `http://localhost:3000/consolidated` to view the single-file implementation

## App Usage

### User Management

1. **Changing Your Status**: Click on your current status in the sidebar to open the status dropdown
2. **Setting a Status Message**: Enter a custom message in the status update panel
3. **Viewing User Status**: User status is indicated by colored dots:
   - Green: Online
   - Yellow: Away
   - Red: Busy or Do Not Disturb
   - Gray: Offline

### Messaging

1. **Selecting a Conversation**: Click on a user in the sidebar to start or continue a conversation
2. **Sending Messages**: Type in the message input field and press Enter or click the send button
3. **Adding Reactions**: Hover over a message and click the emoji button to add a reaction
4. **Using Emojis**: Click the emoji button in the message input to open the emoji picker

### UI Features

1. **Dark Mode**: Toggle between light and dark mode using the button in the top-right of the sidebar
2. **Mobile View**: On smaller screens, use the menu button to open and close the sidebar
3. **Search**: Use the search box in the sidebar to filter users (UI only, not functional in this demo)

## Technical Notes

Both versions of the app have identical functionality. The only difference is code organization:

- **Modular Version**: Better for development, maintenance, and collaboration
- **Consolidated Version**: Meets the project requirement of a single file implementation

Both implementations:
- Use TypeScript for type safety
- Are styled with Tailwind CSS
- Use Framer Motion for animations
- Implement responsive design principles
- Use React Context for state management 