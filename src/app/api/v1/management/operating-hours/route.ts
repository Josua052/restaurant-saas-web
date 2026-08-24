import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("owner_access_token")?.value;
    const adminToken = cookieStore.get("admin_access_token")?.value;
    const staffToken = cookieStore.get("staff_access_token")?.value;
    
    const token = ownerToken || adminToken || staffToken;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Forward X-Branch-ID from the client if it exists
    const branchId = request.headers.get("X-Branch-ID");
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (branchId) {
      headers["X-Branch-ID"] = branchId;
    }

    const res = await fetch(`${API_URL}/management/operating-hours`, {
      headers,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Failed to fetch operating hours:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("owner_access_token")?.value;
    const adminToken = cookieStore.get("admin_access_token")?.value;
    
    const token = ownerToken || adminToken;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Forward X-Branch-ID from the client if it exists
    const branchId = request.headers.get("X-Branch-ID");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    if (branchId) {
      headers["X-Branch-ID"] = branchId;
    }

    const res = await fetch(`${API_URL}/management/operating-hours`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Failed to update operating hours:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
