// lib/hooks/useOtp.ts
"use client";
import { useMutation } from "@apollo/client/react";
import {
  SEND_OTP_MUTATION,
  VERIFY_OTP_MUTATION,
} from "../graphql/mutations/otp.mutations";

export const useSendOtp = () => {
  const [sendOtpMutation, { loading, error }] = useMutation<{
    sendOtp: { success: boolean; message: string };
  }>(SEND_OTP_MUTATION);

  return {
    sendOtp: async (email: string, name?: string) => {
      const result = await sendOtpMutation({ variables: { email, name } });
      return result.data?.sendOtp;
    },
    loading,
    error,
  };
};

export const useVerifyOtp = () => {
  const [verifyOtpMutation, { loading, error }] = useMutation<{
    verifyOtp: { success: boolean; message: string };
  }>(VERIFY_OTP_MUTATION);

  return {
    verifyOtp: async (email: string, otp: string) => {
      const result = await verifyOtpMutation({ variables: { email, otp } });
      return result.data?.verifyOtp;
    },
    loading,
    error,
  };
};
