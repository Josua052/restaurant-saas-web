import { X } from "lucide-react";
import { Select } from "@mantine/core";
import { TableResponseDTO } from "../types";

interface OpenBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  selectedAreaId: string;
  setSelectedAreaId: (id: string) => void;
  selectedTableId: string;
  setSelectedTableId: (id: string) => void;
  uniqueAreas: { id: string; name: string }[];
  availableTables: TableResponseDTO[];
  isSubmitting: boolean;
  handleCheckout: () => void;
  isPreselectedTable?: boolean;
}

export default function OpenBillModal({
  isOpen,
  onClose,
  customerName,
  setCustomerName,
  selectedAreaId,
  setSelectedAreaId,
  selectedTableId,
  setSelectedTableId,
  uniqueAreas,
  availableTables,
  isSubmitting,
  handleCheckout,
  isPreselectedTable = false,
}: OpenBillModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Open Bill</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Pelanggan *</label>
            <input 
              type="text" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Budi"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>
          <p className="text-xs text-slate-500 -mt-2">Wajib agar pelayan mudah memanggil pelanggan</p>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Area</label>
            <Select 
              value={selectedAreaId || null}
              disabled={isPreselectedTable}
              onChange={(val) => {
                setSelectedAreaId(val || "");
                setSelectedTableId(""); // reset table when area changes
              }}
              data={[
                { value: "", label: "Semua Area" },
                ...uniqueAreas.map((a) => ({ value: a.id, label: a.name }))
              ]}
              placeholder="Semua Area"
              size="md"
              styles={{
                input: {
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  backgroundColor: isPreselectedTable ? '#f1f5f9' : undefined
                }
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pilih Meja *</label>
            <Select 
              value={selectedTableId || null}
              disabled={isPreselectedTable}
              onChange={(val) => {
                const newId = val || "";
                setSelectedTableId(newId);
                if (newId) {
                  const table = availableTables.find((t) => t.id === newId);
                  if (table?.active_reservation?.guest_name) {
                    setCustomerName(table.active_reservation.guest_name);
                  }
                }
              }}
              data={isPreselectedTable 
                ? availableTables.filter(t => t.id === selectedTableId).map(t => ({ value: t.id, label: `Meja ${t.table_number}` }))
                : availableTables
                .filter((t) => t.status !== 2)
                .map((t) => ({
                  value: t.id,
                  label: `Meja ${t.table_number}`,
                }))}
              placeholder="-- Pilih Meja --"
              size="md"
              styles={{
                input: {
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  backgroundColor: isPreselectedTable ? '#f1f5f9' : undefined
                }
              }}
            />
          </div>
        </div>
        <div className="p-5 bg-slate-50 flex gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            disabled={isSubmitting || !selectedTableId}
            onClick={handleCheckout}
            className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "Loading..." : "Open Bill"}
          </button>
        </div>
      </div>
    </div>
  );
}
