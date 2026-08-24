import React from "react";
import QRMenuPublicClient from "@/components/qr-menu-public/QRMenuPublicClient";
import { notFound } from "next/navigation";

async function getTenantBranchInfo(tenantSlug: string, branchSlug: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const apiUrl = API_URL ? API_URL.replace("/v1", "/v2") : "http://localhost:8080/api/v2";

  try {
    const res = await fetch(`${apiUrl}/public/info/${tenantSlug}/${branchSlug}`, {
      cache: "no-store", // Keep it fresh or use revalidate
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.data; // { tenant_id, branch_id, restaurant_name, branch_name, logo_url, currency, tax_rate }
  } catch (error) {
    console.error("Failed to fetch tenant branch info:", error);
    return null;
  }
}

export default async function PublicQRMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string; branchSlug: string }>;
  searchParams: Promise<{ mode?: string; tableNumber?: string; id?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const tenantSlug = resolvedParams.domain;
  const branchSlug = resolvedParams.branchSlug;
  const tableNumber = resolvedSearchParams.tableNumber || "";
  const tableId = resolvedSearchParams.id || "";

  const info = await getTenantBranchInfo(tenantSlug, branchSlug);

  if (!info) {
    notFound();
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  const apiUrl = API_URL ? API_URL.replace("/v1", "/v2") : "http://localhost:8080/api/v2";

  return (
    <QRMenuPublicClient
      apiUrl={apiUrl}
      tenantInfo={info}
      tableNumber={tableNumber}
      tableId={tableId}
    />
  );
}
