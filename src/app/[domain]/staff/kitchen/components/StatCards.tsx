import React from "react";
import { FileText, ChefHat, CheckCircle, Ban } from "lucide-react";
import { KitchenStats } from "../types";

export default function StatCards({ stats }: { stats: KitchenStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">New Orders</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.newOrders}</h3>
          <p className="text-xs text-slate-400 mt-1">Today</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
          <FileText className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Preparing</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.preparing}</h3>
          <p className="text-xs text-slate-400 mt-1">Active</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
          <ChefHat className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Completed Today</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.completedToday}</h3>
          <p className="text-xs text-slate-400 mt-1">Orders</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
          <CheckCircle className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cancelled Today</p>
          <h3 className="text-3xl font-black text-slate-900">{stats.cancelledToday}</h3>
          <p className="text-xs text-slate-400 mt-1">Orders</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
          <Ban className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
