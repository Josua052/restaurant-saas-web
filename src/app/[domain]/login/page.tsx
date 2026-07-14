import { TenantLoginForm } from "./components/tenant-login-form";

export default async function TenantLoginPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center space-y-4 mb-8">
          {/* Placeholder for dynamic logo */}
          <div className="h-16 w-16 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-2xl">
            {domain.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            Welcome to {domain}
          </h1>
          <p className="text-sm text-slate-500 text-center">
            Sign in to your account to continue
          </p>
        </div>
        
        {/* Render Client Form Component */}
        <TenantLoginForm domain={domain} />
      </div>
    </div>
  );
}
