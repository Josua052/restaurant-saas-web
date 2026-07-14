"use client";

import { useState, useEffect } from "react";
import {
  Armchair,
  ClipboardList,
  UtensilsCrossed,
  CalendarX2,
  TrendingUp,
  MoreVertical,
  Plus,
  X,
  Minus,
  Clock,
} from "lucide-react";

// Define Interfaces matching the Go Backend responses
interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Table {
  id: string;
  table_number: string;
  capacity: number;
}

export interface Reservation {
  id: string;
  tenant_id: string;
  branch_id: string;
  customer_id: string;
  customer: Customer;
  table_id: string;
  table: Table;
  reservation_time: string;
  party_size: number;
  status: string;
}

interface ReservationStats {
  total_reservations: number;
  upcoming_reservations: Reservation[];
  pending_confirmations: number;
}

interface TableStats {
  total_tables: number;
  active_tables: number;
}

interface MenuStats {
  active_menu_items: number;
  sold_out_items: number;
  categories_count: number;
}

interface ReservationsClientProps {
  ownerName: string;
  reservations: Reservation[];
  reservationStats: ReservationStats;
  tableStats: TableStats;
  menuStats: MenuStats;
}

export default function ReservationsClient({
  ownerName,
  reservations,
  reservationStats,
  tableStats,
  menuStats,
}: ReservationsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partySize, setPartySize] = useState(2);
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    // Format date on client to avoid hydration mismatch
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    setFormattedDate(new Date().toLocaleDateString('en-US', options));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Confirmed
          </span>
        );
      case "arrived":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            {status}
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 font-semibold px-3 py-1 rounded-full text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Cancelled
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          Good morning, {ownerName || "Owner"}
        </h1>
        <p className="text-slate-500 mt-1">
          {formattedDate ? `Today is ${formattedDate}` : "Loading date..."}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Today's Reservations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-[150px]">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-50 rounded-full z-0"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-lg">
              <Armchair className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Today's Reservations
            </p>
            <div className="text-3xl font-bold text-slate-900 leading-none">
              {reservationStats.total_reservations}
            </div>
          </div>
        </div>

        {/* Metric 2: Pending Confirmations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 flex items-center justify-center rounded-lg">
              <ClipboardList className="w-5 h-5" />
            </div>
            {reservationStats.pending_confirmations > 0 && (
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-2 mr-2 ring-4 ring-amber-50"></div>
            )}
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Pending Confirmations
            </p>
            <div className="text-3xl font-bold text-slate-900 leading-none">
              {reservationStats.pending_confirmations}
            </div>
          </div>
        </div>

        {/* Metric 3: Tables Occupied */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 flex items-center justify-center rounded-lg">
              <Armchair className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Tables Occupied
            </p>
            <div className="flex items-baseline gap-2 mb-3">
              <div className="text-3xl font-bold text-slate-900 leading-none">
                {tableStats.active_tables}
              </div>
              <div className="text-slate-400 font-medium text-sm">/ {tableStats.total_tables}</div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-slate-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${tableStats.total_tables > 0 ? (tableStats.active_tables / tableStats.total_tables) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Metric 4: Total Menu Items */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-slate-100 text-slate-600 flex items-center justify-center rounded-lg">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-[11px] font-bold tracking-wider uppercase mb-1">
              Total Menu Items
            </p>
            <div className="text-3xl font-bold text-slate-900 leading-none">
              {menuStats.active_menu_items}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {/* Card Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">
            Today's Reservations
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Walk-in
            </button>
          </div>
        </div>

        {/* Table or Empty State */}
        {reservations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <CalendarX2 className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No reservations yet today
            </h3>
            <p className="text-slate-500 max-w-md mb-8">
              Your schedule is currently clear. When new reservations are made,
              they will appear here.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Reservation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 text-center">
                <tr>
                  <th className="px-6 py-4 font-bold text-left">Guest Name</th>
                  <th className="px-6 py-4 font-bold">Time</th>
                  <th className="px-6 py-4 font-bold">Table</th>
                  <th className="px-6 py-4 font-bold">Party Size</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center">
                {reservations.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-left font-bold text-slate-700">
                      {res.customer?.name || "Walk-in Guest"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                      {formatTime(res.reservation_time)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                      {res.table?.table_number || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {res.party_size} Pax
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {getStatusBadge(res.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Create Walk-in Reservation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-screen">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Create Walk-in Reservation
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Quickly add a guest to the system for an immediate or upcoming
                  table.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                    placeholder="Full Name"
                  />
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Party Size
                  </label>
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden h-11">
                    <button
                      onClick={() => setPartySize(Math.max(1, partySize - 1))}
                      className="w-12 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 border-r border-slate-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 flex items-center justify-center font-bold text-slate-700">
                      {partySize}
                    </div>
                    <button
                      onClick={() => setPartySize(partySize + 1)}
                      className="w-12 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 border-l border-slate-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Table Selection
                  </label>
                  <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white appearance-none cursor-pointer h-11">
                    <option>T-01 (Available)</option>
                    <option>T-02 (Available)</option>
                    <option>T-03 (Occupied)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    defaultValue={formattedDate}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-700"
                    disabled
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <input
                    type="text"
                    defaultValue="07:00 PM"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-center text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Reservation Created!");
                  setIsModalOpen(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                Create Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
