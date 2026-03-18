# Authentication Architecture - Refactored

## Overview

This is a clean, modular authentication system using Apollo Client with TypeScript. The architecture eliminates redundancy and follows separation of concerns.

## Architecture

### Structure

```
client/app/
├── lib/
│   ├── graphql/
│   │   ├── client.ts              # Apollo Client setup
│   │   ├── mutations/
│   │   │   └── auth.mutations.ts  # GraphQL mutations (signup, login, refresh, updateProfile, logout)
│   │   └── queries/
│   │       └── auth.queries.ts    # GraphQL queries (me)
│   ├── hooks/
│   │   ├── useAuth.ts             # Custom hooks for auth operations
│   │   └── index.ts               # Hook exports
│   ├── services/
│   │   └── auth.service.ts        # Token management & OAuth utilities
│   └── types/
│       └── auth.types.ts          # All TypeScript types (no duplicates)
├── components/
│   ├── ApolloProvider.tsx         # Apollo Client provider wrapper
│   └── ProtectedRoute.tsx         # Route protection component
└── context/
    └── AuthContext.tsx            # Auth React Context using hooks
```

## Key Features

### 1. **GraphQL Queries & Mutations** (Separate Files)

- **Mutations** (`lib/graphql/mutations/auth.mutations.ts`):
  - `SIGNUP_MUTATION` - User registration
  - `LOGIN_MUTATION` - User login
  - `REFRESH_TOKEN_MUTATION` - Token refresh
  - `UPDATE_PROFILE_MUTATION` - Profile updates
  - `LOGOUT_MUTATION` - User logout

- **Queries** (`lib/graphql/queries/auth.queries.ts`):
  - `ME_QUERY` - Fetch current user

### 2. **Custom Hooks** (`lib/hooks/useAuth.ts`)

Encapsulates Apollo mutations/queries with automatic token management:

```typescript
// Usage Examples
const { login, loading, error } = useLogin();
const { signup, user } = useSignup();
const { user, loading, refetch } = useMe();
const { updateProfile } = useUpdateProfile();
const { logout } = useLogout();
```

**Benefits:**

- Automatic token storage in localStorage
- Error handling included
- Loading states
- Type-safe operations

### 3. **Auth Context** (`context/AuthContext.tsx`)

React Context using the custom hooks:

```typescript
const {
  user,
  loading,
  error,
  login,
  signup,
  logout,
  googleLogin,
  isAuthenticated,
} = useAuth();
```

**Features:**

- Centralized auth state
- Error management
- Token lifecycle management
- User refetch capability

### 4. **Auth Service** (`lib/services/auth.service.ts`)

Minimal service for utility functions:

- Token management (get, set, clear)
- Authentication status checks
- Google OAuth redirect
- No GraphQL duplicates

### 5. **Apollo Client** (`lib/graphql/client.ts`)

**Setup includes:**

- Auth link with automatic token injection from localStorage
- HTTP link with CORS support
- Network-only fetch policy for fresh data
- Connection testing utilities
- SSR support

### 6. **Type Safety** (`lib/types/auth.types.ts`)

Single source of truth for types:

- `User` - User model
- `AuthPayload` - Auth response
- `SignupInput` / `LoginInput` - Input types
- `UpdateProfileInput` - Profile update types
- `Chat` / `Message` - Chat models

## Usage Examples

### Login Page

```typescript
import { useAuth } from "@/app/context/AuthContext";

export function LoginPage() {
  const { login, loading, error } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit("email", "password");
    }}>
      {error && <p className="text-red-500">{error}</p>}
      <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
    </form>
  );
}
```

### Protected Components

```typescript
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

export function ProfilePage() {
  return (
    <ProtectedRoute>
      <div>User Profile</div>
    </ProtectedRoute>
  );
}
```

### Using Custom Hooks Directly

```typescript
import { useMe, useUpdateProfile } from "@/app/lib/hooks";

export function ProfileForm() {
  const { user, loading } = useMe();
  const { updateProfile, loading: updating } = useUpdateProfile();

  if (loading) return <div>Loading...</div>;

  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={() => updateProfile({ firstName: "John" })}>
        Update Profile
      </button>
    </div>
  );
}
```

## Configuration

### Environment Variables (.env.local)

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4001/graphql
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_BACKEND_URL=http://localhost:4001
```

## Key Improvements vs Original

| Issue            | Original                           | Refactored                        |
| ---------------- | ---------------------------------- | --------------------------------- |
| Redundancy       | Direct fetch duplicating mutations | Single mutation definitions       |
| Pattern          | Service layer with fetch           | Apollo hooks                      |
| Type Safety      | Scattered types                    | Centralized types                 |
| Token Management | In service                         | Automatic in hooks                |
| Error Handling   | Manual in context                  | Built into hooks                  |
| OAuth            | Service method                     | Auth service utility              |
| Code Reusability | Low                                | High (hooks can be used anywhere) |

## Available Hooks

### `useLogin()`

```typescript
const { login, loading, error, user } = useLogin();
await login({ email: "user@example.com", password: "123456" });
```

### `useSignup()`

```typescript
const { signup, loading, error, user } = useSignup();
await signup({ email: "user@example.com", password: "123456", name: "John" });
```

### `useMe()`

```typescript
const { user, loading, error, refetch } = useMe();
await refetch(); // Manually refetch user
```

### `useUpdateProfile()`

```typescript
const { updateProfile, loading, error, user } = useUpdateProfile();
await updateProfile({ firstName: "John", lastName: "Doe" });
```

### `useRefreshToken()`

```typescript
const { refreshToken, loading, error } = useRefreshToken();
const newAuth = await refreshToken(refreshTokenValue);
```

### `useLogout()`

```typescript
const { logout, loading, error } = useLogout();
await logout();
```

## Token Management Flow

1. **Login/Signup** → Mutation returns tokens → Stored in localStorage
2. **Apollo Requests** → Auth link retrieves token → Injected in headers
3. **Token Expiry** → Use `useRefreshToken()` hook → Get new tokens
4. **Logout** → Mutation called → Tokens cleared from localStorage

## Error Handling

All hooks return `error` object:

```typescript
const { login, error } = useLogin();
if (error) {
  console.error("Login error:", error.message);
}
```

Auth context collects all errors:

```typescript
const { error } = useAuth();
if (error) {
  displayError(error);
}
```

## Best Practices

✅ **Do:**

- Use `useAuth()` in React components
- Import types from `lib/types/auth.types.ts`
- Use hooks for GraphQL operations
- Keep mutations/queries separate

❌ **Don't:**

- Make direct fetch calls to GraphQL
- Duplicate type definitions
- Mix service layer with hooks
- Place auth logic in components

## Debugging

### Test GraphQL Connection

```typescript
import { testGraphQLConnection } from "@/app/lib/graphql/client";
await testGraphQLConnection();
```

### Check Tokens

```typescript
import { authService } from "@/app/lib/services/auth.service";
console.log(authService.getAccessToken());
```

## Migration Guide (From Old Code)

1. **Replace `authService` calls** with `useAuth()` hook
2. **Remove inline GraphQL** strings
3. **Use custom hooks** instead of directly calling mutations
4. **Import types** from `lib/types/auth.types.ts`
5. **Update imports** to use new hook names

### Before:

```typescript
await authService.login({ email, password });
```

### After:

```typescript
const { login } = useAuth();
await login(email, password);
```
