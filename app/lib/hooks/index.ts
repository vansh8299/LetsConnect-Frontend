// lib/hooks/index.ts
export {
  useSignup,
  useLogin,
  useMe,
  useRefreshToken,
  useUpdateProfile,
  useLogout,
} from "./useAuth";
export { useSendOtp, useVerifyOtp } from "./useOtp";
export { useUploadProfilePicture } from "./useUpload";
