import { cookies } from "next/headers";
import EditMenuClient from "./EditMenuClient";

export default async function EditMenuPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";

  return <EditMenuClient token={token} />;
}
