import {
  Armchair,
  Calendar,
  TrendingUp,
  Utensils,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Define the API response structures
interface UpcomingReservation {
  guest_name: string;
  time: string;
  party_size: number;
  status: number;
}

interface StaffDashboardStats {
  today_reservations: number;
  reservation_trend: number;
  occupied_tables: number;
  total_tables: number;
  active_menu_items: number;
  total_categories: number;
  sold_out_items: number;
  upcoming_reservations: UpcomingReservation[];
}

const mockStaffDashboardStats: StaffDashboardStats = {
  today_reservations: 14,
  reservation_trend: 12,
  occupied_tables: 8,
  total_tables: 20,
  active_menu_items: 46,
  total_categories: 6,
  sold_out_items: 2,
  upcoming_reservations: [
    { guest_name: "Budi Santoso", time: "18:30", party_size: 4, status: 2 },
    { guest_name: "Siti Aminah", time: "19:00", party_size: 2, status: 2 },
    { guest_name: "Hendra Setiawan", time: "19:30", party_size: 6, status: 3 },
    { guest_name: "Rian Pratama", time: "20:00", party_size: 8, status: 2 },
  ],
};

export default async function TenantStaffDashboard({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("staff_access_token")?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const isMockEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK === "true" || !API_URL;

  let stats: StaffDashboardStats | null = null;
  let fetchError = null;
  let redirectUrl = "";

  if (token) {
    if (isMockEnabled) {
      stats = mockStaffDashboardStats;
    } else {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const API_URL_V2 = API_URL ? API_URL.replace("/v1", "/v2") : "";

        const res = await fetch(`${API_URL_V2}/management/dashboard/staff`, {
          headers,
          cache: "no-store", // Dashboard should always be fresh
        });

        if (res.status === 401) {
          redirectUrl = `/${domain}/login`;
        } else if (!res.ok) {
          stats = mockStaffDashboardStats;
        } else {
          const jsonRes = await res.json();
          stats = jsonRes.data;
        }
      } catch (error: unknown) {
        console.warn("Staff Dashboard Fallback to Mock:", error);
        stats = mockStaffDashboardStats;
      }
    }
  } else {
    redirectUrl = `/${domain}/login`;
  }

  // Perform redirect outside of try-catch block
  if (redirectUrl) {
    redirect(redirectUrl);
  }

  // Helper for Initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper for Status Badge
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 2: // Confirmed
        return (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
            Confirmed
          </span>
        );
      case 3: // CheckedIn/Arrived
        return (
          <span className="bg-[#EAEBFE] text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
            Arrived
          </span>
        );
      case 4: // Seated
        return (
          <span className="bg-[#D1F4E0] text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
            Seated
          </span>
        );
      default: // Pending / Others
        return (
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 font-sans bg-slate-50/50 min-h-screen">
      {/* Welcome Title */}
      <div className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-sm  md:flex-row items-start md:items-center gap-4 px-6 md:px-8 py-5">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, Staff
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening at your branch today.
        </p>
      </div>

      <div className="p-6 md:p-8">
        {fetchError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{fetchError}</p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Reservations */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[180px]">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#F1F0FA] rounded-full opacity-80 pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 bg-[#F1F0FA] text-indigo-600 flex items-center justify-center rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              {stats && stats.reservation_trend >= 0 ? (
                <div className="bg-[#D1F4E0] text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />+
                  {stats.reservation_trend}%
                </div>
              ) : (
                <div className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 rotate-180" />
                  {stats?.reservation_trend || 0}%
                </div>
              )}
            </div>

            <div className="relative z-10 mt-auto">
              <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
                Total Reservations
              </p>
              <div className="text-4xl font-bold text-slate-900 leading-none mb-2">
                {stats?.today_reservations || 0}
              </div>
              <p className="text-slate-500 text-sm">Expected for today</p>
            </div>
          </div>

          {/* Card 2: Active Tables */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[180px]">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-[#E6E8FA] rounded-full opacity-60 pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 bg-[#EEF2FF] text-indigo-500 flex items-center justify-center rounded-xl">
                <Armchair className="w-6 h-6" />
              </div>
              <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                {stats?.occupied_tables || 0}/{stats?.total_tables || 0}{" "}
                Capacity
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
                Active Tables
              </p>
              <div className="text-4xl font-bold text-slate-900 leading-none mb-2">
                {stats?.occupied_tables || 0}
              </div>
              <p className="text-slate-500 text-sm">Currently occupied</p>
            </div>
          </div>

          {/* Card 3: Active Menu Items */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[180px]">
            <div className="absolute -right-10 top-1/4 w-36 h-36 bg-slate-100 rounded-full opacity-80 pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 bg-slate-200 text-slate-700 flex items-center justify-center rounded-xl">
                <Utensils className="w-6 h-6" />
              </div>
              {stats && stats.sold_out_items > 0 ? (
                <div className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {stats.sold_out_items} Sold Out
                </div>
              ) : (
                <div className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  All Available
                </div>
              )}
            </div>

            <div className="relative z-10 mt-auto">
              <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
                Active Menu Items
              </p>
              <div className="text-4xl font-bold text-slate-900 leading-none mb-2">
                {stats?.active_menu_items || 0}
              </div>
              <p className="text-slate-500 text-sm">
                Across {stats?.total_categories || 0} categories
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Reservations Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-8">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Upcoming Reservations
            </h2>
            <Link
              href={`/${domain}/staff/reservations`}
              className="text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-900 text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">GUEST</th>
                  <th className="px-6 py-4 text-center">TIME</th>
                  <th className="px-6 py-4 text-center">PARTY SIZE</th>
                  <th className="px-6 py-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {stats?.upcoming_reservations &&
                stats.upcoming_reservations.length > 0 ? (
                  stats.upcoming_reservations.map((res, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-sm border border-slate-200">
                            {getInitials(res.guest_name)}
                          </div>
                          <span className="font-semibold text-slate-900">
                            {res.guest_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600 font-medium">
                        {res.time}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {res.party_size} Pax
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(res.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      No upcoming reservations today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
