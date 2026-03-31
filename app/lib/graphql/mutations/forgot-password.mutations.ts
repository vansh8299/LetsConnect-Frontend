import { gql } from "@apollo/client";

export const SEND_PASSWORD_RESET_OTP_MUTATION = gql`
  mutation SendPasswordResetOtp($email: String!) {
    sendPasswordResetOtp(email: $email) {
      success
      message
    }
  }
`;

export const VERIFY_PASSWORD_RESET_OTP_MUTATION = gql`
  mutation VerifyPasswordResetOtp($email: String!, $otp: String!) {
    verifyPasswordResetOtp(email: $email, otp: $otp) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($email: String!, $newPassword: String!) {
    resetPassword(email: $email, newPassword: $newPassword) {
      success
      message
    }
  }
`;
