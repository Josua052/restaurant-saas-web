"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Utensils,
  Layers,
  Armchair,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { useProfile } from "@/providers/ProfileProvider";

export default function TenantSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const domain = (params?.domain as string) || "";
  const { restaurantName, branchAddress, logoUrl } = useProfile();

  // Helper to check if a route is active
  const isActive = (path: string) => {
    // If the path is exactly "/{domain}/owner", check for exact match
    if (path === `/${domain}/owner`) {
      return (
        pathname === `/${domain}/owner` || pathname === `/${domain}/owner/`
      );
    }
    // Otherwise check if pathname starts with the path
    return pathname.startsWith(path);
  };

  const navItems = [
    { name: "Dashboard", href: `/${domain}/owner`, icon: LayoutDashboard },
    {
      name: "Reservations",
      href: `/${domain}/owner/reservations`,
      icon: CalendarCheck,
    },
    { name: "Menu", href: `/${domain}/owner/menu`, icon: Utensils },
    { name: "Employees", href: `/${domain}/owner/employees`, icon: Users },
  ];

  // Extract first letter for logo
  const logoLetter = restaurantName
    ? restaurantName.charAt(0).toUpperCase()
    : "R";
  const displayAddress = branchAddress || "No Address Provided";

  return (
    <aside className="hidden md:flex w-[280px] bg-white border-r border-slate-200 flex-col shrink-0 h-full">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 gap-3 shrink-0 border-b border-transparent">
        {logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt={restaurantName}
            className="w-auto h-10 rounded-lg object-fit shrink-0"
          />
        ) : (
          <div className="w-10 h-10 bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-xl shrink-0">
            {logoLetter}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-bold text-indigo-700 text-lg leading-tight truncate">
            {restaurantName || "Loading..."}
          </h2>
          <p className="text-xs text-slate-500 font-medium truncate">
            {displayAddress}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${active ? "text-white" : "text-slate-500"}`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="p-4 border-t border-slate-100 flex flex-col gap-1.5 shrink-0">
        <Link
          href={`/${domain}/owner/settings`}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
            isActive(`/${domain}/owner/settings`)
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Settings
            className={`w-5 h-5 ${isActive(`/${domain}/owner/settings`) ? "text-white" : "text-slate-500"}`}
          />
          Settings
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
