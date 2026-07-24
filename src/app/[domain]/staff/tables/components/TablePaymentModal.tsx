import { useState, useMemo } from "react";
import { X, Banknote, CreditCard, QrCode, Receipt } from "lucide-react";

interface TablePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount: number;
  isSubmitting: boolean;
  handleProcessPayment: (paymentMethod: string, cashReceived: number) => void;
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

/**
 * Generate smart quick-cash suggestions that are all >= totalAmount.
 * Always includes: exact amount, then rounds up to nearest 10k / 50k / 100k etc.
 */
function generateQuickAmounts(total: number): number[] {
  const suggestions = new Set<number>();

  // Standard Indonesian cash denominations (ascending)
  const denominations = [
    10_000, 20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000,
  ];

  for (const denom of denominations) {
    // Round UP total to the nearest multiple of this denomination
    const rounded = Math.ceil(total / denom) * denom;
    if (rounded >= total) {
      suggestions.add(rounded);
    }
  }

  // Sort and keep the 4 smallest valid options (excluding exact, which is Uang Pas)
  const sorted = Array.from(suggestions)
    .filter((v) => v > total) // exclude exact — handled by "Uang Pas" button
    .sort((a, b) => a - b)
    .slice(0, 4);

  return sorted;
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
  const isCashInsufficient = paymentMethod === "Tunai" && cashVal > 0 && cashVal < totalAmount;

  const quickAmounts = useMemo(() => generateQuickAmounts(totalAmount), [totalAmount]);

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

  const paymentMethods = [
    { id: "Tunai", label: "Tunai", icon: Banknote },
    { id: "Debit BCA", label: "Debit BCA", icon: CreditCard },
    { id: "QRIS", label: "QRIS", icon: QrCode },
    { id: "Kartu Kredit", label: "Kartu Kredit", icon: CreditCard },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Pembayaran Tagihan</h3>
            <p className="text-xs text-slate-400 mt-0.5">Order #{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Total Bill — Prominent Display */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-200" />
              <span className="text-indigo-200 text-sm font-medium">TOTAL TAGIHAN</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {/* Payment Method */}
          <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wider">
            Metode Pembayaran
          </h4>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {paymentMethods.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPaymentMethod(id)}
                className={`py-3.5 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all text-sm font-semibold ${
                  paymentMethod === id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>

          {/* Cash Input — only for Tunai */}
          {paymentMethod === "Tunai" && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Uang Diterima
              </label>

              {/* Input field */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-base">Rp</span>
                <input
                  type="text"
                  value={cashVal > 0 ? cashVal.toLocaleString("id-ID") : ""}
                  onChange={handleCashInput}
                  placeholder="0"
                  className={`w-full pl-12 pr-4 py-3 bg-white border-2 rounded-xl focus:outline-none font-semibold text-lg transition-colors ${
                    isCashInsufficient
                      ? "border-red-400 focus:ring-2 focus:ring-red-300 text-red-600"
                      : cashVal >= totalAmount
                      ? "border-emerald-400 focus:ring-2 focus:ring-emerald-300 text-slate-900"
                      : "border-slate-200 focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  }`}
                />
              </div>

              {/* Insufficient warning */}
              {isCashInsufficient && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  ⚠ Kurang {formatCurrency(totalAmount - cashVal)} dari total tagihan
                </p>
              )}

              {/* Smart Quick-Amount Buttons — only >= totalAmount */}
              <div className="flex flex-wrap gap-2 mt-3">
                {/* Uang Pas — always first */}
                <button
                  onClick={setExactAmount}
                  className="px-4 py-2 border-2 border-indigo-300 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors"
                >
                  Uang Pas
                </button>

                {/* Smart denominasi — only those >= totalAmount */}
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCashReceived(amount.toString())}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    {(amount / 1000).toLocaleString("id-ID")}.000
                  </button>
                ))}
              </div>

              <p className="text-slate-400 text-xs mt-2">
                * Hanya menampilkan nominal yang mencukupi tagihan
              </p>
            </div>
          )}

          {/* Change / Total Summary Box */}
          <div className={`rounded-xl p-5 text-center border transition-colors ${
            paymentMethod === "Tunai"
              ? cashVal === 0
                ? "bg-slate-50 border-slate-100"
                : isCashInsufficient
                ? "bg-red-50 border-red-100"
                : "bg-emerald-50 border-emerald-100"
              : "bg-emerald-50 border-emerald-100"
          }`}>
            {paymentMethod === "Tunai" ? (
              <>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                  isCashInsufficient ? "text-red-500" : "text-emerald-600"
                }`}>
                  {cashVal === 0 ? "MASUKKAN UANG DITERIMA" : isCashInsufficient ? "UANG KURANG" : "KEMBALIAN"}
                </p>
                <p className={`text-3xl font-bold ${
                  isCashInsufficient ? "text-red-500" : "text-emerald-500"
                }`}>
                  {cashVal === 0 ? "—" : isCashInsufficient ? `- ${formatCurrency(totalAmount - cashVal)}` : formatCurrency(change)}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">TOTAL TAGIHAN</p>
                <p className="text-3xl font-bold text-emerald-500">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-emerald-500 mt-1 font-medium">Pembayaran non-tunai — tidak ada kembalian</p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting || (paymentMethod === "Tunai" && cashVal < totalAmount && cashVal > 0)}
            className="flex-2 w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 px-6"
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : "Konfirmasi Pembayaran →"}
          </button>
        </div>
      </div>
    </div>
  );
}
