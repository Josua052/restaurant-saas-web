import React, { useState } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: any;
  token: string;
  apiUrl: string;
  onSuccess: () => void;
}

export function CheckInModal({
  isOpen,
  onClose,
  reservation,
  token,
  apiUrl,
  onSuccess,
}: CheckInModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrlV2 = apiUrl.replace("/v1", "/v2");

  if (!isOpen || !reservation) return null;

  const handleCheckIn = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const res = await fetch(`${apiUrlV2}/management/reservations/${reservation.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 3, // 3: Checked-In / Seated
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to check in reservation");
      }

      toast.success("Guest checked in successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "System error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tableName = reservation.table_name || "an unassigned table";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl flex flex-col p-8 items-center text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Check in this guest?</h2>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          <strong className="text-slate-800">{reservation.customer_name} ({reservation.guest_count} guests)</strong> will be marked as arrived and seated at <strong className="text-slate-800">{tableName}</strong>. This will update the table status to Occupied.
        </p>

        {/* Summary Card */}
        <div className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-5 mb-8">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">GUEST</p>
              <p className="font-semibold text-slate-900">{reservation.customer_name}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">TIME</p>
              <p className="font-semibold text-slate-900">{reservation.reservation_time}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">PAX</p>
              <p className="font-semibold text-slate-900">{reservation.guest_count} Guests</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">TABLE</p>
              <p className="font-semibold text-slate-900">{tableName}</p>
            </div>
          </div>
        </div>

        <div className="flex w-full gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3.5 px-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCheckIn}
            disabled={isSubmitting}
            className="flex-[2] py-3.5 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <UserCheck className="w-5 h-5" />
                Confirm Check-In
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple icon for user check
function UserCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}


interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: any;
  token: string;
  apiUrl: string;
  onSuccess: () => void;
}

export function CancelModal({
  isOpen,
  onClose,
  reservation,
  token,
  apiUrl,
  onSuccess,
}: CancelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrlV2 = apiUrl.replace("/v1", "/v2");

  if (!isOpen || !reservation) return null;

  const handleCancel = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const res = await fetch(`${apiUrlV2}/management/reservations/${reservation.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 5, // 5: Canceled
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to cancel reservation");
      }

      toast.success("Reservation canceled successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "System error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tableName = reservation.table_name ? `Table ${reservation.table_name}` : "unassigned tables";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-xl flex flex-col p-7 items-center text-center animate-in zoom-in-95 duration-200">
        <div className="absolute -top-6 w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm border-4 border-white">
          <AlertCircle className="w-7 h-7" />
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">Cancel this reservation?</h2>
        
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          This will mark the booking for <strong className="text-slate-800">{reservation.customer_name}</strong> at <strong className="text-slate-800">{reservation.reservation_time}</strong> as Canceled and free up {tableName} for other guests.<br/><br/>
          This action cannot be undone.
        </p>

        <div className="flex w-full gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Keep Reservation
          </button>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Cancel Reservation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
