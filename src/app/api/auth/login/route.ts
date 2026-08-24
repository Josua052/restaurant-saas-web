import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, scope = "tenant", domain } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    // Default URL to the Go Backend, can be overridden by ENV
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true" || !API_URL;

    let accessToken = "mock_jwt_access_token";
    let refreshToken: string | undefined = "mock_jwt_refresh_token";
    let userRole = scope === "admin" ? "superadmin" : "owner";
    let isOnboarded = true;

    if (!isMockEnabled) {
      try {
        // Forward the request to the Go backend
        const backendResponse = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, portal: scope, domain }),
        });

        const data = await backendResponse.json();

        // If backend returns an error (401, 400, etc)
        if (!backendResponse.ok || !data.success) {
          return NextResponse.json(data, { status: backendResponse.status });
        }

        // Login Success: Extract tokens from backend data
        accessToken = data.data?.access_token;
        refreshToken = data.data?.refresh_token;

        if (!accessToken) {
          return NextResponse.json(
            { success: false, message: "Invalid response from server" },
            { status: 500 },
          );
        }

        // Extract role by fetching the user profile from the backend
        try {
          const profileRes = await fetch(`${API_URL}/management/auth/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            userRole = profileData.data?.role?.toLowerCase() || "owner";
            if (profileData.data?.is_onboarded !== undefined) {
              isOnboarded = profileData.data.is_onboarded;
            }
          }
        } catch (err) {
          console.error("Failed to fetch profile during login:", err);
        }
      } catch (err) {
        console.warn("Backend unavailable, falling back to demo mode:", err);
      }
    } else {
      // Mock mode active
      if (scope === "admin" || email.includes("admin")) {
        userRole = "superadmin";
      } else if (scope === "staff" || email.includes("staff")) {
        userRole = "staff";
      } else {
        userRole = "owner";
      }
    }

    // Prepare response to send back to client
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        role: userRole,
        is_onboarded: isOnboarded,
      },
      { status: 200 },
    );

    // SET HTTP-ONLY COOKIES
    // Next.js 15+ syntax using await cookies()
    const cookieStore = await cookies();

    // Determine cookie name based on scope/role
    let cookieName = "access_token";
    if (scope === "admin") {
      cookieName = "admin_access_token";
    } else if (userRole === "staff" || userRole === "cashier") {
      cookieName = "staff_access_token";
    } else {
      cookieName = "owner_access_token";
    }

    // Set Access Token
    cookieStore.set({
      name: cookieName,
      value: accessToken,
      httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      path: "/", // Available across the whole app
      maxAge: 60 * 15, // 15 minutes (typically)
    });

    // NOTE: Do NOT write staff_access_token when Owner/Manager logs in.
    // Doing so causes cookie contamination — if a Staff user is already logged in
    // on another browser tab, their staff_access_token would be overwritten with
    // the Owner's token, causing their profile and data to change silently.
    // Each role must maintain its own isolated cookie scope.

    // Set Refresh Token (if provided)
    if (refreshToken) {
      let refreshCookieName = "refresh_token";
      if (scope === "admin") {
        refreshCookieName = "admin_refresh_token";
      } else if (userRole === "staff" || userRole === "cashier") {
        refreshCookieName = "staff_refresh_token";
      } else {
        refreshCookieName = "owner_refresh_token";
      }

      cookieStore.set({
        name: refreshCookieName,
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // NOTE: Do NOT write staff_refresh_token for Owner/Manager — same contamination risk.
    }

    return response;
  } catch (error) {
    console.error("Login Proxy Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
