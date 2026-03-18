"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Camera, ArrowLeft, Save } from "lucide-react";
import { useQuery, useMutation } from "@apollo/client/react";

import { ME_QUERY } from "@/app/lib/graphql/queries/index";
import { UPDATE_PROFILE_MUTATION } from "@/app/lib/graphql/mutations/auth.mutations";
interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  about: string;
  profilePicture: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch user profile
  const {
    data,
    loading: queryLoading,
    error,
  } = useQuery<{ me: UserProfile }>(ME_QUERY);

  // Update profile mutation
  const [updateProfile, { loading: mutationLoading }] = useMutation(
    UPDATE_PROFILE_MUTATION,
    {
      refetchQueries: [{ query: ME_QUERY }],
      onCompleted: () => {
        setIsEditing(false);
        setImagePreview(null);
      },
      onError: (error) => {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
      },
    },
  );

  const [formData, setFormData] = useState<UserProfile>({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    about: "",
    profilePicture: "",
  });

  // Update form data when query loads
  useState(() => {
    if (data?.me) {
      setFormData({
        id: data.me.id || "",
        email: data.me.email || "",
        firstName: data.me.firstName || "",
        lastName: data.me.lastName || "",
        about: data.me.about || "",
        profilePicture: data.me.profilePicture || "",
      });
    }
  });

  const profile = data?.me || formData;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({
          ...prev,
          profilePicture: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile({
        variables: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          about: formData.about,
          profilePicture: formData.profilePicture,
        },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      id: profile.id || "",
      email: profile.email || "",
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      about: profile.about || "",
      profilePicture: profile.profilePicture || "",
    });
    setIsEditing(false);
    setImagePreview(null);
  };

  if (queryLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            Error loading profile. Please try again.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Chats</span>
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={mutationLoading}
                className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={mutationLoading}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {mutationLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-800">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-700"></div>

          {/* Profile Content */}
          <div className="px-8 pb-8">
            {/* Profile Picture */}
            <div className="relative -mt-16 mb-6">
              <div className="relative inline-block">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-slate-200 dark:border-slate-800 dark:bg-slate-700">
                  {imagePreview || formData.profilePicture ? (
                    <img
                      src={imagePreview || formData.profilePicture}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-16 w-16 text-slate-400" />
                    </div>
                  )}
                </div>

                {isEditing && (
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-colors hover:bg-indigo-700"
                  >
                    <Camera className="h-5 w-5" />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      placeholder="Enter first name"
                    />
                  ) : (
                    <p className="rounded-lg bg-slate-50 px-4 py-2.5 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                      {profile.firstName || "Not set"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      placeholder="Enter last name"
                    />
                  ) : (
                    <p className="rounded-lg bg-slate-50 px-4 py-2.5 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                      {profile.lastName || "Not set"}
                    </p>
                  )}
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <p className="rounded-lg bg-slate-50 px-4 py-2.5 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                  {profile.email}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Email cannot be changed
                </p>
              </div>

              {/* About */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  About
                </label>
                {isEditing ? (
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="rounded-lg bg-slate-50 px-4 py-2.5 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    {profile.about || "No bio added yet"}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
