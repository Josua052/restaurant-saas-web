import React from "react";
import KitchenClient from "./KitchenClient";

export default function KitchenPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kitchen Dashboard</h1>
          <p className="text-sm font-medium text-slate-500">Live order fulfillment and preparation tracking</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <KitchenClient />
      </div>
    </div>
  );
}
