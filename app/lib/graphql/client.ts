// lib/graphql/client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Function to get GraphQL URI
const getGraphQLUri = () => {
  const uri =
    process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql";

  // Log the URI for debugging (only in browser)
  if (typeof window !== "undefined") {
    console.log("🔗 GraphQL URI:", uri);
  }

  return uri;
};

// Create HTTP Link
const httpLink = createHttpLink({
  uri: getGraphQLUri(),
  credentials: "include", // Important for cookies
  fetchOptions: {
    mode: "cors",
  },
});

// Auth Link - adds authorization header with token
const authLink = setContext((_, { headers }) => {
  // Get token from localStorage (only in browser)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  if (token && typeof window !== "undefined") {
    console.log("🔑 Adding auth token to request");
  }

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

// Helper function to test connection
export const testGraphQLConnection = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  try {
    console.log("🧪 Testing GraphQL connection...");

    const response = await fetch(getGraphQLUri(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "{ __typename }",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ GraphQL connection successful:", data);
      return true;
    } else {
      console.error("❌ GraphQL connection failed - Status:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ GraphQL connection failed:");
    console.error(error);
    console.error("\n🔴 Checklist:");
    console.error(
      "1. Is backend running? Run: npm run dev (in backend folder)",
    );
    console.error("2. Is it on port 4001? Check backend terminal output");
    console.error(
      "3. Can you access http://localhost:4001/graphql in browser?",
    );
    console.error("4. Did you create .env.local with NEXT_PUBLIC_GRAPHQL_URL?");
    console.error("5. Did you restart Next.js after creating .env.local?");
    return false;
  }
};

// Auto-test connection when in browser (for debugging)
if (typeof window !== "undefined") {
  // Test connection after a short delay
  setTimeout(() => {
    testGraphQLConnection();
  }, 1000);
}
