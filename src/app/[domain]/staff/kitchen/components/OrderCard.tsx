import React, { useEffect, useState } from "react";
import { Timer, Utensils, AlertTriangle } from "lucide-react";
import { KitchenOrder } from "../types";

interface OrderCardProps {
  order: KitchenOrder;
  onClick?: () => void;
  isCompleted?: boolean;
}

export default function OrderCard({ order, onClick, isCompleted = false }: OrderCardProps) {
  const [minutesElapsed, setMinutesElapsed] = useState(0);

  useEffect(() => {
    if (isCompleted) return;

    const calcTime = () => {
      const created = new Date(order.created_at).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((now - created) / 60000);
      setMinutesElapsed(diff);
    };

    calcTime();
    const interval = setInterval(calcTime, 60000);
    return () => clearInterval(interval);
  }, [order.created_at, isCompleted]);

  const isOverdue = !isCompleted && minutesElapsed >= 20;

  // Calculate items served
  const totalItems = order.items.length;
  const servedItems = order.items.filter(i => i.ticket_status === 4).length;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border-2 transition-all cursor-pointer hover:shadow-md ${
        isOverdue ? 'border-red-400' : 'border-transparent shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-black text-slate-900">#{order.receipt_number}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              order.order_type === 'Dine-in' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {order.order_type}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-600">
            {order.order_type === 'Dine-in' ? `Meja ${order.table_number || '-'}` : (order.customer_name || 'Takeaway')}
          </p>
        </div>
        
        {!isCompleted && (
          <div className={`flex items-center gap-1.5 text-sm font-bold ${
            isOverdue ? 'text-red-600 animate-pulse' : 'text-slate-500'
          }`}>
            {isOverdue ? <AlertTriangle className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
            {minutesElapsed}m ago
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-2">
        {order.items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex justify-between items-start text-sm">
            <span className="font-medium text-slate-800 line-clamp-1 flex-1">
              {item.quantity}x {item.name}
            </span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-xs font-semibold text-slate-500 italic mt-2">
            + {order.items.length - 3} lainnya...
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
          <Utensils className="w-3.5 h-3.5" />
          [{servedItems}/{totalItems} Served]
        </div>
        
        <div className="text-xs font-bold">
          {order.fulfillment_status === 1 && (
            <span className="text-orange-600 bg-orange-100 px-3 py-1.5 rounded-lg">Cooking</span>
          )}
          {order.fulfillment_status === 2 && (
            <span className="text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-lg">Ready</span>
          )}
          {order.fulfillment_status === 3 && (
            <span className="text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">Completed</span>
          )}
        </div>
      </div>
    </div>
  );
}
