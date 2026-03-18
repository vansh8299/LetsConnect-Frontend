// lib/types/auth.types.ts

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  about?: string;
  profilePicture?: string;
  googleId?: string;
  status?: "online" | "offline" | "away";
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  about?: string;
  profilePicture?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

export interface Chat {
  id: string;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}
