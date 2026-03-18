// lib/graphql/mutations/auth.mutations.ts
import { gql } from "@apollo/client";

export const SIGNUP_MUTATION = gql`
  mutation Signup(
    $email: String!
    $password: String!
    $name: String!
    $profilePicture: String
  ) {
    signup(
      email: $email
      password: $password
      name: $name
      profilePicture: $profilePicture
    ) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        about
        profilePicture
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
        about
        profilePicture
        googleId
        createdAt
        updatedAt
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refresh(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      user {
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
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile(
    $firstName: String
    $lastName: String
    $about: String
    $profilePicture: String
  ) {
    updateProfile(
      firstName: $firstName
      lastName: $lastName
      about: $about
      profilePicture: $profilePicture
    ) {
      id
      email
      name
      firstName
      lastName
      about
      profilePicture
      createdAt
      updatedAt
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;
