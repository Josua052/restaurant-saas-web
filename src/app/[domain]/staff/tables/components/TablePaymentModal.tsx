import { useState } from "react";
import { X, Banknote, CreditCard, QrCode } from "lucide-react";

interface TablePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount: number;
  isSubmitting: boolean;
  handleProcessPayment: (paymentMethod: string, cashReceived: number) => void;
}

export default function TablePaymentModal({
  isOpen,
  onClose,
  orderId,
  totalAmount,
  isSubmitting,
  handleProcessPayment,
}: TablePaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [cashReceived, setCashReceived] = useState("");

  if (!isOpen) return null;

  const cashVal = parseInt(cashReceived.replace(/\D/g, "")) || 0;
  const change = Math.max(0, cashVal - totalAmount);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCashInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setCashReceived(val);
  };

  const setExactAmount = () => setCashReceived(totalAmount.toString());

  const onConfirm = () => {
    if (paymentMethod === "Tunai" && cashVal < totalAmount) {
      alert("Uang yang diterima kurang dari total tagihan.");
      return;
    }
    handleProcessPayment(paymentMethod, cashVal);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold text-slate-900">Pembayaran Tagihan</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <h4 className="font-semibold text-slate-800 mb-4">PILIH METODE PEMBAYARAN</h4>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              onClick={() => setPaymentMethod("Tunai")}
              className={`py-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${
                paymentMethod === "Tunai" ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
              }`}
            >
              <Banknote className="w-6 h-6" />
              Tunai
            </button>
            <button
              onClick={() => setPaymentMethod("Debit BCA")}
              className={`py-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${
                paymentMethod === "Debit BCA" ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
              }`}
            >
              <CreditCard className="w-6 h-6" />
              Debit BCA
            </button>
            <button
              onClick={() => setPaymentMethod("QRIS")}
              className={`py-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${
                paymentMethod === "QRIS" ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
              }`}
            >
              <QrCode className="w-6 h-6" />
              QRIS
            </button>
            <button
              onClick={() => setPaymentMethod("Kartu Kredit")}
              className={`py-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${
                paymentMethod === "Kartu Kredit" ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-bold" : "border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
              }`}
            >
              <CreditCard className="w-6 h-6" />
              Kartu Kredit
            </button>
          </div>

          {paymentMethod === "Tunai" && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Uang Diterima</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                <input 
                  type="text" 
                  value={cashVal > 0 ? cashVal.toLocaleString("id-ID") : ""}
                  onChange={handleCashInput}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-lg"
                />
              </div>

              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
                <button onClick={setExactAmount} className="shrink-0 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
                  Uang Pas
                </button>
                <button onClick={() => setCashReceived("50000")} className="shrink-0 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  50.000
                </button>
                <button onClick={() => setCashReceived("100000")} className="shrink-0 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  100.000
                </button>
                <button onClick={() => setCashReceived("200000")} className="shrink-0 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  200.000
                </button>
              </div>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-center">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              {paymentMethod === "Tunai" ? "KEMBALIAN" : "TOTAL TAGIHAN"}
            </p>
            <p className="text-3xl font-bold text-emerald-500">
              {formatCurrency(paymentMethod === "Tunai" ? change : totalAmount)}
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : "Konfirmasi Pembayaran →"}
          </button>
        </div>
      </div>
    </div>
  );
}
