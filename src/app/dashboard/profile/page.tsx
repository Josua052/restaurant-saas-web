import { Metadata } from "next"
import ProfileClient from "./ProfileClient"

export const metadata: Metadata = {
  title: "My Profile | Admin Central",
  description: "View and manage your super admin account information.",
}

export default function SuperAdminProfilePage() {
  return (
    <div className="w-full">
      <ProfileClient />
    </div>
  )
}
