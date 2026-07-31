import React from "react";
import QRMenuClient from "@/components/qr-menu/QRMenuClient";
import { cookies } from "next/headers";

export default async function OwnerQRMenuPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("owner_access_token")?.value || "";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const apiUrl = API_URL ? API_URL.replace("/v1", "/v2") : "http://localhost:8080/api/v2";

  return (
    <QRMenuClient
      token={token}
      apiUrl={apiUrl}
      tenantSlug={domain}
      branchSlug="owner-branch" // Will be overridden or not strictly needed if we just use the selected activeBranchSlug, but we need the branch slug for the QR URL.
    />
  );
}
