// app/components/ui/FriendRequestsPanel.tsx
"use client";

import { UserCheck, UserX, Users } from "lucide-react";
import { useRespondToFriendRequest } from "@/app/lib/hooks";

interface FriendRequest {
  id: string;
  senderId: string;
  status: string;
  createdAt: string;
  sender: {
    id: string;
    name?: string;
    email: string;
    profilePicture?: string;
  };
}

interface FriendRequestsPanelProps {
  requests: FriendRequest[];
  loading?: boolean;
}

function UserAvatar({ src, name }: { src?: string; name: string }) {
  const initial = name?.trim().charAt(0).toUpperCase() || "?";
  if (src)
    return (
      <img
        src={src}
        alt={name}
        className="h-11 w-11 rounded-2xl object-cover flex-shrink-0"
      />
    );
  return (
    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-semibold text-white text-sm flex-shrink-0">
      {initial}
    </div>
  );
}

function timeAgo(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function FriendRequestsPanel({
  requests,
  loading,
}: FriendRequestsPanelProps) {
  const {
    acceptRequest,
    rejectRequest,
    loading: responding,
  } = useRespondToFriendRequest();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Friend Requests
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {requests.length} pending{" "}
          {requests.length === 1 ? "request" : "requests"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400">No pending requests</p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900"
            >
              <UserAvatar
                src={req.sender.profilePicture}
                name={req.sender.name ?? "?"}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {req.sender.name || "Unnamed User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {req.sender.email}
                </p>
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-0.5">
                  {timeAgo(req.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => acceptRequest(req.id)}
                  disabled={responding}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all disabled:opacity-50"
                  title="Accept"
                >
                  <UserCheck className="h-4 w-4" />
                </button>
                <button
                  onClick={() => rejectRequest(req.id)}
                  disabled={responding}
                  className="h-8 w-8 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all disabled:opacity-50"
                  title="Reject"
                >
                  <UserX className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
