import { ReactNode } from "react";

export default function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { domain: string };
}) {
  // In a real app, you would fetch tenant settings (colors, logo) from DB based on params.domain
  // For now, we'll just provide a clean wrapper.
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Optional: You can inject dynamic CSS variables here based on tenant brand color */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
