import React, { useState, useEffect } from "react";
import { X, Utensils, Minus, Plus } from "lucide-react";
import Image from "next/image"; // Kept for potential future use or remove if unused

interface MenuDetailModalProps {
  menu: any;
  formatPrice: (price: number) => string;
  onClose: () => void;
  onAdd: (quantity: number, notes: string) => void;
}

export default function MenuDetailModal({
  menu,
  formatPrice,
  onClose,
  onAdd,
}: MenuDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 250); // wait for animation
  };

  const handleAdd = () => {
    onAdd(quantity, notes);
  };

  const price = menu.price ?? menu.Price ?? 0;
  const name = menu.name || menu.Name || "Menu";
  const imageUrl = menu.image_url || menu.ImageURL;
  const description = menu.description || menu.Description || "Hidangan lezat spesial untuk Anda.";

  const totalPrice = price * quantity;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`bg-white w-full max-w-md mx-auto rounded-t-3xl relative z-10 flex flex-col max-h-[90vh] transition-transform duration-300 ease-out ${
          isClosing ? "translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2 w-full absolute top-0 z-20">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-700 shadow-sm border border-slate-100 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto hide-scrollbar flex-1">
          {/* Image */}
          <div className="w-full aspect-video bg-slate-100 relative rounded-t-3xl overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Utensils className="w-12 h-12 text-slate-300" />
              </div>
            )}
          </div>

          <div className="p-4">
            {/* Header info */}
            <div className="flex justify-between items-start gap-4 mb-2">
              <h2 className="text-xl font-bold text-slate-900 font-heading leading-tight">
                {name}
              </h2>
              <span className="text-lg font-bold text-indigo-700 whitespace-nowrap">
                {formatPrice(price)}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {description}
            </p>

            <hr className="border-slate-100 mb-4" />

            {/* Notes Section */}
            <div className="mb-2">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Catatan Khusus
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cth: Jangan pakai daun bawang, kerupuk dipisah..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none h-20"
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-white border-t border-slate-100 p-4 pb-safe flex flex-col gap-4 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Total Order</span>
            
            {/* Quantity Control */}
            <div className="flex items-center gap-4 bg-indigo-50/50 border border-indigo-100 rounded-full px-1 py-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-full text-indigo-600 disabled:text-slate-300 disabled:bg-transparent hover:bg-white hover:shadow-sm transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold text-sm w-4 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-indigo-600 hover:bg-white hover:shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white py-3.5 rounded-xl font-semibold text-sm shadow-md shadow-indigo-200 transition-all transform active:scale-[0.98] flex justify-center items-center"
          >
            Tambah — {formatPrice(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}
