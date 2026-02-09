"use client";

import {
  Phone,
  Video,
  MoreVertical,
  Search,
  Smile,
  Paperclip,
  Mic,
  Send,
  MessageSquare,
  Check,
  CheckCheck,
} from "lucide-react";
import { useState, KeyboardEvent } from "react";
import { Chat, Message } from "@/app/lib/types/auth";

interface ChatAreaProps {
  selectedChat: Chat | undefined;
  currentUserId: string;
  onSendMessage: (message: string) => void;
}

const ChatArea = ({
  selectedChat,
  currentUserId,
  onSendMessage,
}: ChatAreaProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Empty State - When no chat is selected
  if (!selectedChat) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white p-8 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950">
            <MessageSquare className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            Welcome to Messages
          </h2>
          <p className="max-w-md text-slate-600 dark:text-slate-400">
            Select a conversation from the sidebar to start chatting, or begin a
            new conversation with someone from your contacts.
          </p>
        </div>
      </div>
    );
  }

  // Active Chat View
  return (
    <div className="flex h-screen flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedChat.user.avatar}
              alt={selectedChat.user.name}
              className="h-11 w-11 rounded-full object-cover"
            />
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
                selectedChat.user.status === "online"
                  ? "bg-green-500"
                  : selectedChat.user.status === "away"
                    ? "bg-yellow-500"
                    : "bg-slate-400"
              }`}
            ></span>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {selectedChat.user.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {selectedChat.user.status === "online"
                ? "Active now"
                : selectedChat.user.status === "away"
                  ? "Away"
                  : selectedChat.user.lastSeen || "Offline"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Search in conversation"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Voice call"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Video call"
          >
            <Video className="h-5 w-5" />
          </button>
          <button
            className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="More options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-6 dark:from-slate-950 dark:to-slate-900">
        <div className="mx-auto max-w-4xl space-y-4">
          {selectedChat.messages.map((msg, index) => {
            const isCurrentUser = msg.senderId === currentUserId;
            const showTimestamp =
              index === 0 ||
              selectedChat.messages[index - 1].timestamp !== msg.timestamp;

            return (
              <div key={msg.id}>
                {/* Timestamp Divider */}
                {showTimestamp && (
                  <div className="mb-4 flex items-center justify-center">
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`group relative max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      isCurrentUser
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
                        : "bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
                    }`}
                  >
                    <p className="break-words text-sm leading-relaxed">
                      {msg.content}
                    </p>

                    {/* Message Status & Time */}
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <span
                        className={`text-xs ${
                          isCurrentUser
                            ? "text-white/70"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {msg.timestamp.split(" ").pop()}
                      </span>
                      {isCurrentUser && (
                        <span className="text-white/70">
                          {msg.status === "sent" && (
                            <Check className="h-3 w-3" />
                          )}
                          {msg.status === "delivered" && (
                            <CheckCheck className="h-3 w-3" />
                          )}
                          {msg.status === "read" && (
                            <CheckCheck className="h-3 w-3 text-blue-300" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Tail */}
                    <div
                      className={`absolute top-0 ${
                        isCurrentUser ? "-right-2" : "-left-2"
                      } h-4 w-4 ${
                        isCurrentUser
                          ? "bg-gradient-to-br from-indigo-600 to-purple-600"
                          : "bg-white dark:bg-slate-800"
                      }`}
                      style={{
                        clipPath: isCurrentUser
                          ? "polygon(0 0, 100% 0, 0 100%)"
                          : "polygon(0 0, 100% 0, 100% 100%)",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-end gap-3">
          {/* Action Buttons - Left */}
          <div className="flex items-center gap-1 pb-2">
            <button
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              title="Emoji"
            >
              <Smile className="h-5 w-5" />
            </button>
            <button
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </div>

          {/* Message Input */}
          <div className="relative flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="max-h-32 min-h-[44px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
              style={{
                height: "auto",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </div>

          {/* Send/Voice Button */}
          {message.trim() ? (
            <button
              onClick={handleSend}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white transition-all hover:shadow-lg hover:shadow-indigo-500/30"
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              title="Voice message"
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
