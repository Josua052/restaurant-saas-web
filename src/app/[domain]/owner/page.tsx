import {
  CalendarCheck,
  TrendingUp,
  Armchair,
  UtensilsCrossed,
  AlertTriangle,
  Plus,
  FileEdit,
  Users,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

interface ReservationStats {
  total_reservations: number;
  upcoming_reservations: Array<{
    id: string;
    guest_name: string;
    guest_initials: string;
    time: string;
    party_size: number;
    status: string;
  }>;
}

interface TableStats {
  active_tables: number;
  total_tables: number;
}

interface MenuStats {
  active_menu_items: number;
  sold_out_items: number;
  categories_count: number;
}

export default async function TenantOwnerDashboard({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("owner_access_token")?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  let reservationStats: ReservationStats | null = null;
  let tableStats: TableStats | null = null;
  let menuStats: MenuStats | null = null;
  let fetchError = null;
  let redirectUrl = "";

  if (token) {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all three endpoints concurrently using Promise.all
      // Backend now automatically handles tenant isolation from the token and sets default date.
      const [resReservations, resTables, resMenus] = await Promise.all([
        fetch(`${API_URL}/management/reservations/stats`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/management/tables/stats`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/management/menus/stats`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (resReservations.status === 401 || resTables.status === 401 || resMenus.status === 401) {
        redirectUrl = `/${domain}/login`;
      } else if (resMenus.status === 403) {
        // If 403 Forbidden, token is valid but wrong role (e.g. Staff token on Owner page)
        redirectUrl = `/${domain}/staff`;
      } else if (!resReservations.ok || !resTables.ok || !resMenus.ok) {
        // Detailed error logging for debugging
        const errDetails = await Promise.all([
          resReservations.ok ? null : resReservations.text(),
          resTables.ok ? null : resTables.text(),
          resMenus.ok ? null : resMenus.text(),
        ]);
        console.error("Dashboard API errors:", errDetails);
        fetchError = "Failed to fetch one or more dashboard metrics.";
      } else {
        const [jsonRes, jsonTab, jsonMen] = await Promise.all([
          resReservations.json(),
          resTables.json(),
          resMenus.json(),
        ]);

        reservationStats = jsonRes.data || {
          total_reservations: 0,
          upcoming_reservations: [],
        };
        tableStats = jsonTab.data || { active_tables: 0, total_tables: 0 };
        menuStats = jsonMen.data || {
          active_menu_items: 0,
          sold_out_items: 0,
          categories_count: 0,
        };
      }
    } catch (error: any) {
      console.error("Owner Dashboard Stats Fetch Error:", error);
      fetchError =
        error.message ||
        "Network error. Make sure the backend is running and endpoints exist.";
    }
  } else {
    redirectUrl = `/${domain}/login`;
  }

  // Perform redirect outside of try-catch block
  if (redirectUrl) {
    redirect(redirectUrl);
  }
  // Fallbacks if data is null (e.g. backend not ready)
  const totalRes = reservationStats?.total_reservations || 0;
  const activeTab = tableStats?.active_tables || 0;
  const totalTab = tableStats?.total_tables || 0;
  const activeMenu = menuStats?.active_menu_items || 0;
  const soldOut = menuStats?.sold_out_items || 0;
  const catCount = menuStats?.categories_count || 0;
  const upcoming = reservationStats?.upcoming_reservations || [];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Welcome Title */}
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          Welcome back, Owner
        </h1>
        <p className="text-slate-500 mt-1">
          Here is a summary of your branch's performance today.
        </p>
      </div>

      {fetchError && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{fetchError}</p>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[160px]">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-50 rounded-full z-0"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 bg-emerald-100/70 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
              <TrendingUp className="w-3 h-3" />
              Live
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Total Reservations
            </p>
            <div className="text-3xl font-bold text-slate-900 leading-none mb-1.5">
              {totalRes}
            </div>
            <p className="text-slate-500 text-sm">Expected for today</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[160px]">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-50 rounded-full z-0"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg">
              <Armchair className="w-5 h-5" />
            </div>
            <div className="text-slate-700 text-sm font-semibold pr-2 pt-1">
              {activeTab}/{totalTab}
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Active Tables
            </p>
            <div className="text-3xl font-bold text-slate-900 leading-none mb-1.5">
              {activeTab}
            </div>
            <p className="text-slate-500 text-sm">Currently occupied</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[160px]">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-50 rounded-full z-0"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 flex items-center justify-center rounded-lg">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            {soldOut > 0 && (
              <div className="flex items-center gap-1 bg-amber-100/80 text-amber-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {soldOut} Sold Out
              </div>
            )}
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Active Menu Items
            </p>
            <div className="text-3xl font-bold text-slate-900 leading-none mb-1.5">
              {activeMenu}
            </div>
            <p className="text-slate-500 text-sm">
              Across {catCount} categories
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm col-span-1">
          <div className="p-6">
            <h2 className="text-[17px] font-bold text-slate-900 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href={`/${domain}/owner/reservations`}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-md flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-700 text-sm group-hover:text-slate-900">
                    New Reservation
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </Link>
              <Link
                href={`/${domain}/owner/menu`}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-md flex items-center justify-center">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-700 text-sm group-hover:text-slate-900">
                    Update Menu
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </Link>
              <Link
                href={`/${domain}/owner/employees`}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-md flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-700 text-sm group-hover:text-slate-900">
                    Manage Staff
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Reservations Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm col-span-1 lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-slate-900">
              Upcoming Reservations
            </h2>
            <Link
              href={`/${domain}/owner/reservations`}
              className="text-indigo-600 font-semibold text-sm hover:text-indigo-700"
            >
              View All
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Guest</th>
                  <th className="px-6 py-4 font-bold">Time</th>
                  <th className="px-6 py-4 font-bold">Party Size</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcoming.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500 font-medium"
                    >
                      No upcoming reservations found for today.
                    </td>
                  </tr>
                ) : (
                  upcoming.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                            {res.guest_initials || "G"}
                          </div>
                          <span className="font-bold text-slate-700">
                            {res.guest_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {res.time}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {res.party_size} Pax
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold px-2.5 py-1 rounded-full text-[11px] ${
                            res.status.toLowerCase() === "confirmed"
                              ? "bg-amber-100/70 text-amber-700"
                              : res.status.toLowerCase() === "seated"
                                ? "bg-emerald-100/70 text-emerald-700"
                                : "bg-indigo-100/70 text-indigo-700"
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
