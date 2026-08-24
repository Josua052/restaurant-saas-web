import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    // We try to get the token, it could be owner, staff, or admin token
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("owner_access_token")?.value;
    const adminToken = cookieStore.get("admin_access_token")?.value;
    const staffToken = cookieStore.get("staff_access_token")?.value;
    
    const token = ownerToken || adminToken || staffToken;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${API_URL}/management/tenant/branches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Failed to fetch branches from proxy route:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const res = await fetch(`${API_URL}/management/tenant/branches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Failed to create branch from proxy route:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
