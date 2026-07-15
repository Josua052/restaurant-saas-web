import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    
    const body = await request.json().catch(() => ({}));
    const scope = body.scope || "tenant";
    
    let refreshToken = undefined;
    
    if (scope === "admin") {
      refreshToken = cookieStore.get("admin_refresh_token")?.value;
    } else {
      refreshToken = cookieStore.get("refresh_token")?.value;
    }

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token available" },
        { status: 401 }
      );
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (!API_URL) {
      return NextResponse.json(
        { success: false, message: "API URL not configured" },
        { status: 500 }
      );
    }

    const backendResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok || !data.success) {
      // If refresh fails, we probably should clear cookies so the user has to login again
      if (scope === "admin") {
        cookieStore.delete("admin_access_token");
        cookieStore.delete("admin_refresh_token");
      } else {
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
      }

      return NextResponse.json(
        { success: false, message: "Session expired, please login again" },
        { status: 401 }
      );
    }

    // Success! Update cookies
    const newAccessToken = data.data?.access_token;
    const newRefreshToken = data.data?.refresh_token;

    if (!newAccessToken) {
      return NextResponse.json(
        { success: false, message: "Invalid server response" },
        { status: 500 }
      );
    }

    const accessCookieName = scope === "admin" ? "admin_access_token" : "access_token";
    const refreshCookieName = scope === "admin" ? "admin_refresh_token" : "refresh_token";

    cookieStore.set({
      name: accessCookieName,
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15, // 15 mins
    });

    if (newRefreshToken) {
      cookieStore.set({
        name: refreshCookieName,
        value: newRefreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return NextResponse.json(
      { success: true, message: "Token refreshed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during token refresh" },
      { status: 500 }
    );
  }
}
