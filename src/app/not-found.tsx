"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, Clock, Construction } from "lucide-react";

export default function NotFound() {
  const pathname = usePathname();

  const backUrl = useMemo(() => {
    if (!pathname) return "/";
    
    if (pathname.includes("/owner")) {
      return pathname.substring(0, pathname.indexOf("/owner")) + "/owner";
    }
    if (pathname.includes("/staff")) {
      return pathname.substring(0, pathname.indexOf("/staff")) + "/staff";
    }
    if (pathname.startsWith("/dashboard")) {
      return "/dashboard";
    }
    
    return "/"; // Default to root/login
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        
        {/* Animated Icon Container */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-orange-100 text-orange-500 p-4 rounded-full">
            <Construction size={40} className="animate-bounce" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Halaman Sedang Dibuat
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Ups! Komponen atau halaman yang Anda tuju belum selesai dibangun. Silakan tunggu beberapa saat atau kembali nanti.
          </p>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center space-x-2 text-gray-300">
          <div className="h-px w-12 bg-gray-200"></div>
          <Clock size={16} />
          <div className="h-px w-12 bg-gray-200"></div>
        </div>

        {/* Action Button */}
        <Link 
          href={backUrl} 
          className="inline-flex items-center justify-center w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors duration-200 gap-2"
        >
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </Link>
        
      </div>
    </div>
  );
}
