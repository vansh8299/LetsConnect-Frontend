// lib/graphql/mutations/otp.mutations.ts
import { gql } from "@apollo/client";

export const SEND_OTP_MUTATION = gql`
  mutation SendOtp($email: String!, $name: String) {
    sendOtp(email: $email, name: $name) {
      success
      message
    }
  }
`;

export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOtp($email: String!, $otp: String!) {
    verifyOtp(email: $email, otp: $otp) {
      success
      message
    }
  }
`;
