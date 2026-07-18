import {
  Armchair,
  CalendarCheck,
  Plus,
  Hourglass,
} from "lucide-react";
import Link from "next/link";

export default async function TenantStaffDashboard({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  // Mock data as requested to focus on UI first
  const mockActiveReservations = 24;
  const mockAvailableTables = 12;
  const mockTotalTables = 45;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Welcome Title */}
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          Welcome back, Arief
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening at Jakarta Central Branch today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Active Reservations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative flex flex-col justify-between h-[160px]">
          <div className="flex justify-between items-start relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Active Reservations
            </p>
            <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-lg shadow-sm">
              <Armchair className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10 flex items-baseline gap-2">
            <div className="text-4xl font-bold text-slate-900 leading-none">
              {mockActiveReservations}
            </div>
            <p className="text-slate-500 text-sm font-medium">Upcoming</p>
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
              {mockAvailableTables}
            </div>
            <p className="text-slate-500 text-sm font-medium">
              / {mockTotalTables} Total
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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[300px]">
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
      </div>
    </div>
  );
}
