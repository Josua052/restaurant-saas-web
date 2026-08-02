import React from "react";
import { Utensils, BookOpen } from "lucide-react";
import Image from "next/image";

interface SplashViewProps {
  tenantInfo: any;
  tableNumber: string;
  onStart: () => void;
}

export default function SplashView({
  tenantInfo,
  tableNumber,
  onStart,
}: SplashViewProps) {
  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50 p-6 relative">
      {/* Header */}
      <div className="flex flex-col items-center pt-8 pb-6">
        {tenantInfo.logo_url ? (
          <img
            src={tenantInfo.logo_url}
            alt={tenantInfo.restaurant_name}
            className="object-contain h-12"
          />
        ) : (
          <h1 className="text-2xl font-bold text-indigo-700 tracking-tight font-heading">
            {tenantInfo.restaurant_name || "Logo"}
          </h1>
        )}
      </div>

      {/* Table Badge */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-900 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
          <Utensils className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-sm">
            {tableNumber ? `Meja ${tableNumber}` : "Pilih Meja"}
          </span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="flex-1 flex flex-col items-center mt-4">
        <div className="w-full aspect-square max-w-sm rounded-3xl overflow-hidden shadow-lg relative bg-white">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"
            alt="Restaurant Welcome"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for blending */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent opacity-90 h-full w-full pointer-events-none" />
        </div>

        {/* Welcome Text */}
        <div className="text-center mt-[-40px] z-10 px-4">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight font-heading">
            Selamat datang!
          </h2>
          <p className="text-slate-600 text-base leading-relaxed max-w-xs mx-auto">
            Yuk mulai pesan hidangan favorit Anda hari ini.
          </p>
        </div>
      </div>

      {/* Start Button */}
      <div className="pb-8 pt-4">
        <button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98]"
        >
          <BookOpen className="w-5 h-5" />
          Lihat Menu
        </button>
      </div>
    </div>
  );
}
