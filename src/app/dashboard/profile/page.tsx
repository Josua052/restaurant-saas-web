import { Metadata } from "next"
import { cookies } from "next/headers"
import ProfileClient from "./ProfileClient"

export const metadata: Metadata = {
  title: "My Profile | Admin Central",
  description: "View and manage your super admin account information.",
}

export default async function SuperAdminProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  let userProfile = null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (token) {
    try {
      const res = await fetch(`${API_URL}/management/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        // Don't cache this request as it is user-specific
        cache: "no-store"
      });
      
      if (res.ok) {
        const json = await res.json();
        userProfile = json.data;
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }

  return (
    <div className="w-full">
      <ProfileClient userProfile={userProfile} />
    </div>
  )
}
