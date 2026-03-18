// lib/graphql/mutations/upload.mutations.ts
import { gql } from "@apollo/client";

export const UPLOAD_PROFILE_PICTURE_MUTATION = gql`
  mutation UploadProfilePicture($base64Image: String!, $email: String!) {
    uploadProfilePicture(base64Image: $base64Image, email: $email) {
      url
      publicId
    }
  }
`;
