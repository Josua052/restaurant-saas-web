"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Utensils,
  Users,
  Settings,
  LogOut,
  ChefHat,
  ClipboardList,
  Armchair,
  Gift,
  QrCode,
  Store,
} from "lucide-react";
import { useProfile } from "@/providers/ProfileProvider";
import { BranchSwitcher } from "@/components/layout/branch-switcher";

interface TenantSidebarProps {
  role?: "owner" | "staff";
}

export default function TenantSidebar({ role = "owner" }: TenantSidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const domain = (params?.domain as string) || "";
  const { restaurantName, branchAddress, logoUrl, capabilities = [] } = useProfile();

  const basePath = `/${domain}/${role}`;

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope: "tenant" }),
      });
      const targetLoginUrl = domain ? `/${domain}/login` : "/login";
      if (res.ok) {
        router.push(targetLoginUrl);
      } else {
        router.push(targetLoginUrl);
      }
    } catch (err) {
      const targetLoginUrl = domain ? `/${domain}/login` : "/login";
      router.push(targetLoginUrl);
    }
  };

  // Helper to check if a route is active
  const isActive = (path: string) => {
    // If the path is exactly "/{domain}/owner" or "/{domain}/staff", check for exact match
    if (path === basePath) {
      return pathname === basePath || pathname === `${basePath}/`;
    }
    // Otherwise check if pathname starts with the path
    return pathname.startsWith(path);
  };

  const navItems = [
    { name: "Dashboard", href: basePath, icon: LayoutDashboard },
  ];

  if (role === "staff") {
    if (capabilities.includes("order")) {
      navItems.push(
        { name: "Orders", href: `${basePath}/orders`, icon: ClipboardList },
        { name: "Kitchen", href: `${basePath}/kitchen`, icon: ChefHat }
      );
    }
  }

  if (capabilities.includes("pos") || capabilities.includes("order")) {
    navItems.push({ name: "Tables", href: `${basePath}/tables`, icon: Armchair });
  }

  if (capabilities.includes("reservation")) {
    navItems.push({
      name: "Reservations",
      href: `${basePath}/reservations`,
      icon: CalendarCheck,
    });
  }

  if (capabilities.includes("menu")) {
    navItems.push({ name: "Menu", href: `${basePath}/menu`, icon: Utensils });
  }

  if (capabilities.includes("qr_menu")) {
    navItems.push({ name: "QR Menu", href: `${basePath}/qr-menu`, icon: QrCode });
  }

  if (capabilities.includes("loyalty")) {
    navItems.push({ name: "Loyalty", href: `${basePath}/loyalty`, icon: Gift });
  }

  if (role === "owner") {
    navItems.push(
      {
        name: "Branches",
        href: `${basePath}/branches`,
        icon: Store,
      },
      {
        name: "Employees",
        href: `${basePath}/employees`,
        icon: Users,
      }
    );
  }

  // Extract first letter for logo
  const logoLetter = restaurantName
    ? restaurantName.charAt(0).toUpperCase()
    : "R";
  const displayAddress = branchAddress;

  return (
    <aside className="hidden md:flex md:w-56 lg:w-60 xl:w-[280px] bg-white border-r border-slate-200 flex-col shrink-0 h-full transition-all duration-300">
      {/* Logo Area */}
      <div className="h-20 flex items-center md:px-4 xl:px-6 gap-3 shrink-0 border-b border-transparent">
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

      {/* Branch Switcher Area */}
      {role === "owner" && (
        <div className="px-4 xl:px-6 pb-4 border-b border-slate-100 shrink-0">
          <BranchSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 md:px-3 xl:px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
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
                className={`w-5 h-5 shrink-0 ${active ? "text-white" : "text-slate-500"}`}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="md:p-3 xl:p-4 border-t border-slate-100 flex flex-col gap-1.5 shrink-0">
        {role === "owner" && (
          <Link
            href={`${basePath}/settings`}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              isActive(`${basePath}/settings`)
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Settings
              className={`w-5 h-5 shrink-0 ${isActive(`${basePath}/settings`) ? "text-white" : "text-slate-500"}`}
            />
            <span className="truncate">Settings</span>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </aside>
  );
}
