"use client";

import ClientWrapper from './components/ClientWrapper';
import Layout from './components/Layout';
import UserList from './components/UserList';
import ChatWindow from './components/ChatWindow';

export default function Home() {
  return (
    <ClientWrapper>
      <Layout 
        sidebar={<UserList />}
        content={<ChatWindow />}
      />
    </ClientWrapper>
  );
}
