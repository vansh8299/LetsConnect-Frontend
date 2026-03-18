// lib/hooks/useUpload.ts
"use client";
import { useMutation } from "@apollo/client/react";
import { UPLOAD_PROFILE_PICTURE_MUTATION } from "../graphql/mutations/upload.mutations";

export const useUploadProfilePicture = () => {
  const [uploadMutation, { loading, error }] = useMutation<{
    uploadProfilePicture: { url: string; publicId: string };
  }>(UPLOAD_PROFILE_PICTURE_MUTATION);

  return {
    uploadProfilePicture: async (base64Image: string, email: string) => {
      const result = await uploadMutation({
        variables: { base64Image, email },
      });
      return result.data?.uploadProfilePicture;
    },
    loading,
    error,
  };
};
