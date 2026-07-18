import { cookies } from "next/headers"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("owner_access_token")?.value || "";

  return <ProfileClient token={token} />
}
