import {
  Armchair,
  CalendarCheck,
  Plus,
  Hourglass,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TenantStaffDashboard({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("staff_access_token")?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  let reservationStats: any = null;
  let tableStats: any = null;
  let fetchError = null;
  let redirectUrl = "";
  if (token) {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch endpoints concurrently
      const [resReservations, resTables] = await Promise.all([
        fetch(`${API_URL}/management/reservations/stats`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/management/tables/stats`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (resReservations.status === 401 || resTables.status === 401) {
        redirectUrl = `/${domain}/login`;
      } else if (!resReservations.ok || !resTables.ok) {
        console.error("Dashboard API errors");
        fetchError = "Failed to fetch one or more dashboard metrics.";
      } else {
        const [jsonRes, jsonTab] = await Promise.all([
          resReservations.json(),
          resTables.json(),
        ]);

        reservationStats = jsonRes.data || { total_reservations: 0 };
        tableStats = jsonTab.data || { active_tables: 0, total_tables: 0 };
      }
    } catch (error: any) {
      console.error("Staff Dashboard Stats Fetch Error:", error);
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

  const activeRes = reservationStats?.total_reservations || 0;
  const activeTab = tableStats?.active_tables || 0;
  const totalTab = tableStats?.total_tables || 0;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Welcome Title */}
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          Welcome back, Staff
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening at your branch today.
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
        {/* Card 1: Active Reservations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Active Reservations
            </p>
            <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-lg shadow-sm">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10 flex items-baseline gap-2">
            <div className="text-4xl font-bold text-slate-900 leading-none">
              {activeRes}
            </div>
            <p className="text-slate-500 text-sm font-medium">Expected today</p>
          </div>
        </div>

        {/* Card 2: Tables Available */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Tables Available
            </p>
            <div className="w-10 h-10 bg-slate-100 text-slate-500 flex items-center justify-center rounded-lg">
              <Armchair className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10 flex items-baseline gap-2">
            <div className="text-4xl font-bold text-slate-900 leading-none">
              {activeTab}
            </div>
            <p className="text-slate-500 text-sm font-medium">
              / {totalTab} Total
            </p>
          </div>
        </div>

        {/* Card 3: New Walk-in? */}
        <div className="bg-indigo-700 p-6 rounded-xl shadow-md relative overflow-hidden flex flex-col justify-between h-[160px]">
          {/* Decorative background element */}
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="30" height="30" rx="4" fill="white"/>
              <rect x="50" y="10" width="30" height="30" rx="4" fill="white"/>
              <rect x="90" y="10" width="30" height="30" rx="4" fill="white"/>
              <rect x="10" y="50" width="30" height="30" rx="4" fill="white"/>
              <rect x="50" y="50" width="30" height="30" rx="4" fill="white"/>
              <rect x="90" y="50" width="30" height="30" rx="4" fill="white"/>
              <rect x="10" y="90" width="30" height="30" rx="4" fill="white"/>
              <rect x="50" y="90" width="30" height="30" rx="4" fill="white"/>
              <rect x="90" y="90" width="30" height="30" rx="4" fill="white"/>
            </svg>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-white text-lg font-bold mb-1">New Walk-in?</h3>
            <p className="text-indigo-200 text-sm mb-4">Quickly assign a table.</p>
            <button className="bg-white text-indigo-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Assign Table
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      {/* <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-[15px] font-bold text-slate-800">
            Recent Activity
          </h2>
          <Link
            href={`/${domain}/staff/activity`}
            className="text-indigo-600 font-semibold text-xs hover:text-indigo-700"
          >
            View All
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12">
          <Hourglass className="w-12 h-12 mb-3 text-slate-300" />
          <p className="text-sm font-medium">Activity feed loading...</p>
        </div>
      </div> */}
    </div>
  );
}
