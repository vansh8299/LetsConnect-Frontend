"use client";

import { useMutation } from "@apollo/client/react";
import {
  SEND_OTP_MUTATION,
  VERIFY_OTP_MUTATION,
} from "../graphql/mutations/otp.mutations";

type OtpResponse = { success: boolean; message: string };

export const useSendOtp = () => {
  const [sendOtpMutation, { loading, error }] = useMutation<{
    sendOtp: OtpResponse;
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
    verifyOtp: OtpResponse;
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
