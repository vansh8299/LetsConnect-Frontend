// app/api/auth/check/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");
  const refreshToken = cookieStore.get("refreshToken");

  return NextResponse.json({
    isAuthenticated: !!(accessToken || refreshToken),
  });
}
