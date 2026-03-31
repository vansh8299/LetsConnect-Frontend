// lib/types/auth.types.ts

export enum FriendRequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  about?: string;
  profilePicture?: string;
  googleId?: string;
  isOnline: boolean;
  lastSeen: string | null;
  isVerified?: boolean;
  friendRequestStatus?: FriendRequestStatus | null;
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

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  sender: User;
  receiver?: User;
  createdAt: string;
  updatedAt?: string;
}

// ─── GraphQL Query Response Types ─────────────────────────────────────────────

export interface GetAllUsersResponse {
  users: User[];
}

export interface GetFriendRequestsResponse {
  friendRequests: FriendRequest[];
}

// ─── GraphQL Mutation Response Types ──────────────────────────────────────────

export interface SendFriendRequestResponse {
  sendFriendRequest: Pick<FriendRequest, "id" | "status" | "receiverId">;
}

export interface AcceptFriendRequestResponse {
  acceptFriendRequest: Pick<FriendRequest, "id" | "status">;
}

export interface RejectFriendRequestResponse {
  rejectFriendRequest: Pick<FriendRequest, "id" | "status">;
}

export interface SetOnlineStatusResponse {
  setOnlineStatus: Pick<User, "id" | "isOnline" | "lastSeen">;
}

// ─── GraphQL Subscription Response Types ──────────────────────────────────────

export interface UserStatusChangedSubscription {
  userStatusChanged: Pick<User, "id" | "isOnline" | "lastSeen">;
}

export interface FriendRequestReceivedSubscription {
  friendRequestReceived: FriendRequest;
}
