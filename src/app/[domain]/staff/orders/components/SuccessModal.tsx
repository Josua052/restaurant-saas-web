import { CheckCircle2 } from "lucide-react";
import jsPDF from "jspdf";
import { CompletedSession } from "../types";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CompletedSession | null;
}

export default function SuccessModal({ isOpen, onClose, session }: SuccessModalProps) {
  if (!isOpen || !session) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const generateReceiptPDF = (sessionData: CompletedSession) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 200]
    });

    let y = 10;
    const lineSpace = 5;
    const center = 40;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SaaS RESTAURANT", center, y, { align: "center" });
    y += lineSpace;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Jl. Contoh Alamat No. 123", center, y, { align: "center" });
    y += lineSpace + 2;

    doc.setFontSize(9);
    doc.text(`Tgl: ${new Date(sessionData.createdAt).toLocaleString("id-ID")}`, 5, y);
    y += lineSpace;
    doc.text(`Struk: ${sessionData.receiptNumber}`, 5, y);
    y += lineSpace;
    doc.text(`Tipe: ${sessionData.orderType}`, 5, y);
    y += lineSpace;
    
    if (sessionData.queueNumber) {
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Antrean: ${sessionData.queueNumber}`, center, y, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      y += lineSpace;
    }

    y += 2;
    doc.text("-".repeat(45), center, y, { align: "center" });
    y += lineSpace;

    sessionData.items.forEach((item) => {
      doc.text(item.name, 5, y);
      y += 4;
      
      const qtyStr = `${item.quantity} x ${formatCurrency(item.price)}`;
      const totalStr = formatCurrency(item.quantity * item.price);
      
      doc.text(qtyStr, 5, y);
      doc.text(totalStr, 75, y, { align: "right" });
      y += lineSpace;
    });

    y += 2;
    doc.text("-".repeat(45), center, y, { align: "center" });
    y += lineSpace;

    doc.text("Subtotal", 5, y);
    doc.text(formatCurrency(sessionData.subtotal), 75, y, { align: "right" });
    y += lineSpace;

    doc.text("PB1 (${sessionData.taxRatePercent}%)", 5, y);
    doc.text(formatCurrency(sessionData.tax), 75, y, { align: "right" });
    y += lineSpace;

    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 5, y);
    doc.text(formatCurrency(sessionData.total), 75, y, { align: "right" });
    y += lineSpace;
    doc.setFont("helvetica", "normal");

    if (sessionData.paymentMethod) {
      y += 2;
      doc.text(`Metode: ${sessionData.paymentMethod}`, 5, y);
      y += lineSpace;
      
      if (sessionData.paymentMethod === "Tunai" && sessionData.cashReceived !== undefined) {
        doc.text("Tunai", 5, y);
        doc.text(formatCurrency(sessionData.cashReceived), 75, y, { align: "right" });
        y += lineSpace;
        
        doc.text("Kembalian", 5, y);
        doc.text(formatCurrency(sessionData.change || 0), 75, y, { align: "right" });
        y += lineSpace;
      }
    }

    y += 5;
    doc.text("-".repeat(45), center, y, { align: "center" });
    y += lineSpace;
    doc.text("Terima Kasih Atas Kunjungannya", center, y, { align: "center" });

    doc.save(`Struk-${sessionData.receiptNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {session.paymentMethod ? "Pembayaran Berhasil!" : "Pesanan Berhasil Dibuat!"}
          </h2>
          <p className="text-slate-500 mb-6">Order #{session.receiptNumber}</p>
          
          {session.queueNumber && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-full mb-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Nomor Antrean</p>
              <p className="text-4xl font-black text-slate-800">{session.queueNumber}</p>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-full mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500">Total Transaksi</span>
              <span className="font-bold text-slate-800">{formatCurrency(session.total)}</span>
            </div>
            {session.paymentMethod === "Tunai" && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500">Uang Diterima</span>
                  <span className="font-medium text-slate-700">{formatCurrency(session.cashReceived || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-2">
                  <span className="text-slate-500">Kembalian</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(session.change || 0)}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
            >
              Selesai
            </button>
            <button
              onClick={() => generateReceiptPDF(session)}
              className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              Cetak Struk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
