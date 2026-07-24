import { CalendarRange, Users, Clock, CheckCircle2 } from "lucide-react";
import React from "react";

interface ReservationStats {
  total: number;
  expectedPax: number;
  waiting: number;
  checkedIn: number;
}

export default function StatCards({ stats }: { stats: ReservationStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Reservations */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
          <CalendarRange className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Total Reservations</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-900 leading-none">
              {stats.total}
            </h3>
            <span className="text-sm font-semibold text-slate-500 mb-0.5">
              Bookings
            </span>
          </div>
        </div>
      </div>

      {/* Expected Guests */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-slate-100 rounded-lg text-slate-600 shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Expected Guests</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-900 leading-none">
              {stats.expectedPax}
            </h3>
            <span className="text-sm font-semibold text-slate-500 mb-0.5">
              Pax
            </span>
          </div>
        </div>
      </div>

      {/* Waiting List (Pending) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-amber-50 rounded-lg text-amber-600 shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Waiting List</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-900 leading-none">
              {stats.waiting}
            </h3>
            <span className="text-sm font-semibold text-slate-500 mb-0.5">
              Waiting
            </span>
          </div>
        </div>
      </div>

      {/* Checked-In */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600 shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Checked-In</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-900 leading-none">
              {stats.checkedIn}
            </h3>
            <span className="text-sm font-semibold text-slate-500 mb-0.5">
              Arrived
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
