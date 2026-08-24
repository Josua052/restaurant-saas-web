import BranchDetailClient from "./BranchDetailClient";
import { cookies } from "next/headers";

export const metadata = {
  title: "Branch Detail - SaaS Restaurant",
};

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const branchId = resolvedParams.id;
  const cookieStore = await cookies();
  const token = cookieStore.get("owner_access_token")?.value || "";

  return <BranchDetailClient token={token} branchId={branchId} />;
}
