import { cookies } from "next/headers"
import ProfileClient from "./ProfileClient"

export default async function StaffProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("staff_access_token")?.value || "";

  return <ProfileClient token={token} />
}
