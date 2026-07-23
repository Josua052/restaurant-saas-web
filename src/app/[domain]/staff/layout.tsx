import { ReactNode } from "react";
import { Star, Bell, Grip, Menu } from "lucide-react";
import TenantSidebar from "@/components/tenant-sidebar";
import UserProfileDropdown from "@/components/user-profile-dropdown";
import NetworkStatus from "@/components/network-status";

import { ProfileProvider, type ProfileData } from "@/providers/ProfileProvider";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function StaffLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = await params;
  const domain = resolvedParams.domain;
  const cookieStore = await cookies();
  const token = cookieStore.get("staff_access_token")?.value;

  let profileData: ProfileData = {
    restaurantName: "",
    branchAddress: "",
    currency: "IDR",
    logoUrl: "",
  };

  if (token) {
    try {
      const res = await fetch(`${API_URL}/management/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store", // Ensure we always get fresh data
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          profileData = {
            restaurantName: json.data.restaurant_name || "",
            branchAddress: json.data.branch_address || json.data.address || "",
            currency: json.data.currency || "IDR",
            logoUrl: json.data.logo_url || "",
          };
        }
      }
    } catch (e) {
      console.error("Failed to fetch staff profile in layout:", e);
    }
  }

  return (
    <ProfileProvider initialProfile={profileData}>
      <div
        className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden"
        suppressHydrationWarning
      >
        {/* Dynamic Sidebar (Handles mobile hiding and active states internally) */}
        <TenantSidebar role="staff" />

        {/* Main Content Area */}
        <main
          className="flex-1 flex flex-col min-w-0 overflow-hidden"
          suppressHydrationWarning
        >
          {/* Top Header */}
          <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between md:justify-end px-4 md:px-8 shrink-0">
            {/* Mobile Hamburger (Visible only on mobile) */}
            <button className="md:hidden p-2 text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 md:gap-6">
              <NetworkStatus />
              <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full font-bold text-xs tracking-wide">
                <Star className="w-3.5 h-3.5 fill-slate-700" />
                STAFF
              </div>
              <button className="text-slate-500 hover:text-slate-700 transition-colors relative">
                <Bell className="w-5 h-5" />
              </button>
              <button className="text-slate-500 hover:text-slate-700 transition-colors">
                <Grip className="w-5 h-5" />
              </button>
              <UserProfileDropdown profileHref={`/${domain}/staff/profile`} />
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto" suppressHydrationWarning>
            {children}
          </div>
        </main>
      </div>
    </ProfileProvider>
  );
}
