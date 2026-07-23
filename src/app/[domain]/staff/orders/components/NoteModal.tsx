interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteText: string;
  setNoteText: (text: string) => void;
  onSave: () => void;
}

export default function NoteModal({ isOpen, onClose, noteText, setNoteText, onSave }: NoteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Catatan Pesanan</h3>
        </div>
        <div className="p-5">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Contoh: Less sugar, extra es, dll..."
            className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none outline-none text-slate-700"
          />
        </div>
        <div className="p-5 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-sm"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
