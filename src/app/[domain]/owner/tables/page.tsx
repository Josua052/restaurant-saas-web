import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TablesClient from "./TablesClient";

export default async function TablesPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("owner_access_token")?.value;

  if (!token) {
    redirect(`/${resolvedParams.domain}/login`);
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const API_URL_V2 = API_URL ? API_URL.replace("/v1", "/v2") : "";

  return <TablesClient token={token} apiUrl={API_URL_V2} />;
}
