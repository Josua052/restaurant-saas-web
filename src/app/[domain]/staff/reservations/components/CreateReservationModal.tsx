import { X, Calendar as CalendarIcon, Clock, Users, Phone, User, AlertTriangle } from "lucide-react";
import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { toast } from "react-hot-toast";

interface CreateReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  apiUrl: string;
  selectedDate: string;
  onSuccess: () => void;
}

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export default function CreateReservationModal({
  isOpen,
  onClose,
  token,
  apiUrl,
  selectedDate,
  onSuccess,
}: CreateReservationModalProps) {
  const apiUrlV2 = apiUrl.replace("/v1", "/v2");
  
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    reservation_date: selectedDate,
    reservation_time: "18:30", // Default evening time
    guest_count: 2,
    table_id: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selectedDate from props when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({ ...prev, reservation_date: selectedDate }));
    }
  }, [isOpen, selectedDate]);

  // Fetch tables to populate dropdown
  const { data: tablesRes } = useSWR(
    isOpen ? [`${apiUrlV2}/management/tables`, token] : null,
    ([url, t]) => fetcher(url, t)
  );
  
  const tables = tablesRes?.data || [];
  
  // Filter tables available for the selected guest count (basic filter for UI)
  const matchingTables = tables.filter((t: any) => t.capacity >= formData.guest_count);
  
  // Warning if selected table is too small
  const selectedTableObj = tables.find((t: any) => t.id === formData.table_id);
  const isTableTooSmall = selectedTableObj && selectedTableObj.capacity < formData.guest_count;

  // Fetch available slots for the selected date
  const { data: slotsRes } = useSWR(
    isOpen && formData.reservation_date ? [`${apiUrlV2}/management/reservations/slots?date=${formData.reservation_date}`, token] : null,
    ([url, t]) => fetcher(url, t)
  );
  
  const availableSlots: string[] = slotsRes?.data || [];

  // Auto-select first available slot if current selected time is invalid
  useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.includes(formData.reservation_time)) {
      setFormData(prev => ({ ...prev, reservation_time: availableSlots[0] }));
    }
  }, [availableSlots, formData.reservation_time]);

  if (!isOpen) return null;

  // Generate today string for min date
  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const res = await fetch(`${apiUrlV2}/management/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: "",
          guest_count: formData.guest_count,
          reservation_date: formData.reservation_date,
          reservation_time: formData.reservation_time,
          table_id: formData.table_id || undefined,
          notes: formData.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Gagal membuat reservasi");
      }

      toast.success("Reservasi berhasil dibuat");
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        customer_name: "",
        customer_phone: "",
        reservation_date: selectedDate,
        reservation_time: "18:30",
        guest_count: 2,
        table_id: "",
        notes: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan pada sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">New Reservation</h2>
            <p className="text-sm text-slate-500 mt-0.5">Add a manual booking for a guest</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-reservation-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Guest Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                Guest Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Budi Santoso"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input 
                  type="tel" 
                  required
                  placeholder="081234567890"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <input 
                    type="date" 
                    required
                    min={todayStr}
                    value={formData.reservation_date}
                    onChange={(e) => setFormData({...formData, reservation_date: e.target.value})}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                  />
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                  Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <select 
                    required
                    value={formData.reservation_time}
                    onChange={(e) => setFormData({...formData, reservation_time: e.target.value})}
                    disabled={availableSlots.length === 0}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 appearance-none disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    {availableSlots.length > 0 ? (
                      availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))
                    ) : (
                      <option value="">Tidak ada slot tersedia</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Guest Count */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                Number of Guests <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden w-[120px]">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, guest_count: Math.max(1, formData.guest_count - 1)})}
                    className="px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-bold text-slate-900 text-sm">
                    {formData.guest_count}
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, guest_count: formData.guest_count + 1})}
                    className="px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="text-slate-500 text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Pax
                </div>
              </div>
            </div>

            {/* Assign Table */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                Assign Table (Optional)
              </label>
              <select
                value={formData.table_id}
                onChange={(e) => setFormData({...formData, table_id: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
              >
                <option value="">Unassigned</option>
                {matchingTables.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Capacity: {t.capacity})
                  </option>
                ))}
                {/* Tables that don't fit the pax */}
                {tables.filter((t: any) => t.capacity < formData.guest_count).map((t: any) => (
                  <option key={t.id} value={t.id} disabled>
                    {t.name} (Capacity: {t.capacity}) - Too small
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                ⓘ Showing available tables for {formData.guest_count} guests.
              </p>
              
              {!formData.table_id && matchingTables.length === 0 && tables.length > 0 && (
                <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-amber-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium">No matching tables available — reservation will be unassigned</p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                Notes (Optional)
              </label>
              <div className="relative">
                <textarea 
                  rows={3}
                  maxLength={200}
                  placeholder="Birthday celebration, needs a candle"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
                <div className="absolute bottom-3 right-3 text-[10px] font-medium text-slate-400">
                  {formData.notes.length}/200
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-reservation-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Create Reservation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
