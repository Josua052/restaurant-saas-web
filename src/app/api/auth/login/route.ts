import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Default URL to the Go Backend, can be overridden by ENV
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // Forward the request to the Go backend
    const backendResponse = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await backendResponse.json();

    // If backend returns an error (401, 400, etc)
    if (!backendResponse.ok || !data.success) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    // Login Success: Extract tokens from backend data
    const accessToken = data.data?.access_token;
    const refreshToken = data.data?.refresh_token;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Invalid response from server" },
        { status: 500 }
      );
    }

    // Prepare response to send back to client
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    }, { status: 200 });

    // SET HTTP-ONLY COOKIES
    // Next.js 15+ syntax using await cookies()
    const cookieStore = await cookies();
    
    // Set Access Token
    cookieStore.set({
      name: "access_token",
      value: accessToken,
      httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      path: "/", // Available across the whole app
      maxAge: 60 * 15, // 15 minutes (typically)
    });

    // Set Refresh Token (if provided)
    if (refreshToken) {
      cookieStore.set({
        name: "refresh_token",
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;

  } catch (error) {
    console.error("Login Proxy Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
