/**
 * Auth Service - Handles authentication logic
 * Uses Apollo Client via custom hooks for GraphQL operations
 * Token management is handled by backend via HTTP-only cookies
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const authService = {
  /**
   * Redirect to Google OAuth login
   * Backend will handle the OAuth flow and set cookies
   */
  googleLogin: () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  },
};
