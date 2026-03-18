// lib/graphql/mutations/index.ts
export {
  SIGNUP_MUTATION,
  LOGIN_MUTATION,
  REFRESH_TOKEN_MUTATION,
  UPDATE_PROFILE_MUTATION,
  LOGOUT_MUTATION,
} from "./auth.mutations";
export { SEND_OTP_MUTATION, VERIFY_OTP_MUTATION } from "./otp.mutations";
export { UPLOAD_PROFILE_PICTURE_MUTATION } from "./upload.mutations";
