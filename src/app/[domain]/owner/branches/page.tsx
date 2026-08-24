import BranchesClient from "./BranchesClient";
import { cookies } from "next/headers";

export const metadata = {
  title: "Branch Management - SaaS Restaurant",
};

export default async function BranchesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("owner_access_token")?.value || "";

  return <BranchesClient token={token} />;
}
