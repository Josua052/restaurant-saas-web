import { Metadata } from "next";
import TablesClient from "./TablesClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Tables Management - Staff",
  description: "Manage restaurant tables and sessions.",
};

export default async function StaffTablesPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("staff_access_token")?.value;

  if (!token) {
    redirect(`/${domain}/login`);
  }

  return <TablesClient initialToken={token} />;
}
