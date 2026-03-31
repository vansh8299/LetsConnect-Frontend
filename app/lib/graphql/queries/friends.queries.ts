// lib/graphql/queries/friends.queries.ts
import { gql } from "@apollo/client";

export const GET_FRIEND_REQUESTS_QUERY = gql`
  query GetFriendRequests {
    friendRequests {
      id
      senderId
      receiverId
      status
      createdAt
      sender {
        id
        name
        email
        profilePicture
        isOnline
      }
    }
  }
`;

export const SEND_FRIEND_REQUEST_MUTATION = gql`
  mutation SendFriendRequest($receiverId: ID!) {
    sendFriendRequest(receiverId: $receiverId) {
      id
      status
      receiverId
    }
  }
`;

export const ACCEPT_FRIEND_REQUEST_MUTATION = gql`
  mutation AcceptFriendRequest($requestId: ID!) {
    acceptFriendRequest(requestId: $requestId) {
      id
      status
    }
  }
`;

export const REJECT_FRIEND_REQUEST_MUTATION = gql`
  mutation RejectFriendRequest($requestId: ID!) {
    rejectFriendRequest(requestId: $requestId) {
      id
      status
    }
  }
`;

export const SET_ONLINE_STATUS_MUTATION = gql`
  mutation SetOnlineStatus($isOnline: Boolean!) {
    setOnlineStatus(isOnline: $isOnline) {
      id
      isOnline
      lastSeen
    }
  }
`;

export const FRIEND_REQUEST_RECEIVED_SUBSCRIPTION = gql`
  subscription FriendRequestReceived {
    friendRequestReceived {
      id
      senderId
      status
      sender {
        id
        name
        email
        profilePicture
      }
    }
  }
`;

export const USER_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription UserStatusChanged {
    userStatusChanged {
      id
      isOnline
      lastSeen
    }
  }
`;
