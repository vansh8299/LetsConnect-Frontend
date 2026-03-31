// lib/hooks/useFriends.ts
import {
  useMutation,
  useQuery,
  useSubscription,
  useApolloClient,
} from "@apollo/client/react";
import {
  ACCEPT_FRIEND_REQUEST_MUTATION,
  FRIEND_REQUEST_RECEIVED_SUBSCRIPTION,
  GET_FRIEND_REQUESTS_QUERY,
  REJECT_FRIEND_REQUEST_MUTATION,
  SEND_FRIEND_REQUEST_MUTATION,
  SET_ONLINE_STATUS_MUTATION,
  USER_STATUS_CHANGED_SUBSCRIPTION,
} from "../graphql/queries/friends.queries";
import { GET_ALL_USERS_QUERY } from "../graphql/queries/auth.queries";
import { useEffect } from "react";
import {
  GetFriendRequestsResponse,
  SendFriendRequestResponse,
  AcceptFriendRequestResponse,
  RejectFriendRequestResponse,
  SetOnlineStatusResponse,
  UserStatusChangedSubscription,
  FriendRequestReceivedSubscription,
  GetAllUsersResponse,
} from "../types/auth.types";

export const useFriendRequests = () => {
  const { data, loading, error, refetch } = useQuery<GetFriendRequestsResponse>(
    GET_FRIEND_REQUESTS_QUERY,
    { errorPolicy: "all" },
  );

  useSubscription<FriendRequestReceivedSubscription>(
    FRIEND_REQUEST_RECEIVED_SUBSCRIPTION,
    { onData: () => refetch() },
  );

  return {
    friendRequests: data?.friendRequests ?? [],
    loading,
    error,
    refetch,
  };
};

export const useSendFriendRequest = () => {
  const [mutate, { loading }] = useMutation<
    SendFriendRequestResponse,
    { receiverId: string }
  >(SEND_FRIEND_REQUEST_MUTATION, {
    refetchQueries: [GET_ALL_USERS_QUERY],
  });

  return {
    sendRequest: (receiverId: string) => mutate({ variables: { receiverId } }),
    loading,
  };
};

export const useRespondToFriendRequest = () => {
  const [accept, { loading: accepting }] = useMutation<
    AcceptFriendRequestResponse,
    { requestId: string }
  >(ACCEPT_FRIEND_REQUEST_MUTATION, {
    refetchQueries: [GET_FRIEND_REQUESTS_QUERY, GET_ALL_USERS_QUERY],
  });

  const [reject, { loading: rejecting }] = useMutation<
    RejectFriendRequestResponse,
    { requestId: string }
  >(REJECT_FRIEND_REQUEST_MUTATION, {
    refetchQueries: [GET_FRIEND_REQUESTS_QUERY, GET_ALL_USERS_QUERY],
  });

  return {
    acceptRequest: (requestId: string) => accept({ variables: { requestId } }),
    rejectRequest: (requestId: string) => reject({ variables: { requestId } }),
    loading: accepting || rejecting,
  };
};

export const useOnlineStatus = () => {
  const [setStatus] = useMutation<
    SetOnlineStatusResponse,
    { isOnline: boolean }
  >(SET_ONLINE_STATUS_MUTATION, {
    update(cache, { data }) {
      const updatedUser = data?.setOnlineStatus;
      if (!updatedUser) return;

      const existing = cache.readQuery<GetAllUsersResponse>({
        query: GET_ALL_USERS_QUERY,
      });
      if (!existing) return;

      cache.writeQuery<GetAllUsersResponse>({
        query: GET_ALL_USERS_QUERY,
        data: {
          users: existing.users.map((u) =>
            u.id === updatedUser.id
              ? {
                  ...u,
                  isOnline: updatedUser.isOnline,
                  lastSeen: updatedUser.lastSeen,
                }
              : u,
          ),
        },
      });
    },
  });

  useEffect(() => {
    setStatus({ variables: { isOnline: true } });

    let offlineTimer: number;

    const handleOffline = () => setStatus({ variables: { isOnline: false } });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        offlineTimer = window.setTimeout(handleOffline, 30_000);
      } else {
        clearTimeout(offlineTimer);
        setStatus({ variables: { isOnline: true } });
      }
    };

    window.addEventListener("pagehide", handleOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(offlineTimer);
      handleOffline();
      window.removeEventListener("pagehide", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export const useUserStatusSubscription = () => {
  const client = useApolloClient();

  useSubscription<UserStatusChangedSubscription>(
    USER_STATUS_CHANGED_SUBSCRIPTION,
    {
      onData: ({ data }) => {
        const updatedUser = data.data?.userStatusChanged;
        if (!updatedUser) return;

        const existing = client.readQuery<GetAllUsersResponse>({
          query: GET_ALL_USERS_QUERY,
        });
        if (!existing) return;

        client.writeQuery<GetAllUsersResponse>({
          query: GET_ALL_USERS_QUERY,
          data: {
            users: existing.users.map((u) =>
              u.id === updatedUser.id
                ? {
                    ...u,
                    isOnline: updatedUser.isOnline,
                    lastSeen: updatedUser.lastSeen,
                  }
                : u,
            ),
          },
        });
      },
    },
  );
};
