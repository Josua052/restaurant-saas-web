import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    
    const body = await request.json().catch(() => ({}));
    const scope = body.scope || "tenant";
    
    const portal = body.portal; // e.g. "admin", "owner", "staff"
    
    let refreshToken = undefined;
    
    if (scope === "admin" || portal === "admin") {
      refreshToken = cookieStore.get("admin_refresh_token")?.value;
    } else if (portal === "staff") {
      refreshToken = cookieStore.get("staff_refresh_token")?.value;
    } else if (portal === "owner") {
      refreshToken = cookieStore.get("owner_refresh_token")?.value;
    } else {
      // Fallback if portal not explicitly provided
      refreshToken = cookieStore.get("owner_refresh_token")?.value || cookieStore.get("staff_refresh_token")?.value;
    }

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token available" },
        { status: 401 }
      );
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true" || !API_URL;

    let newAccessToken = "mock_jwt_access_token";
    let newRefreshToken = "mock_jwt_refresh_token";

    if (!isMockEnabled) {
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
        if (scope === "admin" || portal === "admin") {
          cookieStore.delete("admin_access_token");
          cookieStore.delete("admin_refresh_token");
        } else {
          cookieStore.delete("access_token"); // legacy
          cookieStore.delete("refresh_token"); // legacy
          cookieStore.delete("owner_access_token");
          cookieStore.delete("owner_refresh_token");
          cookieStore.delete("staff_access_token");
          cookieStore.delete("staff_refresh_token");
        }

        // Check if the error indicates a suspended account
        const errorMsg = (data.message || data.errors?.detail || "").toLowerCase();
        const isSuspended = errorMsg.includes("suspended");

        return NextResponse.json(
          { 
            success: false, 
            message: isSuspended ? "Account suspended" : "Session expired, please login again",
            isSuspended 
          },
          { status: 401 }
        );
      }

      newAccessToken = data.data?.access_token;
      newRefreshToken = data.data?.refresh_token;
    }

    if (!newAccessToken) {
      return NextResponse.json(
        { success: false, message: "Invalid server response" },
        { status: 500 }
      );
    }

    let accessCookieName = "owner_access_token";
    let refreshCookieName = "owner_refresh_token";
    if (scope === "admin" || portal === "admin") {
      accessCookieName = "admin_access_token";
      refreshCookieName = "admin_refresh_token";
    } else if (portal === "staff") {
      accessCookieName = "staff_access_token";
      refreshCookieName = "staff_refresh_token";
    }

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
