import { ReactNode } from "react";
import { Star, Bell, Grip, Menu } from "lucide-react";
import TenantSidebar from "@/components/tenant-sidebar";
import UserProfileDropdown from "@/components/user-profile-dropdown";

import { ProfileProvider, type ProfileData } from "@/providers/ProfileProvider";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function OwnerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = await params;
  const domain = resolvedParams.domain;
  const cookieStore = await cookies();
  const token = cookieStore.get("owner_access_token")?.value;

  const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true" || !API_URL;

  if (!token && !isMockEnabled) {
    redirect(`/${domain}/login`);
  }

  const formattedDefaultName = domain
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  let profileData: ProfileData = {
    restaurantName: formattedDefaultName || "Gusto Bistro & Lounge",
    branchAddress: "Jl. Senopati, Jakarta Selatan",
    currency: "IDR",
    logoUrl: "",
    capabilities: ["order", "pos", "reservation", "menu", "qr_menu", "loyalty"],
  };

  let shouldRedirectToStaff = false;

  if (token && API_URL) {
    try {
      const res = await fetch(`${API_URL}/management/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store", // Ensure we always get fresh data
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          // Role-based protection: if user is not Owner/Manager, redirect them to the correct portal
          const role = json.data.role;
          if (role && (role === "Staff" || role === "Cashier")) {
            shouldRedirectToStaff = true;
          }

          profileData = {
            restaurantName: json.data.restaurant_name || formattedDefaultName || "Gusto Bistro & Lounge",
            branchAddress: json.data.branch_address || json.data.address || "Jl. Senopati, Jakarta Selatan",
            currency: json.data.currency || "IDR",
            logoUrl: json.data.logo_url || "",
            capabilities: json.data.capabilities || ["order", "pos", "reservation", "menu", "qr_menu", "loyalty"],
          };
        }
      }
    } catch (e) {
      console.warn("Using fallback owner profile data for demo:", e);
    }
  }

  if (shouldRedirectToStaff) {
    redirect(`/${domain}/staff`);
  }

  return (
    <ProfileProvider initialProfile={profileData}>
      <div
        className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden"
        suppressHydrationWarning
      >
        {/* Dynamic Sidebar (Handles mobile hiding and active states internally) */}
        <TenantSidebar />

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
              <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-indigo-100/80 text-indigo-700 rounded-full font-bold text-xs tracking-wide">
                <Star className="w-3.5 h-3.5 fill-indigo-700" />
                OWNER
              </div>
              <button className="text-slate-500 hover:text-slate-700 transition-colors relative">
                <Bell className="w-5 h-5" />
                {/* Optional dot indicator could go here */}
              </button>
              <button className="text-slate-500 hover:text-slate-700 transition-colors">
                <Grip className="w-5 h-5" />
              </button>
              <UserProfileDropdown profileHref={`/${domain}/owner/profile`} />
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
