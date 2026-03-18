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
      status
      createdAt
      updatedAt
    }
  }
`;
