import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ReservationsClient from "./ReservationsClient";

export const metadata: Metadata = {
  title: "Reservations",
  description: "Manage table bookings and capacity.",
};

export default async function ReservationsPage({
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
    <div className="flex flex-col min-h-screen bg-slate-50 w-full">
      <ReservationsClient
        token={staffToken}
        apiUrl={process.env.NEXT_PUBLIC_API_URL || ""}
      />
    </div>
  );
}
