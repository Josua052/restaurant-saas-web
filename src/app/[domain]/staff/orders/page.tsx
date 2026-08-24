import { Metadata } from "next";
import OrdersClient from "./OrdersClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "POS Order - Staff",
  description: "Point of Sale interface for staff.",
};

export default async function StaffOrdersPage({
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
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 overflow-hidden">
      <OrdersClient
        token={staffToken}
        apiUrl={process.env.NEXT_PUBLIC_API_URL || ""}
      />
    </div>
  );
}
