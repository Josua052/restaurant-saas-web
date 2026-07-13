import { 
  CalendarCheck, 
  TrendingUp,
  Armchair,
  UtensilsCrossed,
  AlertTriangle,
  Plus,
  FileEdit,
  Users,
  ChevronRight
} from "lucide-react"

export default function TenantOwnerDashboard({ params }: { params: { domain: string } }) {
  return (
    <div className="w-full max-w-6xl space-y-8">
      {/* Welcome Title */}
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Welcome back, Elena</h1>
        <p className="text-slate-500 mt-1">Here is a summary of your branch's performance today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[160px]">
          {/* Background ornament */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-50 rounded-full z-0"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 bg-emerald-100/70 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
              <TrendingUp className="w-3 h-3" />
              +12%
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">Total Reservations</p>
            <div className="text-3xl font-bold text-slate-900 leading-none mb-1.5">142</div>
            <p className="text-slate-500 text-sm">Expected for today</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[160px]">
          {/* Background ornament */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-50 rounded-full z-0"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg">
              <Armchair className="w-5 h-5" />
            </div>
            <div className="text-slate-700 text-sm font-semibold pr-2 pt-1">
              42/50
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">Active Tables</p>
            <div className="text-3xl font-bold text-slate-900 leading-none mb-1.5">38</div>
            <p className="text-slate-500 text-sm">Currently occupied</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[160px]">
          {/* Background ornament */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-50 rounded-full z-0"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 flex items-center justify-center rounded-lg">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 bg-amber-100/80 text-amber-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              2 Sold Out
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">Active Menu Items</p>
            <div className="text-3xl font-bold text-slate-900 leading-none mb-1.5">86</div>
            <p className="text-slate-500 text-sm">Across 8 categories</p>
          </div>
        </div>

      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions (1/3 width) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm col-span-1">
          <div className="p-6">
            <h2 className="text-[17px] font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-md flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-slate-700 text-sm group-hover:text-slate-900">New Reservation</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-md flex items-center justify-center">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-700 text-sm group-hover:text-slate-900">Update Menu</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-md flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-700 text-sm group-hover:text-slate-900">Manage Staff</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Reservations Table (2/3 width) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm col-span-1 lg:col-span-2 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-slate-900">Upcoming Reservations</h2>
            <button className="text-indigo-600 font-semibold text-sm hover:text-indigo-700">View All</button>
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
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        JD
                      </div>
                      <span className="font-bold text-slate-700">John Doe</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">19:00</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">4 Pax</td>
                  <td className="px-6 py-4">
                    <span className="bg-amber-100/70 text-amber-700 font-bold px-2.5 py-1 rounded-full text-[11px]">
                      Confirmed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        AS
                      </div>
                      <span className="font-bold text-slate-700">Alice Smith</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">19:30</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">2 Pax</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-100/70 text-emerald-700 font-bold px-3 py-1 rounded-full text-[11px]">
                      Seated
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        MJ
                      </div>
                      <span className="font-bold text-slate-700">Michael Johnson</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">20:00</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">6 Pax</td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-100/70 text-indigo-700 font-bold px-2.5 py-1 rounded-full text-[11px]">
                      Arrived
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
