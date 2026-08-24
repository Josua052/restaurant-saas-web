import React from "react";
import QRMenuClient from "@/components/qr-menu/QRMenuClient";
import { cookies } from "next/headers";

export default async function StaffQRMenuPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("staff_access_token")?.value || "";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const apiUrl = API_URL;

  return (
    <QRMenuClient
      token={token}
      apiUrl={apiUrl}
      tenantSlug={domain}
      branchSlug="staff-branch" 
    />
  );
}
