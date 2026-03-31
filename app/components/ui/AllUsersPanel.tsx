// app/components/ui/AllUsersPanel.tsx
"use client";

import { useState } from "react";
import {
  Search,
  MessageSquare,
  UserPlus,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { useSendFriendRequest } from "@/app/lib/hooks";
import { User, FriendRequestStatus } from "@/app/lib/types/auth.types";

interface AllUsersPanelProps {
  users: User[];
  currentUserId: string;
  onStartChat?: (userId: string) => void;
}

function UserAvatar({
  src,
  name,
  size = "md",
}: {
  src?: string;
  name: string;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "h-11 w-11 text-sm" : "h-8 w-8 text-xs";
  const initial = name?.trim().charAt(0).toUpperCase() || "?";
  if (src)
    return (
      <img
        src={src}
        alt={name}
        className={`${dim} rounded-2xl object-cover flex-shrink-0`}
      />
    );
  return (
    <div
      className={`${dim} rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-semibold text-white flex-shrink-0`}
    >
      {initial}
    </div>
  );
}

function RequestButton({
  userId,
  status,
  onStartChat,
}: {
  userId: string;
  status?: FriendRequestStatus | null;
  onStartChat?: (id: string) => void;
}) {
  const { sendRequest, loading } = useSendFriendRequest();
  const [optimisticStatus, setOptimisticStatus] =
    useState<FriendRequestStatus | null>(status ?? null);

  const handleSend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptimisticStatus(FriendRequestStatus.PENDING);
    try {
      await sendRequest(userId);
    } catch {
      setOptimisticStatus(status ?? null);
    }
  };

  if (optimisticStatus === FriendRequestStatus.ACCEPTED) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStartChat?.(userId);
        }}
        className="h-8 w-8 rounded-xl flex items-center justify-center text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
        title="Send message"
      >
        <MessageSquare className="h-4 w-4" />
      </button>
    );
  }

  if (optimisticStatus === FriendRequestStatus.PENDING) {
    return (
      <button
        disabled
        className="h-8 w-8 rounded-xl flex items-center justify-center text-amber-400 cursor-default"
        title="Request sent"
      >
        <Clock className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={loading}
      className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-400 transition-all disabled:opacity-50"
      title="Send friend request"
    >
      <UserPlus className="h-4 w-4" />
    </button>
  );
}

export default function AllUsersPanel({
  users,
  currentUserId,
  onStartChat,
}: AllUsersPanelProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "friends">("all");

  const filtered = users
    .filter((u) => u.id !== currentUserId)
    .filter((u) => {
      const matchSearch =
        (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ||
        (filter === "online" && u.isOnline) ||
        (filter === "friends" &&
          u.friendRequestStatus === FriendRequestStatus.ACCEPTED);
      return matchSearch && matchFilter;
    });

  // Exclude self from counts too
  const otherUsers = users.filter((u) => u.id !== currentUserId);
  const onlineCount = otherUsers.filter((u) => u.isOnline).length;
  const friendCount = otherUsers.filter(
    (u) => u.friendRequestStatus === FriendRequestStatus.ACCEPTED,
  ).length;

  const formatLastSeen = (lastSeen?: string | null) => {
    if (!lastSeen) return "Offline";
    const date = new Date(lastSeen);
    if (isNaN(date.getTime())) return "Offline";
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              All Users
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {otherUsers.length} members · {onlineCount} online · {friendCount}{" "}
              friends
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs text-slate-400">{onlineCount} active</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mt-3">
          {(["all", "online", "friends"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {f === "all"
                ? `All (${otherUsers.length})`
                : f === "online"
                  ? `Online (${onlineCount})`
                  : `Friends (${friendCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400">No users found</p>
          </div>
        ) : (
          filtered.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group cursor-pointer"
            >
              {/* Avatar + online dot */}
              <div className="relative flex-shrink-0">
                <UserAvatar src={user.profilePicture} name={user.name ?? "?"} />
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user.name || "Unnamed User"}
                  </p>
                  {user.friendRequestStatus ===
                    FriendRequestStatus.ACCEPTED && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-medium flex-shrink-0">
                      Friend
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>

              {/* Status text */}
              <span
                className={`text-xs flex-shrink-0 hidden sm:block ${
                  user.isOnline ? "text-emerald-500" : "text-slate-400"
                }`}
              >
                {user.isOnline ? "Online" : formatLastSeen(user.lastSeen)}
              </span>

              {/* Action buttons — visible on hover */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <RequestButton
                  userId={user.id}
                  status={user.friendRequestStatus}
                  onStartChat={onStartChat}
                />
                <button
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  title="More options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
