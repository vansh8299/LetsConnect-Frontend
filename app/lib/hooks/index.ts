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
export {
  useSendPasswordResetOtp,
  useVerifyPasswordResetOtp,
  useResetPassword,
} from "./useForgotPassword";
import { useQuery } from "@apollo/client/react";
import { GET_ALL_USERS_QUERY } from "../graphql/queries/auth.queries";
import { User } from "../types/auth.types";

export const useGetAllUsers = () => {
  const { data, loading, error, refetch } = useQuery<{ users: User[] }>(
    GET_ALL_USERS_QUERY,
    { errorPolicy: "all" },
  );

  return {
    users: data?.users || [],
    loading,
    error,
    refetch,
  };
};
export {
  useFriendRequests,
  useSendFriendRequest,
  useRespondToFriendRequest,
  useOnlineStatus,
  useUserStatusSubscription,
} from "./useFriends";
