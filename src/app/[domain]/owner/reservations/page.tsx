import { cookies } from "next/headers";
import ReservationsClient from "./ReservationsClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function ReservationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("owner_access_token")?.value;

  let ownerName = "";
  let reservations = [];
  let reservationStats = {
    total_reservations: 0,
    upcoming_reservations: [],
    pending_confirmations: 0,
  };
  let tableStats = { total_tables: 0, active_tables: 0 };
  let menuStats = {
    active_menu_items: 0,
    sold_out_items: 0,
    categories_count: 0,
  };

  if (token) {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch User Profile to get Owner Name
      const meRes = await fetch(`${API_URL}/management/auth/me`, {
        headers,
        cache: "no-store",
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        ownerName = meData.data?.name || "";
      }

      // Fetch all required data concurrently using Promise.all
      const [resList, resStats, tabStats, menStats] = await Promise.all([
        fetch(`${API_URL}/management/reservations`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/management/reservations/stats`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/management/tables/stats`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/management/menus/stats`, {
          headers,
          cache: "no-store",
        }),
      ]);

      if (resList.ok) {
        const jsonList = await resList.json();
        reservations = jsonList.data || [];
      }

      if (resStats.ok) {
        const jsonResStats = await resStats.json();
        reservationStats = jsonResStats.data || reservationStats;
      }

      if (tabStats.ok) {
        const jsonTabStats = await tabStats.json();
        tableStats = jsonTabStats.data || tableStats;
      }

      if (menStats.ok) {
        const jsonMenStats = await menStats.json();
        menuStats = jsonMenStats.data || menuStats;
      }
    } catch (error) {
      console.error("Failed to fetch data for reservations page:", error);
    }
  }

  return (
    <ReservationsClient
      ownerName={ownerName}
      reservations={reservations}
      reservationStats={reservationStats}
      tableStats={tableStats}
      menuStats={menuStats}
    />
  );
}
