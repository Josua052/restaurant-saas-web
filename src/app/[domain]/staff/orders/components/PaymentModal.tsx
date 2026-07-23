import { X, Banknote, CreditCard, QrCode, CheckCircle2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  subtotal: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  cashReceived: string;
  setCashReceived: (val: string) => void;
  isSubmitting: boolean;
  handleCheckout: () => void;
  formatCurrency: (val: number) => string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  customerName,
  setCustomerName,
  subtotal,
  tax,
  grandTotal,
  paymentMethod,
  setPaymentMethod,
  cashReceived,
  setCashReceived,
  isSubmitting,
  handleCheckout,
  formatCurrency,
}: PaymentModalProps) {
  if (!isOpen) return null;

  const cashVal = parseInt(cashReceived.replace(/\D/g, "")) || 0;
  const change = Math.max(0, cashVal - grandTotal);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold text-slate-900">Bayar Langsung</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto">
          {/* Left Pane: Identitas Pesanan */}
          <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
            <h4 className="font-semibold text-slate-800 mb-5">Identitas Pesanan</h4>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Pelanggan</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi (Opsional)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-800 font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-slate-500 font-medium">Pajak (PB1 10%)</span>
                <span className="text-slate-800 font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t border-slate-100 mb-4"></div>
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-xl font-bold text-indigo-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Right Pane: Metode Pembayaran */}
          <div className="flex-[1.2] p-6">
            <h4 className="font-semibold text-slate-800 text-xs tracking-wider uppercase mb-5">Pilih Metode Pembayaran</h4>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { id: "Tunai", label: "Tunai", icon: <Banknote className="w-5 h-5 mb-2 mx-auto" /> },
                { id: "Debit BCA", label: "Debit BCA", icon: <CreditCard className="w-5 h-5 mb-2 mx-auto" /> },
                { id: "QRIS", label: "QRIS", icon: <QrCode className="w-5 h-5 mb-2 mx-auto" /> },
                { id: "Kartu Kredit", label: "Kartu Kredit", icon: <CreditCard className="w-5 h-5 mb-2 mx-auto" /> },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === method.id 
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" 
                      : "border-slate-100 bg-white text-slate-500 hover:border-indigo-200"
                  }`}
                >
                  {paymentMethod === method.id && (
                    <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  {method.icon}
                  <span className="font-semibold text-sm block text-center">{method.label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === "Tunai" && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Uang Diterima</label>
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">Rp</span>
                  <input 
                    type="text" 
                    value={cashReceived}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setCashReceived(val ? new Intl.NumberFormat("id-ID").format(parseInt(val)) : "");
                    }}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 text-lg font-bold outline-none"
                  />
                </div>
                
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  <button 
                    onClick={() => setCashReceived(new Intl.NumberFormat("id-ID").format(grandTotal))}
                    className="px-4 py-2 shrink-0 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50"
                  >
                    Uang Pas
                  </button>
                  {[50000, 100000, 200000].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setCashReceived(new Intl.NumberFormat("id-ID").format(amt))}
                      className="px-4 py-2 shrink-0 bg-indigo-600 text-white border border-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-700"
                    >
                      {new Intl.NumberFormat("id-ID").format(amt)}
                    </button>
                  ))}
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <span className="block text-emerald-600 text-xs font-bold tracking-wider uppercase mb-1">Kembalian</span>
                  <span className="text-3xl font-black text-emerald-600">
                    {formatCurrency(change)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-5 bg-white border-t border-slate-100 flex gap-3 justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            disabled={isSubmitting || (paymentMethod === "Tunai" && cashVal < grandTotal)}
            onClick={handleCheckout}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "Memproses..." : "Konfirmasi Pembayaran →"}
          </button>
        </div>
      </div>
    </div>
  );
}
