export default function TenantLoginPage({ params }: { params: { domain: string } }) {
  // We can use params.domain (e.g., "kopia.com") to display customized branding.
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center space-y-4 mb-8">
          {/* Placeholder for dynamic logo */}
          <div className="h-16 w-16 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-2xl">
            {params.domain.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            Welcome to {params.domain}
          </h1>
          <p className="text-sm text-slate-500 text-center">
            Sign in to your account to continue
          </p>
        </div>
        
        {/* Placeholder Login Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <input type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input type="password" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" />
          </div>
          <button className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
