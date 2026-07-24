import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { KitchenOrder } from "../types";

interface FulfillmentModalProps {
  order: KitchenOrder;
  isOpen: boolean;
  onClose: () => void;
  onSaveProgress: (orderId: string, servedItemIds: string[]) => void;
  onMarkReady: (orderId: string) => void;
  onCompleteOrder: (orderId: string) => void;
}

export default function FulfillmentModal({ 
  order, 
  isOpen, 
  onClose,
  onSaveProgress,
  onMarkReady,
  onCompleteOrder
}: FulfillmentModalProps) {
  // Local state to track which items are currently checked (served) in the UI
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Initialize checked items from order ticket_status
      const servedIds = order.items.filter(i => i.ticket_status === 4).map(i => i.id);
      setCheckedItems(servedIds);
    }
  }, [isOpen, order]);

  if (!isOpen) return null;

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  const isAllServed = checkedItems.length === order.items.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Order #{order.receipt_number} Fulfillment
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              {order.order_type} • {order.order_type === 'Dine-in' ? `Meja ${order.table_number}` : (order.customer_name || 'Pelanggan')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Checklist */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Preparation Checklist</p>
          
          <div className="space-y-3">
            {order.items.map(item => {
              const isChecked = checkedItems.includes(item.id);
              return (
                <div 
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex gap-4 ${
                    isChecked 
                      ? 'bg-white border-slate-200' 
                      : 'bg-white border-indigo-100 hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border shrink-0 mt-0.5 ${
                    isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div>
                    <h4 className={`font-bold text-base transition-colors ${
                      isChecked ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}>
                      {item.quantity}x {item.name}
                    </h4>
                    {item.notes && (
                      <p className={`text-sm mt-1 ${isChecked ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-white shrink-0 flex gap-3 flex-wrap sm:flex-nowrap">
          <button 
            onClick={() => onSaveProgress(order.id, checkedItems)}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold bg-white hover:bg-slate-50 transition-colors"
          >
            Save Progress
          </button>
          
          {order.fulfillment_status === 1 && order.order_type === 'Takeaway' && (
            <button 
              onClick={() => onMarkReady(order.id)}
              className="flex-1 py-3 px-4 rounded-xl text-yellow-700 font-bold bg-yellow-100 hover:bg-yellow-200 transition-colors"
            >
              Mark Ready
            </button>
          )}

          <button 
            disabled={!isAllServed}
            onClick={() => onCompleteOrder(order.id)}
            className="flex-1 py-3 px-4 rounded-xl text-white font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 transition-colors shadow-sm"
          >
            Complete Order
          </button>
        </div>
      </div>
    </div>
  );
}
