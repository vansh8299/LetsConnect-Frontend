// app/(pages)/chats/page.tsx
"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { mockChats, currentUser } from "@/app/lib/types/Mockdata";
import { Message } from "@/app/lib/types/auth.types";
import AllUsersPanel from "@/app/components/ui/AllUsersPanel";
import FriendRequestsPanel from "@/app/components/ui/FriendRequestsPanel";
import {
  useGetAllUsers,
  useFriendRequests,
  useOnlineStatus,
  useUserStatusSubscription,
} from "@/app/lib/hooks";

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

type SidebarView = "chats" | "users" | "requests";

export default function ChatsPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats, setChats] = useState(mockChats);
  const [sidebarView, setSidebarView] = useState<SidebarView>("chats");

  const { users } = useGetAllUsers();
  const { friendRequests, loading: requestsLoading } = useFriendRequests();

  // Set own online status + subscribe to others' status changes
  useOnlineStatus();
  useUserStatusSubscription();

  const selectedChat = useMemo(
    () => chats.find((c) => c.id === activeChat),
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
    setChats((prev) =>
      prev.map((chat) =>
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
    setTimeout(() => {
      setChats((prev) =>
        prev.map((chat) => ({
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
      setChats((prev) =>
        prev.map((chat) => ({
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
      <div className="flex-shrink-0">
        <IconSidebar
          currentUser={{
            name: currentUser.name || "User",
            profilePicture: currentUser.profilePicture || "",
          }}
          pendingRequestCount={friendRequests.length}
          onTabChange={(tab) => setSidebarView(tab as SidebarView)}
        />
      </div>

      {sidebarView === "chats" && (
        <div className="w-[30%] flex-shrink-0">
          <ChatListSidebar
            chats={chats}
            activeChat={activeChat}
            onChatSelect={setActiveChat}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {sidebarView === "users" ? (
          <AllUsersPanel
            users={users}
            currentUserId={currentUser.id}
            onStartChat={(id) => {
              setSidebarView("chats");
              setActiveChat(id);
            }}
          />
        ) : sidebarView === "requests" ? (
          <FriendRequestsPanel
            requests={friendRequests}
            loading={requestsLoading}
          />
        ) : (
          <ChatArea
            selectedChat={selectedChat}
            currentUserId={currentUser.id}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
}
