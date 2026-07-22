"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Receipt,
  ShoppingCart,
  Armchair,
  Hourglass,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// -- MOCK DATA --
const chartData = {
  week: {
    revenue: [
      { name: "Mon", value: 120 },
      { name: "Tue", value: 200 },
      { name: "Wed", value: 150 },
      { name: "Thu", value: 80 },
      { name: "Fri", value: 300 },
      { name: "Sat", value: 450 },
      { name: "Sun", value: 400 },
    ],
    items: [
      { name: "Nasi Goreng", value: 30, fill: "#a78bfa" },
      { name: "Ice Matcha Latte", value: 50, fill: "#2dd4bf" },
      { name: "Americano", value: 20, fill: "#fbbf24" },
    ],
  },
  month: {
    revenue: [
      { name: "Januari", value: 73.53 },
      { name: "Februari", value: 18.17 },
      { name: "Maret", value: 200 },
      { name: "April", value: 120 },
    ],
    items: [
      { name: "Nasi Goreng", value: 45, fill: "#a78bfa" },
      { name: "Ice Matcha Latte", value: 95, fill: "#2dd4bf" },
      { name: "Americano", value: 70, fill: "#fbbf24" },
    ],
  },
  year: {
    revenue: [
      { name: "2023", value: 500 },
      { name: "2024", value: 800 },
      { name: "2025", value: 1200 },
      { name: "2026", value: 2000 },
    ],
    items: [
      { name: "Nasi Goreng", value: 450, fill: "#a78bfa" },
      { name: "Ice Matcha Latte", value: 800, fill: "#2dd4bf" },
      { name: "Americano", value: 650, fill: "#fbbf24" },
    ],
  },
};

type FilterType = "week" | "month" | "year";

export default function TenantOwnerDashboard({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const [filter, setFilter] = useState<FilterType>("month");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Custom Tooltip for Revenue Chart
  const RevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-sm">
          <p className="font-semibold text-slate-700 mb-1">{label}</p>
          <p className="text-indigo-600 font-bold">
            Rp {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!isMounted) return null; // Avoid hydration mismatch for recharts

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 md:p-8 animate-in fade-in duration-500 font-sans">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, Elena
          </h1>
          <p className="text-slate-500 mt-1">
            Here is a summary of your branch's performance today.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Export Button */}
          <button className="flex-1 md:flex-none items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-indigo-200 inline-flex">
            <Download className="w-4 h-4" />
            Ekspor Excel
          </button>
          
          {/* Date Picker Placeholder */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-slate-700">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              Today, 22 Jul 2026
            </div>
            <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Pendapatan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-50 rounded-full z-0 transition-transform group-hover:scale-110"></div>
          
          <div className="flex justify-between items-start relative z-10 mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="bg-emerald-100/70 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide">
              ~+8%
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-2">
              TOTAL PENDAPATAN
            </p>
            <div className="text-3xl font-extrabold text-slate-900 mb-2">
              Rp 4.850.000
            </div>
            <p className="text-slate-400 text-[13px]">
              Dari order berstatus Paid hari ini
            </p>
          </div>
        </div>

        {/* Jumlah Transaksi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-50 rounded-full z-0 transition-transform group-hover:scale-110"></div>
          
          <div className="flex justify-between items-start relative z-10 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              128 hari ini
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-2">
              JUMLAH TRANSAKSI
            </p>
            <div className="text-3xl font-extrabold text-slate-900 mb-2">
              128
            </div>
            <p className="text-slate-400 text-[13px]">
              Total order masuk hari ini
            </p>
          </div>
        </div>

        {/* Rata-Rata Nilai Pesanan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-50 rounded-full z-0 transition-transform group-hover:scale-110"></div>
          
          <div className="flex justify-between items-start relative z-10 mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="bg-emerald-100/70 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              AOV
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-2">
              RATA-RATA NILAI PESANAN
            </p>
            <div className="text-3xl font-extrabold text-slate-900 mb-2">
              Rp 37.900
            </div>
            <p className="text-slate-400 text-[13px]">
              Total Pendapatan ÷ Jumlah Transaksi
            </p>
          </div>
        </div>

        {/* Reservasi Aktif */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-50 rounded-full z-0 transition-transform group-hover:scale-110"></div>
          
          <div className="flex justify-between items-start relative z-10 mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 flex items-center justify-center rounded-xl">
              <Armchair className="w-6 h-6" />
            </div>
            <div className="bg-amber-100/80 text-amber-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
              24/50 slot
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-2">
              RESERVASI AKTIF
            </p>
            <div className="text-3xl font-extrabold text-slate-900 mb-2">
              24
            </div>
            <p className="text-slate-400 text-[13px] opacity-0 group-hover:opacity-100 transition-opacity">
              Currently occupied
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setFilter("week")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            This Week
          </button>
          <button 
            onClick={() => setFilter("month")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            This Month
          </button>
          <button 
            onClick={() => setFilter("year")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'year' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Area Chart - Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData[filter].revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
                activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs font-medium text-slate-500">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 2026
          </div>
        </div>

        {/* Bar Chart - Top Items */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData[filter].items} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={true} 
                stroke="#cbd5e1"
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]} 
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {chartData[filter].items.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-2 mt-6 text-xs font-medium text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400"></span> Menu
          </div>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-[17px] font-bold text-slate-900">
            Recent Activity
          </h2>
          <button className="text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors">
            View All
          </button>
        </div>
        
        {/* Loading State */}
        <div className="p-16 flex flex-col items-center justify-center text-slate-400">
          <Hourglass className="w-10 h-10 mb-4 animate-pulse opacity-50" />
          <p className="font-medium text-sm animate-pulse">Activity feed loading...</p>
        </div>
      </div>

    </div>
  );
}
