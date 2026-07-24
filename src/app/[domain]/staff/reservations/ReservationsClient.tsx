"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MoreVertical,
  UserCheck,
  Ban,
  Clock,
  CheckCircle2,
  CalendarRange,
  Users,
} from "lucide-react";
import { useDebounce } from "use-debounce";
import CreateReservationModal from "./components/CreateReservationModal";
import { CheckInModal, CancelModal } from "./components/ActionModals";
import { toast } from "react-hot-toast";

interface ReservationsClientProps {
  token: string;
  apiUrl: string;
}

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export default function ReservationsClient({
  token,
  apiUrl,
}: ReservationsClientProps) {
  const apiUrlV2 = apiUrl.replace("/v1", "/v2");

  // State
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Fetch Data
  const {
    data: reservationsRes,
    mutate: mutateReservations,
    isLoading: isReservationsLoading,
  } = useSWR(
    [`${apiUrlV2}/management/reservations?date=${selectedDate}`, token],
    ([url, t]) => fetcher(url, t),
  );

  const { data: statsRes, mutate: mutateStats } = useSWR(
    [`${apiUrlV2}/management/reservations/stats?date=${selectedDate}`, token],
    ([url, t]) => fetcher(url, t),
  );

  const rawReservations = reservationsRes?.data || [];
  const stats = statsRes?.data || {
    total: 0,
    expectedPax: 0,
    waiting: 0,
    checkedIn: 0,
  };

  // Filter and Search Logic
  const filteredReservations = useMemo(() => {
    return rawReservations.filter((res: any) => {
      // Tab Filter: 1=Pending, 2=Confirmed, 3=CheckedIn, 4=Completed, 5=Canceled
      if (activeTab === "Pending" && res.status !== 1) return false;
      if (activeTab === "Confirmed" && res.status !== 2) return false;
      if (activeTab === "Checked-In" && res.status !== 3) return false;
      if (activeTab === "Canceled" && res.status !== 5) return false;

      // Search Filter
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const nameMatch = res.customer_name?.toLowerCase().includes(query);
        const phoneMatch = res.customer_phone?.includes(query);
        if (!nameMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [rawReservations, activeTab, debouncedSearch]);

  // Pagination
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  // Helpers
  const handleDateChange = (amount: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + amount);
    setSelectedDate(format(d, "yyyy-MM-dd"));
    setCurrentPage(1);
  };

  const refreshData = () => {
    mutateReservations();
    mutateStats();
  };

  // Status Badge Mapper
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
            Pending
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
            Confirmed
          </span>
        );
      case 3:
        return (
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
            Checked-In
          </span>
        );
      case 4:
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
            Completed
          </span>
        );
      case 5:
        return (
          <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
            Canceled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            Unknown
          </span>
        );
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: number) => {
    try {
      const res = await fetch(
        `${apiUrlV2}/management/reservations/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Status updated successfully");
      refreshData();
    } catch (err) {
      toast.error("Failed to update reservation");
    }
    setOpenActionMenuId(null);
  };

  return (
    <div className="w-full flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Sticky Header Area */}
      <div className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
            Reservations
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Manage table bookings and capacity.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span>+</span> New Reservation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            {/* Search */}
            <div className="relative w-full xl:w-[320px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search guest name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-full xl:w-auto overflow-x-auto scrollbar-hide">
              {["All", "Pending", "Confirmed", "Checked-In", "Canceled"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>

            {/* Date Picker Control */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm shrink-0 w-full xl:w-auto">
              <button
                onClick={() => handleDateChange(-1)}
                className="p-2.5 hover:bg-slate-50 text-slate-500 transition-colors border-r border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 flex items-center gap-2 text-sm font-bold text-slate-700 min-w-[180px] justify-center cursor-pointer relative">
                <CalendarIcon className="w-4 h-4 text-indigo-500" />
                {format(new Date(selectedDate), "EEE, dd MMM yyyy")}
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <button
                onClick={() => handleDateChange(1)}
                className="p-2.5 hover:bg-slate-50 text-slate-500 transition-colors border-l border-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-h-[400px]">
            <div className="w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-4 px-6">Time</th>
                    <th className="py-4 px-6">Guest Details</th>
                    <th className="py-4 px-6">Pax</th>
                    <th className="py-4 px-6">Table</th>
                    <th className="py-4 px-6">Source</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isReservationsLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-slate-400"
                      >
                        Loading reservations...
                      </td>
                    </tr>
                  ) : paginatedReservations.length > 0 ? (
                    paginatedReservations.map((res: any) => (
                      <tr
                        key={res.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {res.reservation_time
                            ? res.reservation_time.substring(0, 5)
                            : "-"}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900">
                            {res.customer_name}
                          </p>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {res.customer_phone}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium flex items-center gap-1.5 mt-2">
                          <Users className="w-4 h-4 text-slate-400" />{" "}
                          {res.guest_count}
                        </td>
                        <td className="py-4 px-6">
                          {res.table_name ? (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-bold text-xs border border-slate-200">
                              {res.table_name}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md font-medium text-xs border border-slate-200">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-500 flex items-center gap-1.5 mt-2">
                          {res.reservation_code?.startsWith("RES")
                            ? "Phone/Manual"
                            : "Web"}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(res.status)}
                        </td>
                        <td className="py-4 px-6 text-center relative">
                          <button
                            onClick={() =>
                              setOpenActionMenuId(
                                openActionMenuId === res.id ? null : res.id,
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {/* Action Dropdown Menu */}
                          {openActionMenuId === res.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenActionMenuId(null)}
                              />
                              <div className="absolute right-8 top-8 z-50 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-left animate-in fade-in slide-in-from-top-2">
                                {/* 1 -> 2: Mark Confirmed */}
                                {res.status === 1 && (
                                  <button
                                    onClick={() => handleUpdateStatus(res.id, 2)}
                                    className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Mark Confirmed
                                  </button>
                                )}

                                {/* 2 -> 3: Check In Guest */}
                                {res.status === 2 && (
                                  <button
                                    onClick={() => {
                                      setSelectedReservation(res);
                                      setIsCheckInModalOpen(true);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                    Check In Guest
                                  </button>
                                )}

                                {/* 3 -> 4: Complete Reservation */}
                                {res.status === 3 && (
                                  <button
                                    onClick={() => handleUpdateStatus(res.id, 4)}
                                    className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Mark Completed
                                  </button>
                                )}

                                {/* 1 -> 5, 2 -> 5: Cancel Reservation */}
                                {(res.status === 1 || res.status === 2) && (
                                  <button
                                    onClick={() => {
                                      setSelectedReservation(res);
                                      setIsCancelModalOpen(true);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Ban className="w-4 h-4" />
                                    Cancel Reservation
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-24">
                        <div className="flex flex-col items-center justify-center text-center">
                          <img
                            src="/illustrations/empty-table.svg"
                            alt="Empty Table"
                            className="w-48 h-48 mb-4 opacity-50 grayscale"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                          {/* Fallback icon if image fails */}
                          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                            <CalendarRange className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">
                            No reservations for this date
                          </h3>
                          <p className="text-slate-500 max-w-sm mb-6">
                            There are currently no bookings scheduled for{" "}
                            {format(new Date(selectedDate), "MMMM do, yyyy")}.
                            Open availability across all floor plans.
                          </p>
                          <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-xl transition-all"
                          >
                            + New Reservation
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {filteredReservations.length > 0 && (
              <div className="mt-auto border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredReservations.length,
                  )}{" "}
                  of {filteredReservations.length} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 font-medium disabled:opacity-50 disabled:bg-slate-50"
                  >
                    Previous
                  </button>
                  {/* Simplistic pagination numbers */}
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 py-1.5 rounded-lg font-bold text-center ${
                            currentPage === page
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-1 text-slate-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 font-medium disabled:opacity-50 disabled:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateReservationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        token={token}
        apiUrl={apiUrl}
        selectedDate={selectedDate}
        onSuccess={refreshData}
      />

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => {
          setIsCheckInModalOpen(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation}
        token={token}
        apiUrl={apiUrl}
        onSuccess={refreshData}
      />

      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation}
        token={token}
        apiUrl={apiUrl}
        onSuccess={refreshData}
      />
    </div>
  );
}
