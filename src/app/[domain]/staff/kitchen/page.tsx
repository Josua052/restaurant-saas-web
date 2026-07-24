import { Metadata } from "next";
import KitchenClient from "./KitchenClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Kitchen Dashboard",
  description: "Live order fulfillment and preparation tracking",
};

export default async function KitchenPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const cookieStore = await cookies();
  const staffToken = cookieStore.get("staff_access_token")?.value;

  if (!staffToken) {
    redirect(`/${domain}/login`);
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kitchen Dashboard</h1>
          <p className="text-sm font-medium text-slate-500">Live order fulfillment and preparation tracking</p>
        </div>
      </div>
      
      <div className="flex-1 pb-12">
        <KitchenClient 
          token={staffToken}
          apiUrl={process.env.NEXT_PUBLIC_API_URL || ""}
        />
      </div>
    </div>
  );
}
