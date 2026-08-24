import React from "react";
import OrderCard from "./OrderCard";
import { KitchenOrder } from "../types";

interface KanbanColumnProps {
  title: string;
  count: number;
  orders: KitchenOrder[];
  statusColor: string;
  onOrderClick: (order: KitchenOrder) => void;
  isCompleted?: boolean;
}

export default function KanbanColumn({ 
  title, 
  count, 
  orders, 
  statusColor, 
  onOrderClick,
  isCompleted = false
}: KanbanColumnProps) {
  return (
    <div className="flex-1 min-w-[320px] bg-slate-100/50 rounded-2xl flex flex-col h-full border border-slate-200">
      {/* Column Header */}
      <div className="p-5 border-b border-slate-200 shrink-0 flex items-center gap-3 bg-white/50 rounded-t-2xl">
        <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
        <h2 className="font-bold text-slate-800 text-lg">{title}</h2>
        <span className="text-sm font-semibold text-slate-400">({count})</span>
      </div>

      {/* Column Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-xl">
            No orders in {title}
          </div>
        ) : (
          orders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              isCompleted={isCompleted}
              onClick={() => onOrderClick(order)} 
            />
          ))
        )}
      </div>
    </div>
  );
}
