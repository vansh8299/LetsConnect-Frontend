// lib/graphql/queries/auth.queries.ts
import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      about
      profilePicture
      googleId
      createdAt
      updatedAt
    }
  }
`;
export const GET_ALL_USERS_QUERY = gql`
  query GetAllUsers {
    users {
      id
      email
      name
      about
      profilePicture
      googleId
      isVerified
      isOnline
      lastSeen
      friendRequestStatus
      createdAt
      updatedAt
    }
  }
`;
