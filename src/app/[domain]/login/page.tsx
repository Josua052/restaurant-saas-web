import { TenantLoginForm } from "./components/tenant-login-form";

export default async function TenantLoginPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  let restaurantName = domain;
  let logoUrl = null;

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    if (API_URL) {
      // Don't cache to allow dynamic updates
      const res = await fetch(`${API_URL}/public/tenant/${domain}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          restaurantName = json.data.restaurant_name || domain;
          logoUrl = json.data.logo_url;
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch public tenant info:", err);
  }

  // Extract and format fallback restaurant name
  const formattedDefaultName = domain
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const displayName = restaurantName === domain ? formattedDefaultName : restaurantName;

  const initial = displayName ? displayName.charAt(0).toUpperCase() : "R";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center space-y-4 mb-8">
          {logoUrl ? (
            <div className="h-auto w-16 rounded-xl flex items-center justify-center overflow-hidden ">
              <img
                src={logoUrl}
                alt={`${displayName} Logo`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-16 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm">
              {initial}
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-900 text-center">
            Welcome to {displayName}
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
