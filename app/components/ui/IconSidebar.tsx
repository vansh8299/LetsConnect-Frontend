"use client";

import { MessageSquare, Radio, Users, User } from "lucide-react";
import { useState } from "react";

interface IconSidebarProps {
  currentUser: {
    name: string;
    avatar: string;
  };
}

const IconSidebar = ({ currentUser }: IconSidebarProps) => {
  const [activeTab, setActiveTab] = useState<
    "chats" | "status" | "users" | "profile"
  >("chats");

  const menuItems = [
    { id: "chats" as const, icon: MessageSquare, label: "Chats" },
    { id: "status" as const, icon: Radio, label: "Status" },
    { id: "users" as const, icon: Users, label: "All Users" },
  ];

  return (
    <div className="flex h-screen w-16 flex-col items-center justify-between border-r border-slate-200 bg-gradient-to-b from-indigo-600 to-purple-700 py-6 dark:border-slate-800 dark:from-indigo-900 dark:to-purple-900">
      {/* Top Menu Items */}
      <div className="flex flex-col items-center gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-white text-indigo-600 shadow-lg dark:bg-slate-800 dark:text-indigo-400"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              title={item.label}
            >
              <Icon className="h-5 w-5" />

              {/* Tooltip */}
              <span className="absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg group-hover:block dark:bg-slate-700">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Profile */}
      <button
        onClick={() => setActiveTab("profile")}
        className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
          activeTab === "profile"
            ? "ring-2 ring-white ring-offset-2 ring-offset-indigo-600 dark:ring-offset-indigo-900"
            : "hover:ring-2 hover:ring-white/50"
        }`}
        title="Profile"
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="h-10 w-10 rounded-xl object-cover"
        />

        {/* Online Status Indicator */}
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-indigo-600 bg-green-500 dark:border-indigo-900"></span>

        {/* Tooltip */}
        <span className="absolute left-full ml-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg group-hover:block dark:bg-slate-700">
          Profile
        </span>
      </button>
    </div>
  );
};

export default IconSidebar;
