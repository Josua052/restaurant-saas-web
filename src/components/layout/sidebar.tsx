"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, Settings, HelpCircle, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tenants", href: "/dashboard/tenants", icon: Users },
  { name: "Onboarding", href: "/dashboard/tenants/new", icon: UserPlus },
];

const footerItems = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Support", href: "#", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-60 flex-col border-r border-slate-200 bg-white">
      {/* Logo & Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
            SA
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-heading leading-tight">
              Admin Central
            </h2>
            <p className="text-xs text-slate-500">Enterprise Suite</p>
          </div>
        </div>
      </div>

      {/* New Tenant Button */}
      <div className="px-4 pb-6">
        <Link href="/dashboard/tenants/new" className={buttonVariants({ variant: "default", className: "w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white" })}>
          <Plus className="mr-2 h-4 w-4" />
          New Tenant
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? "text-indigo-600" : "text-slate-400"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="border-t border-slate-200 p-4">
        <nav className="space-y-1">
          {footerItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <item.icon className="h-4 w-4 shrink-0 text-slate-400" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
