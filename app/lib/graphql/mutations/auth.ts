// lib/graphql/mutations/auth.ts
import { gql } from "@apollo/client";

export const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $password: String!, $name: String) {
    signup(email: $email, password: $password, name: $name) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        createdAt
        updatedAt
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        createdAt
        updatedAt
      }
    }
  }
`;

export const REFRESH_MUTATION = gql`
  mutation Refresh($refreshToken: String!) {
    refresh(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        createdAt
        updatedAt
      }
    }
  }
`;
