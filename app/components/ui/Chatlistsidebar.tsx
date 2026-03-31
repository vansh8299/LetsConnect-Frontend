// app/components/ui/ChatListSidebar.tsx
"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { Chat } from "@/app/lib/types/auth.types";

interface ChatListSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
}

const ChatListSidebar = ({
  chats,
  activeChat,
  onChatSelect,
}: ChatListSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.user.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (isOnline: boolean, lastSeen: string | null) => {
    if (isOnline) return "bg-green-500";
    if (!lastSeen) return "bg-slate-400";
    // Recently seen within 5 minutes = away
    const diff = Date.now() - new Date(lastSeen).getTime();
    return diff < 5 * 60 * 1000 ? "bg-yellow-500" : "bg-slate-400";
  };

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return "";
    const date = new Date(lastSeen);
    if (isNaN(date.getTime())) return "";
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="flex h-screen w-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:border-slate-800 dark:from-slate-800 dark:to-slate-900">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Messages
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {chats.length} conversation{chats.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search Bar */}
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">
              No conversations found
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredChats.map((chat) => {
              const isActive = activeChat === chat.id;

              return (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    isActive ? "bg-indigo-50 dark:bg-indigo-950/30" : ""
                  }`}
                >
                  {/* Avatar with Status */}
                  <div className="relative flex-shrink-0">
                    {chat.user.profilePicture ? (
                      <img
                        src={chat.user.profilePicture}
                        alt={chat.user.name ?? "User"}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {chat.user.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${getStatusColor(chat.user.isOnline, chat.user.lastSeen)}`}
                    />
                  </div>

                  {/* Chat Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                        {chat.user.name ?? "Unnamed User"}
                      </h3>
                      <span className="flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
                        {chat.lastMessageTime}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                        {chat.lastMessage}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    {/* Last seen for offline users */}
                    {!chat.user.isOnline && chat.user.lastSeen && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatLastSeen(chat.user.lastSeen)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatListSidebar;
