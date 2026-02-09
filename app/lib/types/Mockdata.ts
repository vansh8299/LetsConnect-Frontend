import { Chat, User } from "./auth";

const createUser = (
  id: string,
  name: string,
  seed: string,
  status: "online" | "offline" | "away",
  lastSeen?: string,
): User => ({
  id,
  name,
  email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
  status,
  lastSeen,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const currentUser: User = createUser(
  "current-user",
  "You",
  "current",
  "online",
);

export const mockChats: Chat[] = [
  {
    id: "1",
    user: createUser("user-1", "Sarah Johnson", "Sarah", "online"),
    lastMessage: "Hey! How are you doing?",
    lastMessageTime: "2:30 PM",
    unreadCount: 2,
    messages: [
      {
        id: "m1",
        senderId: "user-1",
        content: "Hey! How are you doing?",
        timestamp: "2:30 PM",
        status: "delivered",
      },
      {
        id: "m2",
        senderId: "current-user",
        content: "Hi Sarah! I'm doing great, thanks for asking!",
        timestamp: "2:31 PM",
        status: "read",
      },
      {
        id: "m3",
        senderId: "user-1",
        content:
          "That's wonderful to hear! Are we still on for the meeting tomorrow?",
        timestamp: "2:32 PM",
        status: "delivered",
      },
      {
        id: "m4",
        senderId: "current-user",
        content: "Yes, absolutely! 10 AM sharp.",
        timestamp: "2:33 PM",
        status: "read",
      },
    ],
  },
  {
    id: "2",
    user: createUser("user-2", "Michael Chen", "Michael", "away"),
    lastMessage: "Can you send me the report?",
    lastMessageTime: "1:15 PM",
    unreadCount: 0,
    messages: [
      {
        id: "m5",
        senderId: "user-2",
        content: "Hi, can you send me the report?",
        timestamp: "1:15 PM",
        status: "read",
      },
      {
        id: "m6",
        senderId: "current-user",
        content: "Sure, I'll send it right away!",
        timestamp: "1:16 PM",
        status: "read",
      },
    ],
  },
  {
    id: "3",
    user: createUser(
      "user-3",
      "Emily Rodriguez",
      "Emily",
      "offline",
      "Last seen today at 11:20 AM",
    ),
    lastMessage: "Thanks for your help!",
    lastMessageTime: "11:20 AM",
    unreadCount: 0,
    messages: [
      {
        id: "m7",
        senderId: "current-user",
        content: "Did you need any help with the project?",
        timestamp: "11:15 AM",
        status: "read",
      },
      {
        id: "m8",
        senderId: "user-3",
        content: "Thanks for your help!",
        timestamp: "11:20 AM",
        status: "read",
      },
    ],
  },
  {
    id: "4",
    user: createUser("user-4", "David Kim", "David", "online"),
    lastMessage: "Let's catch up soon!",
    lastMessageTime: "Yesterday",
    unreadCount: 1,
    messages: [
      {
        id: "m9",
        senderId: "user-4",
        content: "Let's catch up soon!",
        timestamp: "Yesterday at 5:45 PM",
        status: "delivered",
      },
    ],
  },
  {
    id: "5",
    user: createUser("user-5", "Jessica Taylor", "Jessica", "online"),
    lastMessage: "Perfect! See you then.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "m10",
        senderId: "current-user",
        content: "Want to grab coffee tomorrow?",
        timestamp: "Yesterday at 3:20 PM",
        status: "read",
      },
      {
        id: "m11",
        senderId: "user-5",
        content: "Perfect! See you then.",
        timestamp: "Yesterday at 3:22 PM",
        status: "read",
      },
    ],
  },
  {
    id: "6",
    user: createUser("user-6", "Alex Martinez", "Alex", "away"),
    lastMessage: "Got it, thanks!",
    lastMessageTime: "2 days ago",
    unreadCount: 0,
    messages: [
      {
        id: "m12",
        senderId: "user-6",
        content: "Got it, thanks!",
        timestamp: "2 days ago at 4:15 PM",
        status: "read",
      },
    ],
  },
];

export const allUsers: User[] = [
  currentUser,
  ...mockChats.map((chat) => chat.user),
  createUser("user-7", "Rachel Green", "Rachel", "offline"),
  createUser("user-8", "Tom Wilson", "Tom", "online"),
];
