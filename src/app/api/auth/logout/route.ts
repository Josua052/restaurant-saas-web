import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    
    // Get tokens from cookies
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;
    const adminAccessToken = cookieStore.get("admin_access_token")?.value;
    const adminRefreshToken = cookieStore.get("admin_refresh_token")?.value;

    const currentAccessToken = accessToken || adminAccessToken;
    const currentRefreshToken = refreshToken || adminRefreshToken;

    // Notify backend to blacklist the token
    if (currentAccessToken && currentRefreshToken) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (API_URL) {
        await fetch(`${API_URL}/management/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentAccessToken}`,
          },
          body: JSON.stringify({ refresh_token: currentRefreshToken }),
        }).catch((err) => {
          console.error("Failed to notify backend of logout:", err);
        });
      }
    }

    // Prepare Response
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear cookies by deleting them
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    cookieStore.delete("admin_access_token");
    cookieStore.delete("admin_refresh_token");

    return response;
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during logout" },
      { status: 500 }
    );
  }
}
