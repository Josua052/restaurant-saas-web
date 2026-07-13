export default function TenantStaffDashboard({ params }: { params: { domain: string } }) {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Cashier System</h1>
        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
          {params.domain}
        </div>
      </div>
      
      <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Point of Sale (POS)</h2>
        <p className="text-slate-500 mt-2 max-w-sm">
          The cashier interface for {params.domain} will be displayed here. Ready to take orders.
        </p>
        <button className="mt-6 bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
          New Order
        </button>
      </div>
    </div>
  );
}
