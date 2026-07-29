"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
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
  AlertCircle,
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

type FilterType = "today" | "this_week" | "this_month" | "this_year" | "custom";

interface DashboardStatsResponse {
  total_revenue: number;
  total_transactions: number;
  average_order_value: number;
  active_reservations: number;
  revenue_chart: { label: string; amount: number }[];
  top_items: { name: string; quantity: number }[];
}

// Fetcher for SWR - accepts optional branchId header
const fetcher = async ([url, token, branchId]: [string, string, string]) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (branchId) {
    headers["X-Branch-ID"] = branchId;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to fetch dashboard data");
  }
  const json = await res.json();
  return json.data as DashboardStatsResponse;
};

// Helper for formatting currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Colors for Top Items bar chart
const CHART_COLORS = ["#a78bfa", "#2dd4bf", "#fbbf24", "#f472b6", "#60a5fa"];

export default function DashboardClient({
  token,
  apiUrl,
}: {
  token: string;
  apiUrl: string;
}) {
  const [filter, setFilter] = useState<FilterType>("this_month");
  const [activeTab, setActiveTab] = useState<string>("this_month");
  const [customDate, setCustomDate] = useState<Date>(new Date());

  // Read active branch from localStorage (set by BranchSwitcher)
  // Use a helper function that is safe to call on server (localStorage not available)
  const getStoredBranchId = useCallback((): string => {
    if (typeof window === "undefined") return "";
    const pathParts = window.location.pathname.split("/");
    const domain = pathParts[1] !== "dashboard" ? pathParts[1] : "";
    const key = domain ? `active_branch_id_${domain}` : "active_branch_id";
    return localStorage.getItem(key) || localStorage.getItem("active_branch_id") || "";
  }, []);

  // Lazy initializer: reads localStorage synchronously on first render so SWR
  // immediately fires with the correct branch — no double-fetch.
  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const pathParts = window.location.pathname.split("/");
    const domain = pathParts[1] !== "dashboard" ? pathParts[1] : "";
    const key = domain ? `active_branch_id_${domain}` : "active_branch_id";
    return localStorage.getItem(key) || localStorage.getItem("active_branch_id") || "";
  });

  useEffect(() => {
    // Re-sync in case it was set after initial render
    setActiveBranchId(getStoredBranchId());

    // Listen for branch switches across tabs (storage event)
    const handleStorageChange = () => {
      setActiveBranchId(getStoredBranchId());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [getStoredBranchId]);

  // Determine query parameters
  let queryParams = `period=${filter}`;
  if (filter === "custom") {
    // Format date as YYYY-MM-DD
    const tzOffset = customDate.getTimezoneOffset() * 60000;
    const localISOTime = new Date(customDate.getTime() - tzOffset)
      .toISOString()
      .split("T")[0];
    queryParams += `&start_date=${localISOTime}&end_date=${localISOTime}`;
  }

  // Fetch data using SWR — include activeBranchId in cache key so SWR re-fetches on branch switch
  const { data, error, isLoading } = useSWR(
    [`${apiUrl}/management/dashboard/owner?${queryParams}`, token, activeBranchId],
    fetcher,
  );

  // Map backend data to Recharts format
  const mappedRevenueData =
    data?.revenue_chart?.map((item) => ({
      name: item.label,
      value: item.amount,
    })) || [];

  const mappedTopItemsData =
    data?.top_items?.map((item, index) => ({
      name: item.name,
      value: item.quantity,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    })) || [];

  // Custom Tooltip for Revenue Chart
  const RevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-sm">
          <p className="font-semibold text-slate-700 mb-1">{label}</p>
          <p className="text-indigo-600 font-bold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 animate-in fade-in duration-500 font-sans">
      {/* Header Section */}
      <div className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 md:px-8 py-5">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, Owner
          </h1>
          <p className="text-slate-500 mt-1">
            Here is a summary of your branch's performance.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Export Button */}
          <button className="flex-1 md:flex-none items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-indigo-200 inline-flex">
            <Download className="w-4 h-4" />
            Ekspor Excel
          </button>

          {/* Interactive Date Picker */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => {
                const newDate = new Date(customDate);
                newDate.setDate(newDate.getDate() - 1);
                setCustomDate(newDate);
                setFilter("custom");
              }}
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="relative flex items-center gap-2 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer rounded-md transition-colors">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              {customDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              <input
                type="date"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                value={
                  new Date(
                    customDate.getTime() -
                      customDate.getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(e) => {
                  if (e.target.value) {
                    setCustomDate(new Date(e.target.value));
                    setFilter("custom");
                  }
                }}
              />
            </div>
            <button
              onClick={() => {
                const newDate = new Date(customDate);
                newDate.setDate(newDate.getDate() + 1);
                setCustomDate(newDate);
                setFilter("custom");
              }}
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8">
        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-200">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error.message}</p>
          </div>
        )}

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Pendapatan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-50 rounded-full z-0 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start relative z-10 mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-2">
                TOTAL PENDAPATAN
              </p>
              <div className="text-3xl font-extrabold text-slate-900 mb-2 truncate">
                {isLoading ? "..." : formatCurrency(data?.total_revenue || 0)}
              </div>
              <p className="text-slate-400 text-[13px]">
                Berdasarkan filter aktif
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
            </div>
            <div className="relative z-10">
              <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-2">
                JUMLAH TRANSAKSI
              </p>
              <div className="text-3xl font-extrabold text-slate-900 mb-2">
                {isLoading ? "..." : data?.total_transactions || 0}
              </div>
              <p className="text-slate-400 text-[13px]">Total order masuk</p>
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
              <div className="text-3xl font-extrabold text-slate-900 mb-2 truncate">
                {isLoading
                  ? "..."
                  : formatCurrency(data?.average_order_value || 0)}
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
            </div>
            <div className="relative z-10">
              <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-2">
                RESERVASI AKTIF
              </p>
              <div className="text-3xl font-extrabold text-slate-900 mb-2">
                {isLoading ? "..." : data?.active_reservations || 0}
              </div>
              <p className="text-slate-400 text-[13px]">Sedang menempati meja</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex bg-slate-200/50 p-1 rounded-xl">
            <button
              onClick={() => {
                setFilter("today");
                setActiveTab("today");
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "today"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                setFilter("this_week");
                setActiveTab("this_week");
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "this_week"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => {
                setFilter("this_month");
                setActiveTab("this_month");
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "this_month"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => {
                setFilter("this_year");
                setActiveTab("this_year");
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === "this_year"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              This Year
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Area Chart - Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Hourglass className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : mappedRevenueData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={mappedRevenueData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `Rp ${value / 1000000}M`;
                        if (value >= 1000) return `Rp ${value / 1000}K`;
                        return `Rp ${value}`;
                      }}
                      width={80}
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
                      activeDot={{
                        r: 6,
                        fill: "#6366f1",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-2 mt-4 text-xs font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>{" "}
                  Pendapatan
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 font-medium text-sm">
                Tidak ada data pendapatan untuk periode ini.
              </div>
            )}
          </div>

          {/* Bar Chart - Top Items */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Hourglass className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : mappedTopItemsData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mappedTopItemsData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    barSize={50}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={true}
                      stroke="#cbd5e1"
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      {mappedTopItemsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-2 mt-4 text-xs font-medium text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400"></span>{" "}
                  Menu Terpopuler
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 font-medium text-sm">
                Tidak ada data penjualan menu untuk periode ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
