"use client";

import { useState, useMemo } from "react";
import { Snowflake, Wind, Users, X, Plus, Calendar, Utensils, AlertCircle } from "lucide-react";
import useSWR from "swr";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Select } from "@mantine/core";
import TablePaymentModal from "./components/TablePaymentModal";

// --- API Types ---
interface TableSection {
  id: string;
  name: string;
}

interface TableData {
  id: string;
  table_number: string;
  capacity: number;
  status: number; // 1: Available, 2: Occupied, 3: Reserved
  section?: TableSection;
  active_res?: { guest_name: string; time: string };
}

// Grouped data structure for UI
interface AreaData {
  id: string;
  name: string;
  icon: "indoor" | "outdoor";
  tables: TableData[];
}

export default function TablesClient({ initialToken }: { initialToken: string }) {
  const [activeArea, setActiveArea] = useState<string>("All Areas");
  const [activeStatus, setActiveStatus] = useState<string>("All Status");
  const router = useRouter();
  const params = useParams();
  const domain = params.domain as string;
  
  // Modal State
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);

  // API Config
  const token = initialToken;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_URL_V2 = API_URL ? API_URL.replace("/v1", "/v2") : "";

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || errData.message || "Failed to fetch data");
    }
    return res.json();
  };

  const { data: sectionsRes, error: sectionsErr } = useSWR(
    token ? `${API_URL_V2}/management/sections` : null,
    fetcher
  );

  const { data: tablesRes, error: tablesErr, mutate: mutateTables } = useSWR(
    token ? `${API_URL_V2}/management/tables?limit=100` : null,
    fetcher
  );

  const sections: TableSection[] = sectionsRes?.data || [];
  const rawTables: TableData[] = tablesRes?.data || [];
  const isLoading = !sectionsRes && !sectionsErr;

  // Group tables by section/area
  const groupedAreas = useMemo(() => {
    const map = new Map<string, AreaData>();
    
    // Default structure for unassigned tables
    map.set("unassigned", {
      id: "unassigned",
      name: "Main Area",
      icon: "indoor",
      tables: [],
    });

    sections.forEach(sec => {
      map.set(sec.id, {
        id: sec.id,
        name: sec.name,
        // Basic heuristic for icon
        icon: sec.name.toLowerCase().includes("outdoor") || sec.name.toLowerCase().includes("smoking") ? "outdoor" : "indoor",
        tables: []
      });
    });

    rawTables.forEach(t => {
      if (t.section?.id && map.has(t.section.id)) {
        map.get(t.section.id)!.tables.push(t);
      } else {
        map.get("unassigned")!.tables.push(t);
      }
    });

    // Remove empty areas
    return Array.from(map.values()).filter(a => a.tables.length > 0);
  }, [sections, rawTables]);

  const handleOpenModal = async (table: TableData, area: AreaData) => {
    setSelectedTable(table);
    setSelectedArea(area);
    
    if (table.status === 2) {
      setIsSessionLoading(true);
      try {
        const res = await fetch(`${API_URL_V2}/management/tables/${table.id}/session`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSessionData(data.data); 
        }
      } catch (e) {
        toast.error("Gagal memuat sesi meja");
      } finally {
        setIsSessionLoading(false);
      }
    } else {
      setSessionData(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedTable(null);
    setSelectedArea(null);
    setSessionData(null);
  };

  const handleProcessPayment = async (method: string, cashReceived: number) => {
    if (!paymentOrderId) return;
    setIsUpdating(true);
    try {
      const payload = {
        payment_method: method,
        cash_received: cashReceived
      };

      const res = await fetch(`${API_URL_V2}/management/orders/${paymentOrderId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || errData.message || "Gagal memproses pembayaran");
      }

      toast.success("Pembayaran berhasil diselesaikan");
      setPaymentOrderId(null);
      handleCloseModal();
      mutateTables(); // Refresh tables board
    } catch (error: any) {
      toast.error(error.message || "Gagal memproses pembayaran");
    } finally {
      setIsUpdating(false);
    }
  };

  // Status mapping
  const getStatusText = (statusInt: number) => {
    if (statusInt === 1) return "Available";
    if (statusInt === 2) return "Occupied";
    if (statusInt === 3) return "Reserved";
    if (statusInt === 4) return "Closed";
    return "Unknown";
  };

  const getStatusStyle = (statusInt: number, isModal = false) => {
    if (statusInt === 1) return "bg-[#D1F4E0] text-emerald-700";
    if (statusInt === 2) return "bg-rose-100 text-rose-700";
    if (statusInt === 4) return "bg-slate-200 text-slate-600";
    return "bg-amber-100 text-amber-700";
  };

  const getStatusDot = (statusInt: number) => {
    if (statusInt === 1) return "bg-emerald-500";
    if (statusInt === 2) return "bg-rose-500";
    if (statusInt === 4) return "bg-slate-500";
    return "bg-amber-500";
  };

  const updateTableStatus = async (newStatus: number) => {
    if (!selectedTable) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_URL_V2}/management/tables/${selectedTable.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || errData.message || "Failed to update status");
      }

      toast.success(`Table ${selectedTable.table_number} status updated successfully`);
      mutateTables(); // Refresh data
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || "Failed to update table status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (sectionsErr || tablesErr) {
    return (
      <div className="w-full min-h-screen bg-slate-50 p-6 md:p-8 flex items-center justify-center">
        <div className="text-red-500 flex items-center gap-2 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5" />
          <p className="font-semibold">Failed to load tables data.</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="w-full min-h-screen bg-slate-50 font-sans">
      
      {/* Top Filter Bar (Sticky) */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex gap-3">
          <Select 
            value={activeArea}
            onChange={(val) => setActiveArea(val || "All Areas")}
            data={["All Areas", ...groupedAreas.map(a => a.name)]}
            styles={{
              input: {
                backgroundColor: '#f8fafc',
                borderColor: '#e2e8f0',
                borderRadius: '0.5rem',
                minWidth: '140px',
                fontWeight: 500
              }
            }}
          />
          
          <Select 
            value={activeStatus}
            onChange={(val) => setActiveStatus(val || "All Status")}
            data={[
              { value: "All Status", label: "All Status" },
              { value: "1", label: "Available" },
              { value: "2", label: "Occupied" },
              { value: "3", label: "Reserved" },
              { value: "4", label: "Closed" }
            ]}
            styles={{
              input: {
                backgroundColor: '#f8fafc',
                borderColor: '#e2e8f0',
                borderRadius: '0.5rem',
                minWidth: '140px',
                fontWeight: 500
              }
            }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 hidden md:flex flex-wrap">
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Occupied
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reserved
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Closed
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 md:px-8 py-6 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-slate-400">Loading tables...</div>
      ) : (
        /* Tables Grid Grouped by Area */
        <div className="space-y-10 animate-in fade-in duration-500">
          {groupedAreas.map((area) => {
            // Apply Filters
            if (activeArea !== "All Areas" && area.name !== activeArea) return null;
            
            const filteredTables = area.tables.filter(t => activeStatus === "All Status" || t.status.toString() === activeStatus);
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
                    {filteredTables.length} Tables
                  </span>
                </div>

                {/* Grid (Responsive for 50+ tables) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {filteredTables.map((table) => (
                    <div 
                      key={table.id}
                      onClick={() => handleOpenModal(table, area)}
                      className={`bg-white border rounded-xl overflow-hidden cursor-pointer transition-shadow hover:shadow-md flex flex-col justify-between min-h-[120px]
                        ${table.status === 2 ? "border-rose-200" : 
                          table.status === 3 ? "border-amber-200" :
                          table.status === 4 ? "border-slate-300 opacity-60" : "border-slate-200"}`}
                    >
                      {/* Card Top */}
                      <div className="p-4 flex justify-between items-start">
                        <h3 className="text-xl font-bold text-slate-900">{table.table_number}</h3>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${getStatusStyle(table.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(table.status)}`}></span>
                          {getStatusText(table.status)}
                        </div>
                      </div>

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
          
          {groupedAreas.length === 0 && (
            <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-500">
              No tables found. Please add tables in the Owner dashboard.
            </div>
          )}
        </div>
      )}
      </div>

      {/* Interactive Modal */}
      {selectedTable && selectedArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-slate-900">Table {selectedTable.table_number.replace("T-", "")}</h2>
                  <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${getStatusStyle(selectedTable.status, true)}`}>
                    {getStatusText(selectedTable.status)}
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
                disabled={isUpdating}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Current Session */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Current Session</h4>
                {isSessionLoading ? (
                  <div className="text-sm text-slate-500 animate-pulse">Memuat data sesi...</div>
                ) : sessionData?.current_session ? (
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Nama Pelanggan</p>
                      <p className="text-sm font-semibold text-slate-900">{sessionData.current_session.customer_name || 'Walk-in Guest'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Waktu Kedatangan</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {new Date(sessionData.current_session.seated_since).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic">Tidak ada sesi aktif.</div>
                )}
              </div>

              {/* Change Status Segment (Hidden if there is an active Open Bill) */}
              {!sessionData?.current_session && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Change Status To</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => updateTableStatus(1)}
                      disabled={isUpdating}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition-colors disabled:opacity-50
                        ${selectedTable.status === 1 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                        {selectedTable.status === 1 && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </span>
                      Available
                    </button>
                    <button 
                      onClick={() => updateTableStatus(2)}
                      disabled={isUpdating}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition-colors disabled:opacity-50
                        ${selectedTable.status === 2 ? 'border-rose-500 bg-rose-50 text-rose-700 border-2' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      <Utensils className={`w-3.5 h-3.5 ${selectedTable.status === 2 ? 'text-rose-600' : 'text-slate-500'}`} />
                      Occupied 
                      {selectedTable.status === 2 && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <button 
                      onClick={() => updateTableStatus(3)}
                      disabled={isUpdating}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition-colors disabled:opacity-50
                        ${selectedTable.status === 3 ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      <Calendar className={`w-3.5 h-3.5 ${selectedTable.status === 3 ? 'text-amber-500' : 'text-slate-500'}`} />
                      Reserved
                    </button>
                    <button 
                      onClick={() => updateTableStatus(4)}
                      disabled={isUpdating}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-bold transition-colors disabled:opacity-50
                        ${selectedTable.status === 4 ? 'border-slate-500 bg-slate-100 text-slate-700 border-2' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${selectedTable.status === 4 ? 'bg-slate-500' : 'bg-slate-300'}`}></span>
                      Closed
                    </button>
                  </div>
                </div>
              )}

              {/* Tindakan (Actions) */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Tindakan</h4>
                <div className="flex gap-3">
                  {/* ADD ON (if session exists) */}
                  {sessionData?.current_session && (
                    <button 
                      onClick={() => {
                        router.push(`/${domain}/staff/orders?addon=true&orderId=${sessionData.current_session.order_id}&tableId=${selectedTable.id}&customerName=${encodeURIComponent(sessionData.current_session.customer_name || 'Walk-in Guest')}`);
                      }}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" /> ADD ON
                    </button>
                  )}

                  {/* BUAT PESANAN (if Occupied but no session exists yet) */}
                  {selectedTable.status === 2 && !sessionData?.current_session && (
                    <button 
                      onClick={() => {
                        let url = `/${domain}/staff/orders?tableId=${selectedTable.id}`;
                        if (selectedTable.active_res?.guest_name) {
                          url += `&customerName=${encodeURIComponent(selectedTable.active_res.guest_name)}`;
                        }
                        router.push(url);
                      }}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Utensils className="w-4 h-4" /> Mulai Pesan
                    </button>
                  )}

                  {/* PEMBAYARAN (if Occupied and session exists) */}
                  {selectedTable.status === 2 && sessionData?.current_session && (
                    <button 
                      onClick={() => setPaymentOrderId(sessionData.current_session.order_id)}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      Pembayaran
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                disabled={isUpdating}
                className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
    
    {paymentOrderId && (
      <TablePaymentModal 
        isOpen={!!paymentOrderId}
        onClose={() => setPaymentOrderId(null)}
        orderId={paymentOrderId}
        totalAmount={sessionData?.current_session?.current_bill || 0}
        isSubmitting={isUpdating}
        handleProcessPayment={handleProcessPayment}
      />
    )}
    </>
  );
}
