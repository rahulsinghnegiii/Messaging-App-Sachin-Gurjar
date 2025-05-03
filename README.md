# Real-Time Messaging App

A modern, responsive real-time messaging application built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Real-time messaging** with typing indicators and message status (sending, sent, delivered, read)
- **User status management** (online, offline, away, busy, do-not-disturb)
- **Message reactions** with emoji picker
- **Responsive design** that works across mobile, tablet, and desktop
- **Dark mode support** with system preference detection
- **Animated interactions** for an engaging user experience

## Tech Stack

- **Next.js** - React framework for server-rendered applications
- **TypeScript** - For type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Framer Motion** - Animation library for React
- **Context API** - For state management

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `/app` - Application code
  - `/components` - UI components
  - `/contexts` - Context providers for state management
  - `/types.ts` - TypeScript interfaces and types
  - `/mockData.ts` - Mock data for development
  - `/consolidated-app.tsx` - Single file containing all components (per requirements)

## Consolidated Version

The application has been implemented in two ways:

1. **Modular Structure**: For better development experience and code organization, the application is built with a proper modular structure separating components, contexts, and utilities.

2. **Single-File Implementation**: As per the project requirements, we've also created a consolidated version in `app/consolidated-app.tsx` that contains all the necessary code in a single TypeScript file. This version is functionally identical to the modular one but organized within a single file.

## Features in Detail

### Messaging

- Send and receive text messages
- See when messages are sent, delivered, and read
- Add emoji reactions to messages
- See typing indicators when someone is composing a message

### User Management

- View online/offline status of contacts
- Update your own status and status message
- See when a user was last active

### UI/UX

- Dark/light mode toggle
- Responsive layout with mobile navigation
- Animated interactions for a polished feel
- Accessible design with keyboard navigation support

## Development Approach

This project follows a component-based architecture with React Context for state management. The UI is built using Tailwind CSS for styling and Framer Motion for animations.

The application is designed to be a single-page application with a responsive layout that works well on all devices. The UI is designed to be clean, modern, and intuitive.

## License

This project is open-source software licensed under the MIT license.

## Acknowledgements

- Design inspiration from modern messaging applications
- Avatar images from [Random User API](https://randomuser.me/)
- Icons from [Feather Icons](https://feathericons.com/)
