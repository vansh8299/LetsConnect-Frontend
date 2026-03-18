// components/ApolloProvider.tsx
"use client";

import { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "@/app/lib/graphql/client";

/**
 * ApolloWrapper Component
 * Provides Apollo Client to the entire application
 * Wraps the entire app in layout.tsx
 */
export function ApolloWrapper({ children }: { children: ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
