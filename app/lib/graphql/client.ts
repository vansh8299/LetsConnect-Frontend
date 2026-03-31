// lib/graphql/client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const getGraphQLUri = (): string => {
  const uri =
    process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql";

  if (typeof window !== "undefined") {
    console.log("🔗 GraphQL URI:", uri);
  }

  return uri;
};

const httpLink = createHttpLink({
  uri: getGraphQLUri(),
  credentials: "include",
  fetchOptions: {
    mode: "cors",
  },
});

export const apolloClient = new ApolloClient({
  ssrMode: typeof window === "undefined",
  link: httpLink,
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
      // "none" makes Apollo throw ApolloError on GraphQL errors
      // so try/catch in your hooks/pages actually fires
      errorPolicy: "none",
    },
  },
});

export const testGraphQLConnection = async (): Promise<boolean> => {
  if (typeof window === "undefined") return false;

  try {
    console.log("🧪 Testing GraphQL connection...");

    const response = await fetch(getGraphQLUri(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ __typename }" }),
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
    console.error("❌ GraphQL connection error:");
    console.error(error);
    console.error("\n📋 Troubleshooting Checklist:");
    console.error(
      "1. ✓ Is backend running? Run: npm run dev (in backend folder)",
    );
    console.error("2. ✓ Is it on port 4001? Check backend terminal output");
    console.error("3. ✓ Can you access http://localhost:4001/graphql?");
    console.error(
      "4. ✓ Did you create .env.local with NEXT_PUBLIC_GRAPHQL_URL?",
    );
    console.error("5. ✓ Did you restart Next.js after creating .env.local?");
    console.error("6. ✓ Check CORS settings on backend");
    return false;
  }
};

if (typeof window !== "undefined") {
  setTimeout(() => {
    testGraphQLConnection();
  }, 1500);
}
