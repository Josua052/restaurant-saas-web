import { cookies } from "next/headers";
import MenuDetailClient from "./MenuDetailClient";

export default async function MenuDetailPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("owner_access_token")?.value || "";

  return <MenuDetailClient token={token} />;
}
