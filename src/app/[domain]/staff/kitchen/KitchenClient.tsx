"use client";

import React, { useState } from "react";
import StatCards from "./components/StatCards";
import KanbanColumn from "./components/KanbanColumn";
import FulfillmentModal from "./components/FulfillmentModal";
import { KitchenOrder, KitchenStats } from "./types";

// Mockup Data
const initialOrders: KitchenOrder[] = [
  {
    id: "1",
    receipt_number: "204",
    order_type: "Dine-in",
    table_number: "12",
    fulfillment_status: 1, // Preparing
    created_at: new Date(Date.now() - 18 * 60000).toISOString(), // 18 mins ago
    items: [
      { id: "i1", name: "Steak Frites", quantity: 1, notes: "Med-Rare", ticket_status: 1 },
      { id: "i2", name: "Caesar Salad", quantity: 1, ticket_status: 4 }, // served
      { id: "i3", name: "Iced Tea", quantity: 2, ticket_status: 1 }
    ]
  },
  {
    id: "2",
    receipt_number: "210",
    order_type: "Takeaway",
    customer_name: "Jane Doe",
    fulfillment_status: 1, // Preparing
    created_at: new Date(Date.now() - 22 * 60000).toISOString(), // 22 mins ago (Overdue)
    items: [
      { id: "i4", name: "Classic Burger", quantity: 2, ticket_status: 1 },
      { id: "i5", name: "Truffle Fries", quantity: 1, ticket_status: 4 },
      { id: "i6", name: "Milkshake", quantity: 3, ticket_status: 1 }
    ]
  },
  {
    id: "3",
    receipt_number: "201",
    order_type: "Takeaway",
    customer_name: "Grab - Order 88A",
    fulfillment_status: 2, // Ready
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    items: [
      { id: "i7", name: "Spaghetti Carbonara", quantity: 1, ticket_status: 4 },
      { id: "i8", name: "Garlic Bread", quantity: 1, ticket_status: 4 }
    ]
  },
  {
    id: "4",
    receipt_number: "198",
    order_type: "Dine-in",
    table_number: "4",
    fulfillment_status: 3, // Completed
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    items: [
      { id: "i9", name: "Fish and Chips", quantity: 2, ticket_status: 4 }
    ]
  },
  {
    id: "5",
    receipt_number: "195",
    order_type: "Takeaway",
    customer_name: "John Smith",
    fulfillment_status: 3, // Completed
    created_at: new Date(Date.now() - 80 * 60000).toISOString(),
    items: [
      { id: "i10", name: "Chicken Wings", quantity: 1, ticket_status: 4 }
    ]
  }
];

const mockStats: KitchenStats = {
  newOrders: 24,
  preparing: 8,
  completedToday: 142,
  cancelledToday: 3
};

export default function KitchenClient() {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const [filterView, setFilterView] = useState<"All" | "Dine-in" | "Takeaway">("All");
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);

  // Filter logic
  const filteredOrders = orders.filter(o => 
    filterView === "All" ? true : o.order_type === filterView
  );

  const preparingOrders = filteredOrders.filter(o => o.fulfillment_status === 1);
  const readyOrders = filteredOrders.filter(o => o.fulfillment_status === 2);
  const completedOrders = filteredOrders.filter(o => o.fulfillment_status === 3).slice(0, 10); // limit 10

  // Modal Handlers
  const handleOrderClick = (order: KitchenOrder) => {
    // Only allow editing for preparing or ready (if needed) orders. For completed, we just view.
    setSelectedOrder(order);
  };

  const closeModal = () => setSelectedOrder(null);

  const handleSaveProgress = (orderId: string, servedItemIds: string[]) => {
    // Update local state ticket_status to 4 for checked items, 1 for unchecked
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        items: o.items.map(item => ({
          ...item,
          ticket_status: servedItemIds.includes(item.id) ? 4 : 1
        }))
      };
    }));
    closeModal();
  };

  const handleMarkReady = (orderId: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, fulfillment_status: 2 } : o
    ));
    closeModal();
  };

  const handleCompleteOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { 
        ...o, 
        fulfillment_status: 3,
        // Optional: mark all items as served when completed
        items: o.items.map(i => ({ ...i, ticket_status: 4 })) 
      } : o
    ));
    closeModal();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
      {/* Top Header & Stats */}
      <div className="p-6 shrink-0 bg-slate-50">
        <StatCards stats={mockStats} />
        
        {/* Filter */}
        <div className="flex gap-2">
          {(["All", "Dine-in", "Takeaway"] as const).map(f => (
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

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6 pt-0">
        <div className="flex h-full gap-6 min-w-max">
          <KanbanColumn 
            title="Preparing" 
            count={preparingOrders.length}
            orders={preparingOrders}
            statusColor="bg-orange-500"
            onOrderClick={handleOrderClick}
          />
          
          <KanbanColumn 
            title="Ready" 
            count={readyOrders.length}
            orders={readyOrders}
            statusColor="bg-emerald-500"
            onOrderClick={handleOrderClick}
          />

          <KanbanColumn 
            title="Completed (Last 10)" 
            count={completedOrders.length}
            orders={completedOrders}
            statusColor="bg-slate-300"
            onOrderClick={handleOrderClick}
            isCompleted={true}
          />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <FulfillmentModal 
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={closeModal}
          onSaveProgress={handleSaveProgress}
          onMarkReady={handleMarkReady}
          onCompleteOrder={handleCompleteOrder}
        />
      )}
    </div>
  );
}
