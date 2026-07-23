import {
  Armchair,
  Calendar,
  TrendingUp,
  Utensils,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default async function TenantStaffDashboard() {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 font-sans p-6 md:p-8 bg-slate-50/50 min-h-screen">
      {/* Welcome Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, Arief
        </h1>
        <p className="text-slate-500 mt-1">
          Here's what's happening at Jakarta Central Branch today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Reservations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[180px]">
          {/* Decorative Shape */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#F1F0FA] rounded-full opacity-80 pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-12 bg-[#F1F0FA] text-indigo-600 flex items-center justify-center rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="bg-[#D1F4E0] text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              +12%
            </div>
          </div>
          
          <div className="relative z-10 mt-auto">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Total Reservations
            </p>
            <div className="text-4xl font-bold text-slate-900 leading-none mb-2">
              142
            </div>
            <p className="text-slate-500 text-sm">
              Expected for today
            </p>
          </div>
        </div>

        {/* Card 2: Active Tables */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[180px]">
          {/* Decorative Shape */}
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-[#E6E8FA] rounded-full opacity-60 pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-12 bg-[#EEF2FF] text-indigo-500 flex items-center justify-center rounded-xl">
              <Armchair className="w-6 h-6" />
            </div>
            <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
              42/50 Capacity
            </div>
          </div>
          
          <div className="relative z-10 mt-auto">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Active Tables
            </p>
            <div className="text-4xl font-bold text-slate-900 leading-none mb-2">
              38
            </div>
            <p className="text-slate-500 text-sm">
              Currently occupied
            </p>
          </div>
        </div>

        {/* Card 3: Active Menu Items */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[180px]">
          {/* Decorative Shape */}
          <div className="absolute -right-10 top-1/4 w-36 h-36 bg-slate-100 rounded-full opacity-80 pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-12 bg-slate-200 text-slate-700 flex items-center justify-center rounded-xl">
              <Utensils className="w-6 h-6" />
            </div>
            <div className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              2 Sold Out
            </div>
          </div>
          
          <div className="relative z-10 mt-auto">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Active Menu Items
            </p>
            <div className="text-4xl font-bold text-slate-900 leading-none mb-2">
              86
            </div>
            <p className="text-slate-500 text-sm">
              Across 8 categories
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
            href="#"
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
              
              {/* Row 1 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E8EEF2] text-slate-600 font-bold flex items-center justify-center text-sm">
                      JD
                    </div>
                    <span className="font-semibold text-slate-900">John Doe</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-slate-600">
                  19:00
                </td>
                <td className="px-6 py-4 text-center text-slate-600">
                  4 Pax
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Confirmed
                  </span>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E2E8F0] text-slate-600 font-bold flex items-center justify-center text-sm">
                      AS
                    </div>
                    <span className="font-semibold text-slate-900">Alice Smith</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-slate-600">
                  19:30
                </td>
                <td className="px-6 py-4 text-center text-slate-600">
                  2 Pax
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-[#D1F4E0] text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Seated
                  </span>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E6E8FA] text-slate-600 font-bold flex items-center justify-center text-sm">
                      MJ
                    </div>
                    <span className="font-semibold text-slate-900">Michael Johnson</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-slate-600">
                  20:00
                </td>
                <td className="px-6 py-4 text-center text-slate-600">
                  6 Pax
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-[#EAEBFE] text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Arrived
                  </span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}