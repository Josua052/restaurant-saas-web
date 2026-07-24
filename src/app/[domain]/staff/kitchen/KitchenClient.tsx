"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import StatCards from "./components/StatCards";
import KanbanColumn from "./components/KanbanColumn";
import FulfillmentModal from "./components/FulfillmentModal";
import { KitchenOrder, KitchenStats, ApiOrder, MenuItem, TableItem } from "./types";

// Setup fetcher
const fetcher = async ([url, token]: [string, string]) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.message || "Failed to fetch data");
  }
  const json = await res.json();
  return json.data;
};

export default function KitchenClient({
  token,
  apiUrl,
}: {
  token: string;
  apiUrl: string;
}) {
  const apiUrlV2 = apiUrl.replace("/v1", "/v2");

  const [filterView, setFilterView] = useState<"All" | "Dine-in" | "Takeaway">("All");
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  // 1. Fetch Orders (today)
  const ordersUrl = `${apiUrlV2}/management/orders?date=today`;
  const { data: apiOrders = [], mutate: mutateOrders } = useSWR<ApiOrder[]>(
    [ordersUrl, token],
    fetcher,
    { refreshInterval: 10000 } // Poll every 10s
  );

  // 2. Fetch Menus to map menu_id to name
  const { data: menus = [] } = useSWR<MenuItem[]>(
    [`${apiUrl}/management/menus`, token],
    fetcher
  );

  // 3. Fetch Tables to map table_id to table_number
  const { data: tablesData = [] } = useSWR<TableItem[]>(
    [`${apiUrlV2}/management/tables?limit=100`, token],
    fetcher
  );

  // Map API Orders to UI KitchenOrders
  const uiOrders: KitchenOrder[] = useMemo(() => {
    return apiOrders.map((apiOrder) => {
      // Find Table Number
      let tableNumber = undefined;
      if (apiOrder.table_id) {
        const t = tablesData.find(t => t.id === apiOrder.table_id);
        if (t) tableNumber = t.table_number;
      }

      // Map Items
      const mappedItems = (apiOrder.order_items || []).map(item => {
        const m = menus.find(menu => menu.ID === item.menu_id);
        return {
          ...item,
          name: m ? m.Name : "Unknown Item"
        };
      });

      return {
        ...apiOrder,
        table_number: tableNumber,
        items: mappedItems,
      };
    });
  }, [apiOrders, menus, tablesData]);

  // Filter logic
  const filteredOrders = uiOrders.filter((o) =>
    filterView === "All" ? true : o.order_type === filterView
  );

  const preparingOrders = filteredOrders.filter((o) => o.fulfillment_status === 1);
  const readyOrders = filteredOrders.filter((o) => o.fulfillment_status === 2);
  const completedOrders = filteredOrders.filter((o) => o.fulfillment_status === 3).slice(0, 10);

  // Calculate Stats
  const stats: KitchenStats = useMemo(() => {
    return {
      newOrders: uiOrders.length,
      preparing: preparingOrders.length,
      completedToday: uiOrders.filter((o) => o.fulfillment_status === 3).length,
      cancelledToday: 0 // If you add status = 3 (Canceled) in future
    };
  }, [uiOrders, preparingOrders.length]);

  // Modals
  const closeModal = () => setSelectedOrder(null);

  // --- API MUTATION LOGIC ---
  const updateFulfillment = async (orderId: string, newStatus: number, servedItemIds: string[]) => {
    if (isMutating) return;
    setIsMutating(true);

    const payload = {
      fulfillment_status: newStatus,
      items_served: servedItemIds,
    };

    // Optimistic Update
    const optimisticData = apiOrders.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        fulfillment_status: newStatus,
        order_items: o.order_items.map((item) => ({
          ...item,
          ticket_status: servedItemIds.includes(item.id) ? 4 : 1,
        })),
      };
    });
    
    // Update local cache immediately without revalidating yet
    mutateOrders(optimisticData, false);

    try {
      const res = await fetch(`${apiUrlV2}/management/orders/${orderId}/fulfillment`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || "Failed to update order");
      }
      
      toast.success("Pesanan berhasil diperbarui");
      closeModal();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan jaringan");
      // Rollback on failure
      mutateOrders();
    } finally {
      setIsMutating(false);
      // Revalidate to ensure sync
      mutateOrders(); 
    }
  };

  const handleSaveProgress = (orderId: string, servedItemIds: string[]) => {
    updateFulfillment(orderId, 1, servedItemIds);
  };

  const handleMarkReady = (orderId: string) => {
    // If order type is takeaway, status goes to 2 (Ready).
    // The modal passes all currently checked items, plus we might want to ensure everything is checked, 
    // but the API spec says we just pass what's served.
    // For Mark Ready, let's just mark everything served if needed, or just pass current checked.
    // We'll pass all items as served for simplicity, or use selectedOrder's checked items.
    // Wait, the modal gives us checked items. But since it's a direct action, maybe we should get them from the component.
    // Actually, FulfillmentModal doesn't pass items to MarkReady in our current code. Let's fix that.
    // We will update the modal callback in a moment. For now, assume it passes servedItemIds.
  };

  const handleCompleteOrder = (orderId: string) => {
    // Complete order -> status 3, all items served
    const order = uiOrders.find((o) => o.id === orderId);
    if (!order) return;
    const allItemIds = order.items.map((i) => i.id);
    updateFulfillment(orderId, 3, allItemIds);
  };

  // Wrapper for mark ready since modal only sends orderId originally
  const handleMarkReadyWrapper = (orderId: string, servedItemIds: string[]) => {
    updateFulfillment(orderId, 2, servedItemIds);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-50">
      <div className="sticky top-[73px] z-30 p-6 shrink-0 bg-slate-50/90 backdrop-blur-md shadow-sm border-b border-slate-200">
        <StatCards stats={stats} />
        
        <div className="flex gap-2 mt-4">
          {(["All", "Dine-in", "Takeaway"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterView(f)}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-colors border ${
                filterView === f
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6 pt-0">
        <div className="flex h-full gap-6 min-w-max">
          <KanbanColumn
            title="Preparing"
            count={preparingOrders.length}
            orders={preparingOrders}
            statusColor="bg-orange-500"
            onOrderClick={setSelectedOrder}
          />
          <KanbanColumn
            title="Ready"
            count={readyOrders.length}
            orders={readyOrders}
            statusColor="bg-emerald-500"
            onOrderClick={setSelectedOrder}
          />
          <KanbanColumn
            title="Completed (Last 10)"
            count={completedOrders.length}
            orders={completedOrders}
            statusColor="bg-slate-300"
            onOrderClick={setSelectedOrder}
            isCompleted={true}
          />
        </div>
      </div>

      {selectedOrder && (
        <FulfillmentModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={closeModal}
          onSaveProgress={handleSaveProgress}
          onMarkReady={(id, servedIds) => handleMarkReadyWrapper(id, servedIds)}
          onCompleteOrder={handleCompleteOrder}
          isMutating={isMutating}
        />
      )}
    </div>
  );
}
