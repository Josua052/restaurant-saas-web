import React, { useState } from "react";
import { ArrowLeft, MapPin, Receipt, CheckCircle, Store } from "lucide-react";
import { CartItem } from "./QRMenuPublicClient";

interface CheckoutViewProps {
  tenantInfo: any;
  tableNumber: string;
  cart: CartItem[];
  cartTotal: number;
  onBack: () => void;
  onConfirm: (customerName: string, paymentMethod: string) => void;
  isSubmitting: boolean;
}

export default function CheckoutView({
  tenantInfo,
  tableNumber,
  cart,
  cartTotal,
  onBack,
  onConfirm,
  isSubmitting,
}: CheckoutViewProps) {
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cashier"); // default

  // Hitung tax, misalnya 11% (bisa diambil dari tenantInfo jika ada)
  const taxRate = tenantInfo?.tax_rate ? parseFloat(tenantInfo.tax_rate) : 11;
  const taxAmount = (cartTotal * taxRate) / 100;
  const totalAmount = cartTotal + taxAmount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: tenantInfo?.currency || "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleConfirm = () => {
    if (!customerName.trim()) {
      alert("Silakan masukkan nama pemesan terlebih dahulu.");
      return;
    }
    onConfirm(customerName, paymentMethod);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="font-bold text-lg text-slate-800">Konfirmasi</div>
        <div className="w-10 h-10"></div> {/* Spacer */}
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Lokasi */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Lokasi</p>
              <p className="font-bold text-slate-800">{tableNumber || "Meja"}</p>
            </div>
          </div>
        </div>

        {/* Ringkasan Pesanan */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Receipt className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-slate-800">Ringkasan Pesanan</h3>
          </div>
          
          <div className="space-y-3">
            {cart.map((item, idx) => (
              <div key={item.cartItemId || idx} className="flex gap-3">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Store className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-slate-800">{item.name}</h4>
                  {item.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-0.5">Catatan: {item.notes}</p>
                  )}
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-slate-600">{item.quantity} x {formatPrice(item.price)}</p>
                    <p className="font-bold text-sm text-indigo-700">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax ({taxRate}%)</span>
              <span>{formatPrice(taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Info Pemesan & Pembayaran */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">Nama Pemesan <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-800">Metode Pembayaran</label>
            
            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              paymentMethod === "qris" ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 bg-white"
            }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "qris" ? "border-indigo-600" : "border-slate-300"
              }`}>
                {paymentMethod === "qris" && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
              </div>
              <div className="flex-1 flex justify-between items-center">
                <span className="font-medium text-sm text-slate-800">QRIS</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              paymentMethod === "cashier" ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 bg-white"
            }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "cashier" ? "border-indigo-600" : "border-slate-300"
              }`}>
                {paymentMethod === "cashier" && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
              </div>
              <div className="flex-1 flex justify-between items-center">
                <span className="font-medium text-sm text-slate-800">Bayar di Kasir</span>
                <CheckCircle className={`w-4 h-4 ${paymentMethod === "cashier" ? "text-indigo-600" : "text-transparent"}`} />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Floating Action */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-white border-t border-slate-100 p-4 z-30 pb-safe">
        <button
          onClick={handleConfirm}
          disabled={isSubmitting || !customerName.trim()}
          className="w-full bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200/50 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Memproses...</span>
          ) : (
            <>
              <span>Konfirmasi & Pesan</span>
              <span className="opacity-75">•</span>
              <span>{formatPrice(totalAmount)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
