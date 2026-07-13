export default function TenantOwnerDashboard({ params }: { params: { domain: string } }) {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Owner Dashboard</h1>
        <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
          {params.domain}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Today's Revenue</h2>
          <p className="text-3xl font-bold text-slate-900 mt-2">Rp 4.250.000</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Active Orders</h2>
          <p className="text-3xl font-bold text-slate-900 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Staff Online</h2>
          <p className="text-3xl font-bold text-slate-900 mt-2">4</p>
        </div>
      </div>
    </div>
  );
}
