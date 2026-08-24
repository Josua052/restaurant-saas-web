import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    
    // Get tokens from cookies
    // For tenant logout, we might not know if it's owner or staff, so we check both
    let accessToken = cookieStore.get("owner_access_token")?.value || cookieStore.get("staff_access_token")?.value;
    let refreshToken = cookieStore.get("owner_refresh_token")?.value || cookieStore.get("staff_refresh_token")?.value;

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
    // IMPORTANT: Only clear the tokens belonging to the logging-out role.
    // Deleting all tokens at once would force-logout any other role logged in on another tab.
    if (scope === "admin") {
      cookieStore.delete("admin_access_token");
      cookieStore.delete("admin_refresh_token");
    } else if (scope === "staff") {
      // Staff/Cashier logout — only clear staff tokens
      cookieStore.delete("staff_access_token");
      cookieStore.delete("staff_refresh_token");
    } else {
      // Owner/Manager logout — only clear owner tokens
      // Do NOT touch staff_access_token/staff_refresh_token — a Staff user
      // may still be logged in on another tab.
      cookieStore.delete("access_token"); // legacy
      cookieStore.delete("refresh_token"); // legacy
      cookieStore.delete("owner_access_token");
      cookieStore.delete("owner_refresh_token");
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
