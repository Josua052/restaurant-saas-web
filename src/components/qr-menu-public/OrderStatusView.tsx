import React from "react";
import { CheckCircle, Clock, ChefHat, Info, Store } from "lucide-react";

interface OrderStatusViewProps {
  tenantInfo: any;
  order: any;
  onNewOrder: () => void;
  formatPrice: (price: number) => string;
}

export default function OrderStatusView({
  tenantInfo,
  order,
  onNewOrder,
  formatPrice,
}: OrderStatusViewProps) {
  if (!order) return null;

  // Render Status
  // FulfillmentStatus: 1=Preparing, 2=Ready, 3=Completed
  const steps = [
    { label: "Pesanan Diterima", active: true },
    { label: "Sedang Diproses", active: order.fulfillment_status >= 1 },
    { label: "Siap Disajikan", active: order.fulfillment_status >= 2 },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-24 overflow-y-auto">
      {/* Header */}
      <div className="bg-indigo-700 text-white px-4 py-8 pb-12 text-center rounded-b-[40px] shadow-sm">
        <h2 className="text-indigo-100 font-medium text-sm mb-1">Status Pesanan</h2>
        <div className="text-3xl font-bold font-heading">
          {order.queue_number || order.receipt_number || "#Order"}
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* Waktu Tunggu */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Estimasi Waktu Tunggu</p>
              <p className="font-bold text-slate-800">12 - 15 Menit</p>
            </div>
          </div>
        </div>

        {/* Timeline Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-indigo-600" />
            Lacak Pesanan
          </h3>
          <div className="relative pl-3 space-y-6">
            {/* Garis vertikal penghubung */}
            <div className="absolute top-2 bottom-2 left-[15px] w-0.5 bg-slate-100"></div>

            {steps.map((step, idx) => (
              <div key={idx} className="relative flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full border-2 bg-white z-10 ${
                  step.active ? "border-indigo-600" : "border-slate-300"
                }`}></div>
                <div className={`text-sm font-medium ${step.active ? "text-slate-800" : "text-slate-400"}`}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ringkasan Pesanan */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Pesanan Anda</h3>
          <div className="space-y-3">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-300 overflow-hidden">
                  {/* Kalau ada gambar menu di item, tampilkan */}
                  {item.menu?.image_url ? (
                     <img src={item.menu.image_url} alt={item.menu?.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-slate-800">{item.menu?.name || "Menu Item"}</h4>
                  {item.notes && <p className="text-[10px] text-slate-500 italic mt-0.5">Catatan: {item.notes}</p>}
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-slate-600">{item.quantity}x</p>
                    <p className="font-bold text-sm text-indigo-700">{formatPrice(item.price_at_order * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-900">
            <span>Total Tagihan</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>

        {/* Pesan Lagi Button */}
        <button
          onClick={onNewOrder}
          className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold py-3.5 rounded-xl transition-all"
        >
          Pesan Lagi
        </button>
      </div>

      {/* Floating Bantuan / Bill (hanya UI statis sementara) */}
      <div className="fixed bottom-6 right-4 z-30">
        <button className="bg-slate-800 hover:bg-slate-900 text-white shadow-lg rounded-full px-4 py-2.5 flex items-center gap-2 text-sm font-semibold transition-all">
          <Info className="w-4 h-4" />
          Bantuan / Bill
        </button>
      </div>
    </div>
  );
}
