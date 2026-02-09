const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

interface SignupInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  // Regular email/password signup
  async signup(input: SignupInput) {
    const response = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        query: `
          mutation Signup($email: String!, $password: String!, $name: String) {
            signup(email: $email, password: $password, name: $name) {
              accessToken
              refreshToken
              user {
                id
                email
                name
              }
            }
          }
        `,
        variables: input,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.signup;
  },

  // Regular email/password login
  async login(input: LoginInput) {
    const response = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        query: `
          mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              accessToken
              refreshToken
              user {
                id
                email
                name
              }
            }
          }
        `,
        variables: input,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.login;
  },

  // Google OAuth - redirect to backend
  googleLogin() {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  },

  // Logout
  async logout() {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  // Get current user
  async getCurrentUser() {
    const response = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        query: `
          query Me {
            me {
              id
              email
              name
            }
          }
        `,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      return null;
    }

    return data.data.me;
  },

  // Refresh token
  async refreshToken(refreshToken: string) {
    const response = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        query: `
          mutation Refresh($refreshToken: String!) {
            refresh(refreshToken: $refreshToken) {
              accessToken
              refreshToken
              user {
                id
                email
                name
              }
            }
          }
        `,
        variables: { refreshToken },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.refresh;
  },
};
