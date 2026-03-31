"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  SIGNUP_MUTATION,
  LOGIN_MUTATION,
  REFRESH_TOKEN_MUTATION,
  UPDATE_PROFILE_MUTATION,
  LOGOUT_MUTATION,
} from "../graphql/mutations/auth.mutations";
import { ME_QUERY } from "../graphql/queries/auth.queries";
import {
  AuthPayload,
  User,
  SignupInput,
  LoginInput,
  UpdateProfileInput,
} from "../types/auth.types";

export const useSignup = () => {
  const [signup, { loading, error, data }] = useMutation<{
    signup: AuthPayload;
  }>(SIGNUP_MUTATION);

  return {
    signup: async (input: SignupInput & { profilePicture?: string }) => {
      const result = await signup({ variables: input });
      return result.data?.signup;
    },
    loading,
    error,
    user: data?.signup.user,
  };
};

export const useLogin = () => {
  const [login, { loading, error, data }] = useMutation<{ login: AuthPayload }>(
    LOGIN_MUTATION,
  );

  return {
    login: async (input: LoginInput) => {
      const result = await login({ variables: input });
      return result.data?.login;
    },
    loading,
    error,
    user: data?.login.user,
  };
};

export const useMe = () => {
  const { data, loading, error, refetch } = useQuery<{ me: User }>(ME_QUERY, {
    errorPolicy: "all",
  });

  return {
    user: data?.me || null,
    loading,
    error,
    refetch,
  };
};

export const useRefreshToken = () => {
  const [refresh, { loading, error }] = useMutation<{ refresh: AuthPayload }>(
    REFRESH_TOKEN_MUTATION,
  );

  return {
    refreshToken: async (refreshToken: string) => {
      const result = await refresh({ variables: { refreshToken } });
      return result.data?.refresh;
    },
    loading,
    error,
  };
};

export const useUpdateProfile = () => {
  const [updateProfile, { loading, error, data }] = useMutation<{
    updateProfile: User;
  }>(UPDATE_PROFILE_MUTATION);

  return {
    updateProfile: async (input: UpdateProfileInput) => {
      const result = await updateProfile({ variables: input });
      return result.data?.updateProfile;
    },
    loading,
    error,
    user: data?.updateProfile,
  };
};

export const useLogout = () => {
  const [logout, { loading, error }] = useMutation(LOGOUT_MUTATION);

  return {
    logout: async () => {
      await logout();
    },
    loading,
    error,
  };
};
