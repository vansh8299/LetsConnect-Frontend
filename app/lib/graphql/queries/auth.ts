// lib/graphql/queries/auth.ts
import { gql } from "@apollo/client";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      createdAt
      updatedAt
    }
  }
`;
