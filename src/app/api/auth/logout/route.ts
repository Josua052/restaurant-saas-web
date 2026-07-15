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

    const body = await request.json().catch(() => ({}));
    const scope = body.scope || "tenant";

    // Notify backend to blacklist the token
    if (scope === "admin" && adminAccessToken) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (API_URL) {
        await fetch(`${API_URL}/superadmin/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminAccessToken}`,
          },
          body: JSON.stringify({ refresh_token: adminRefreshToken }),
        }).catch((err) => {
          console.error("Failed to notify backend of admin logout:", err);
        });
      }
    } else if (scope === "tenant" && accessToken) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (API_URL) {
        await fetch(`${API_URL}/management/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }).catch((err) => {
          console.error("Failed to notify backend of tenant logout:", err);
        });
      }
    }

    // Prepare Response
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear cookies based on scope
    if (scope === "admin") {
      cookieStore.delete("admin_access_token");
      cookieStore.delete("admin_refresh_token");
    } else {
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
    }

    return response;
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during logout" },
      { status: 500 }
    );
  }
}
