"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { mockChats, currentUser } from "@/app/lib/types/Mockdata";
import { Message } from "@/app/lib/types/auth";

// Dynamic imports for better code splitting
const IconSidebar = dynamic(() => import("@/app/components/ui/IconSidebar"), {
  loading: () => (
    <div className="w-16 animate-pulse bg-slate-200 dark:bg-slate-800" />
  ),
});

const ChatListSidebar = dynamic(
  () => import("@/app/components/ui/Chatlistsidebar"),
  {
    loading: () => (
      <div className="w-full animate-pulse bg-slate-100 dark:bg-slate-900" />
    ),
  },
);

const ChatArea = dynamic(() => import("@/app/components/ui/ChatArea"), {
  loading: () => (
    <div className="flex-1 animate-pulse bg-slate-50 dark:bg-slate-950" />
  ),
});

export default function ChatsPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats, setChats] = useState(mockChats);

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === activeChat),
    [activeChat, chats],
  );

  const handleSendMessage = (content: string) => {
    if (!activeChat) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      content,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      status: "sent",
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: content,
              lastMessageTime: "Just now",
            }
          : chat,
      ),
    );

    // Simulate message status updates
    setTimeout(() => {
      setChats((prevChats) =>
        prevChats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((msg: any) =>
            msg.id === newMessage.id
              ? { ...msg, status: "delivered" as const }
              : msg,
          ),
        })),
      );
    }, 1000);

    setTimeout(() => {
      setChats((prevChats) =>
        prevChats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((msg: any) =>
            msg.id === newMessage.id
              ? { ...msg, status: "read" as const }
              : msg,
          ),
        })),
      );
    }, 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      {/* Left Icon Sidebar - 10% */}
      <div className="flex-shrink-0">
        <IconSidebar currentUser={currentUser} />
      </div>

      {/* Chat List Sidebar - 30% */}
      <div className="w-[30%] flex-shrink-0">
        <ChatListSidebar
          chats={chats}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
        />
      </div>

      {/* Main Chat Area - Remaining space */}
      <div className="flex flex-1 flex-col">
        <ChatArea
          selectedChat={selectedChat}
          currentUserId={currentUser.id}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
