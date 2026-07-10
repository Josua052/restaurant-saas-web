"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Basic title mapping based on route
  let pageTitle = "Super Admin";
  if (pathname.includes("/tenants/new")) {
    pageTitle = "";
  } else if (pathname.includes("/tenants/")) {
    pageTitle = "";
  } else if (pathname.includes("/tenants")) {
    pageTitle = "";
  } else if (pathname.includes("/settings")) {
    pageTitle = "Settings";
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden lg:flex flex-col shrink-0 w-60">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={pageTitle} />
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl w-full flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
