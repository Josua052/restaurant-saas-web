import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("owner_access_token")?.value;
    const adminToken = cookieStore.get("admin_access_token")?.value;
    const staffToken = cookieStore.get("staff_access_token")?.value;
    
    const token = ownerToken || adminToken || staffToken;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const branchId = request.headers.get("X-Branch-ID");
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (branchId) {
      headers["X-Branch-ID"] = branchId;
    }

    const res = await fetch(`${API_URL}/management/tenant/branches/${id}`, {
      headers,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Failed to fetch branch details:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("owner_access_token")?.value;
    const adminToken = cookieStore.get("admin_access_token")?.value;
    
    const token = ownerToken || adminToken;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const branchId = request.headers.get("X-Branch-ID");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    if (branchId) {
      headers["X-Branch-ID"] = branchId;
    }

    const res = await fetch(`${API_URL}/management/tenant/branches/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Failed to update branch:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get("owner_access_token")?.value;
    
    const token = ownerToken;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const branchId = request.headers.get("X-Branch-ID");
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (branchId) {
      headers["X-Branch-ID"] = branchId;
    }

    const res = await fetch(`${API_URL}/management/tenant/branches/${id}`, {
      method: "DELETE",
      headers,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Failed to delete branch:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
