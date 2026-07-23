"use client";

import { useState } from "react";
import { Snowflake, Wind, Users, X, Plus, Calendar, Utensils } from "lucide-react";

// --- Mock Data Definitions ---

type TableStatus = "Available" | "Occupied" | "Reserved";

interface TableData {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  // If reserved or occupied:
  guestName?: string;
  time?: string;
  orderId?: string;
  seatedSince?: string;
  currentBill?: string;
}

interface AreaData {
  id: string;
  name: string;
  icon: "indoor" | "outdoor";
  tables: TableData[];
}

const mockAreas: AreaData[] = [
  {
    id: "a1",
    name: "Indoor - Ground Floor",
    icon: "indoor",
    tables: [
      { id: "t1", number: "T-01", capacity: 4, status: "Available" },
      { id: "t2", number: "T-02", capacity: 4, status: "Occupied" },
      { id: "t3", number: "T-03", capacity: 6, status: "Reserved", guestName: "Nama Pereservasi" },
    ],
  },
  {
    id: "a2",
    name: "Outdoor / Smoking Area",
    icon: "outdoor",
    tables: [
      { id: "t4", number: "T-05", capacity: 2, status: "Available" },
      { id: "t5", number: "T-06", capacity: 4, status: "Occupied" },
      { id: "t6", number: "T-07", capacity: 4, status: "Available" },
      { id: "t7", number: "T-08", capacity: 8, status: "Reserved", guestName: "Nama Pereservasi", time: "Today, 20:30" },
    ],
  },
];

export default function TablesClient() {
  const [activeArea, setActiveArea] = useState<string>("All Areas");
  const [activeStatus, setActiveStatus] = useState<string>("All Status");
  
  // Modal State
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaData | null>(null);

  const handleOpenModal = (table: TableData, area: AreaData) => {
    setSelectedTable(table);
    setSelectedArea(area);
  };

  const handleCloseModal = () => {
    setSelectedTable(null);
    setSelectedArea(null);
  };

  // Helper for Status Badge styling
  const getStatusStyle = (status: TableStatus, isModal = false) => {
    if (status === "Available") return "bg-[#D1F4E0] text-emerald-700";
    if (status === "Occupied") return "bg-rose-100 text-rose-700";
    return "bg-amber-100 text-amber-700"; // Reserved
  };

  const getStatusDot = (status: TableStatus) => {
    if (status === "Available") return "bg-emerald-500";
    if (status === "Occupied") return "bg-rose-500";
    return "bg-amber-500"; // Reserved
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      
      {/* Top Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex gap-3">
          <select 
            value={activeArea}
            onChange={(e) => setActiveArea(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none min-w-[140px]"
          >
            <option value="All Areas">All Areas</option>
            {mockAreas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
          
          <select 
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none min-w-[140px]"
          >
            <option value="All Status">All Status</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Reserved">Reserved</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Occupied
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reserved
          </div>
        </div>
      </div>

      {/* Tables Grid Grouped by Area */}
      <div className="space-y-10 animate-in fade-in duration-500">
        {mockAreas.map((area) => {
          // Apply Filters
          if (activeArea !== "All Areas" && area.name !== activeArea) return null;
          
          const filteredTables = area.tables.filter(t => activeStatus === "All Status" || t.status === activeStatus);
          if (filteredTables.length === 0) return null;

          return (
            <div key={area.id}>
              {/* Area Header */}
              <div className="flex items-center gap-3 mb-4">
                {area.icon === "indoor" ? (
                  <Snowflake className="w-5 h-5 text-slate-700" />
                ) : (
                  <Wind className="w-5 h-5 text-slate-700" />
                )}
                <h2 className="text-lg font-bold text-slate-900">{area.name}</h2>
                <span className="px-2.5 py-0.5 bg-slate-200 text-slate-600 text-[11px] font-bold rounded-full">
                  {area.tables.length} Tables
                </span>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTables.map((table) => (
                  <div 
                    key={table.id}
                    onClick={() => handleOpenModal(table, area)}
                    className={`bg-white border rounded-xl overflow-hidden cursor-pointer transition-shadow hover:shadow-md flex flex-col justify-between min-h-[120px]
                      ${table.status === "Occupied" ? "border-rose-200" : 
                        table.status === "Reserved" ? "border-amber-200" : "border-slate-200"}`}
                  >
                    {/* Card Top */}
                    <div className="p-4 flex justify-between items-start">
                      <h3 className="text-xl font-bold text-slate-900">{table.number}</h3>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${getStatusStyle(table.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(table.status)}`}></span>
                        {table.status}
                      </div>
                    </div>

                    {/* Reserved Guest Info Box */}
                    {table.status === "Reserved" && table.guestName && (
                      <div className="px-4 pb-2">
                        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                          <p className="text-sm font-bold text-slate-800">{table.guestName}</p>
                          {table.time && (
                            <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" /> {table.time}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Card Bottom / Footer */}
                    <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        {table.capacity} Seats
                      </div>
                      <div className="text-slate-400">
                        {area.icon === "indoor" ? <Snowflake className="w-3.5 h-3.5" /> : <Wind className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Modal */}
      {selectedTable && selectedArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-slate-900">Table {selectedTable.number.replace("T-", "")}</h2>
                  <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${getStatusStyle(selectedTable.status, true)}`}>
                    {selectedTable.status}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {selectedTable.capacity} Guests</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {selectedArea.icon === "indoor" ? <Snowflake className="w-4 h-4" /> : <Wind className="w-4 h-4" />} 
                    {selectedArea.name.split(" - ")[0].split(" / ")[0]}
                  </span>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Current Session (Mocked Data) */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Current Session</h4>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Customer Name</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedTable.guestName || "Andi"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Order ID</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedTable.orderId || "#1042"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Seated Since</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedTable.seatedSince || "14:20 (25 min ago)"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Current Bill</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedTable.currentBill || "Rp 124.000"}</p>
                  </div>
                </div>
              </div>

              {/* Change Status Segment */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Change Status To</h4>
                <div className="grid grid-cols-3 gap-3">
                  {/* Status Buttons */}
                  <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    Available
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-rose-500 text-sm font-bold text-rose-600 bg-rose-50">
                    <Utensils className="w-3.5 h-3.5" />
                    Occupied <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    Reserved
                  </button>
                </div>
              </div>

              {/* New Session Button */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">New Session</h4>
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-colors">
                  <Plus className="w-4 h-4" /> ADD ON
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCloseModal}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
