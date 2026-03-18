// app/lib/utils/auth.utils.ts
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/check", { cache: "no-store" });
    const data = await res.json();
    return data.isAuthenticated;
  } catch {
    return false;
  }
}
