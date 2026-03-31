"use client";

import { useMutation } from "@apollo/client/react";
import {
  SEND_PASSWORD_RESET_OTP_MUTATION,
  VERIFY_PASSWORD_RESET_OTP_MUTATION,
  RESET_PASSWORD_MUTATION,
} from "../graphql/mutations/forgot-password.mutations";

type OtpResponse = { success: boolean; message: string };

export const useSendPasswordResetOtp = () => {
  const [mutate, { loading, error }] = useMutation<{
    sendPasswordResetOtp: OtpResponse;
  }>(SEND_PASSWORD_RESET_OTP_MUTATION);

  return {
    sendPasswordResetOtp: async (email: string) => {
      const result = await mutate({ variables: { email } });
      return result.data?.sendPasswordResetOtp;
    },
    loading,
    error,
  };
};

export const useVerifyPasswordResetOtp = () => {
  const [mutate, { loading, error }] = useMutation<{
    verifyPasswordResetOtp: OtpResponse;
  }>(VERIFY_PASSWORD_RESET_OTP_MUTATION);

  return {
    verifyPasswordResetOtp: async (email: string, otp: string) => {
      const result = await mutate({ variables: { email, otp } });
      return result.data?.verifyPasswordResetOtp;
    },
    loading,
    error,
  };
};

export const useResetPassword = () => {
  const [mutate, { loading, error }] = useMutation<{
    resetPassword: OtpResponse;
  }>(RESET_PASSWORD_MUTATION);

  return {
    resetPassword: async (email: string, newPassword: string) => {
      const result = await mutate({ variables: { email, newPassword } });
      return result.data?.resetPassword;
    },
    loading,
    error,
  };
};
