"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  User,
  MoreVertical,
  X,
  AlertCircle,
  Armchair,
  Hourglass,
} from "lucide-react";
import { Select } from "@mantine/core";
import useSWR, { mutate } from "swr";
import { toast } from "sonner"; // Assuming sonner is installed as typical in this project

// Data Types
type TableSection = {
  id: string;
  name: string;
};

type TableData = {
  id: string;
  table_number: string;
  capacity: number;
  section?: TableSection;
	status: number;
	updated_at: string;
};

// SWR Fetchers
const fetcherFull = async ([url, token, branchId]: [string, string, string]) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (branchId) headers["X-Branch-ID"] = branchId;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || errData.message || "Failed to fetch data",
    );
  }
  return res.json();
};

const fetcher = async (args: [string, string, string]) => {
  const json = await fetcherFull(args);
  return json.data;
};

// Helper to read active branch from localStorage (same logic as BranchSwitcher)
const getStoredBranchId = (): string => {
  const pathParts = window.location.pathname.split("/");
  const domain = pathParts[1] !== "dashboard" ? pathParts[1] : "";
  const key = domain ? `active_branch_id_${domain}` : "active_branch_id";
  return localStorage.getItem(key) || localStorage.getItem("active_branch_id") || "";
};

export default function TablesClient({
  token,
  apiUrl,
}: {
  token: string;
  apiUrl: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeZone, setActiveZone] = useState("All Zones");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // activeBranchId starts as null (not yet read from localStorage).
  // SWR keys using null will NOT fire until it's set to a string.
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  useEffect(() => {
    // Read from localStorage after mount (client-side only)
    const id = getStoredBranchId();
    setActiveBranchId(id); // Set even if empty string — triggers SWR
    const handleStorage = () => setActiveBranchId(getStoredBranchId());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeZone]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Area Modal State
  const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [areaError, setAreaError] = useState("");

  // Selected Item State
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);

  // Data Fetching — null key = SWR skips until activeBranchId is ready
  const { data: sections = [] } = useSWR<TableSection[]>(
    activeBranchId !== null ? [`${apiUrl}/management/sections`, token, activeBranchId] : null,
    fetcher,
  );

  // Data Fetching
  const queryParams = new URLSearchParams({
    page: currentPage.toString(),
    limit: limit.toString(),
  });
  if (debouncedSearch) queryParams.append("search", debouncedSearch);
  if (activeZone && activeZone !== "All Zones") {
    const section = sections.find((s) => s.name === activeZone);
    if (section) queryParams.append("section_id", section.id);
  }

  const { data: tablesRes, isLoading: tablesLoading } = useSWR(
    activeBranchId !== null ? [`${apiUrl}/management/tables?${queryParams.toString()}`, token, activeBranchId] : null,
    fetcherFull
  );
  
  const rawTables: TableData[] = tablesRes?.data || [];
  const totalTables: number = tablesRes?.meta?.total || 0;
  const totalPages = Math.ceil(totalTables / limit) || 1;

  // Form States (for Add/Edit)
  const [formData, setFormData] = useState({
    name: "",
    capacity: 4,
    area_id: "",
  });
  const [formError, setFormError] = useState("");

  // Popover State (for action menu)
  const [activePopover, setActivePopover] = useState<string | null>(null);

  // Zone filter options for the Mantine Select (moved from the old zone-tabs UI)
  const zoneOptions = ["All Zones", ...sections.map((zone) => zone.name)];

  // Filtering and searching are now handled by the backend pagination endpoint
  const filteredTables = rawTables;

  // Handlers
  const handleOpenAddModal = () => {
    setFormData({ name: "", capacity: 4, area_id: sections[0]?.id || "" });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (table: TableData) => {
    setSelectedTable(table);
    setFormData({
      name: table.table_number,
      capacity: table.capacity,
      area_id: table.section?.id || sections[0]?.id || "",
    });
    setFormError("");
    setIsEditModalOpen(true);
    setActivePopover(null);
  };

  const handleOpenDeleteModal = (table: TableData) => {
    setSelectedTable(table);
    setIsDeleteModalOpen(true);
    setActivePopover(null);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsAddAreaModalOpen(false);
    setSelectedTable(null);
    setFormError("");
    setAreaError("");
  };

  const handleSaveData = async () => {
    if (!formData.name.trim()) {
      setFormError("Table name is required");
      return;
    }

    try {
      if (isAddModalOpen) {
        const payload = {
          table_number: formData.name,
          capacity: Number(formData.capacity),
          ...(formData.area_id ? { section_id: formData.area_id } : {}),
        };
        const res = await fetch(`${apiUrl}/management/tables`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(activeBranchId ? { "X-Branch-ID": activeBranchId } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.message || errData.error || "Failed to add table",
          );
        }
        toast.success("Table added successfully");
      } else if (isEditModalOpen && selectedTable) {
        const payload = {
          table_number: formData.name,
          capacity: Number(formData.capacity),
          ...(formData.area_id ? { section_id: formData.area_id } : {}),
        };
        const res = await fetch(
          `${apiUrl}/management/tables/${selectedTable.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              ...(activeBranchId ? { "X-Branch-ID": activeBranchId } : {}),
            },
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.message || errData.error || "Failed to update table",
          );
        }
        toast.success("Table updated successfully");
      }

      mutate([`${apiUrl}/management/tables?${queryParams.toString()}`, token, activeBranchId]);
      handleCloseModals();
    } catch (err: any) {
      setFormError(err.message || "An error occurred");
      toast.error(err.message || "An error occurred");
    }
  };

  const handleDeleteData = async () => {
    if (!selectedTable) return;
    try {
      const res = await fetch(
        `${apiUrl}/management/tables/${selectedTable.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            ...(activeBranchId ? { "X-Branch-ID": activeBranchId } : {}),
          },
        },
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message || errData.error || "Failed to delete table",
        );
      }
      toast.success("Table deleted successfully");

      mutate([`${apiUrl}/management/tables?${queryParams.toString()}`, token, activeBranchId]);
      handleCloseModals();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete table");
    }
  };

  const handleToggleStatus = async (table: TableData) => {
    const newStatus = table.status === 4 ? 1 : 4; // Toggle between Closed (4) and Available (1)
    
    // If it's occupied (2) or reserved (3), we might still allow closing it or blocking it, but let's assume Owner has full control
    try {
      const res = await fetch(`${apiUrl}/management/tables/${table.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(activeBranchId ? { "X-Branch-ID": activeBranchId } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || "Failed to update table status");
      }

      toast.success(`Table marked as ${newStatus === 4 ? 'Closed' : 'Available'}`);
      mutate([`${apiUrl}/management/tables?${queryParams.toString()}`, token, activeBranchId]);
      setActivePopover(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleSaveArea = async () => {
    if (!areaName.trim()) {
      setAreaError("Area name is required");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/management/sections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(activeBranchId ? { "X-Branch-ID": activeBranchId } : {}),
        },
        body: JSON.stringify({ name: areaName.trim() }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message || errData.error || "Failed to add area",
        );
      }

      toast.success("Area added successfully");
      setAreaName("");
      setIsAddAreaModalOpen(false);
      mutate([`${apiUrl}/management/sections`, token, activeBranchId]); // Reload sections
    } catch (err: any) {
      setAreaError(err.message || "Failed to add area");
      toast.error(err.message || "Failed to add area");
    }
  };

  // Render components
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-24 px-4 border border-slate-200 rounded-2xl bg-white shadow-sm mt-6">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Armchair className="w-12 h-12 text-slate-300" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">No tables found</h3>
      <p className="text-slate-500 text-center max-w-sm mb-6">
        Add your first table to get started or try adjusting your filters if
        you're looking for something specific.
      </p>
      <button
        onClick={handleOpenAddModal}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Table
      </button>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 md:p-8 animate-in fade-in duration-500 font-sans">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Table Management
        </h1>
        <p className="text-slate-500 mt-1">
          Configure and monitor your restaurant's floor plan and seating
          capacity.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          {/* Zone Filter (Mantine Select) — replaces the old zone tabs */}
          <Select
            placeholder="Filter zone"
            leftSection={<Filter className="w-4 h-4" />}
            data={zoneOptions}
            value={activeZone}
            onChange={(value) => setActiveZone(value ?? "All Zones")}
            allowDeselect={false}
            checkIconPosition="right"
            comboboxProps={{ withinPortal: true }}
            className="w-full md:w-56"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsAddAreaModalOpen(true)}
            className="w-full md:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Area
          </button>
          <button
            onClick={handleOpenAddModal}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            Add Table
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {tablesLoading ? (
        <div className="py-24 text-center text-slate-500 flex flex-col items-center">
          <Hourglass className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
          Loading tables...
        </div>
      ) : filteredTables.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="overflow-x-auto lg:overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4 rounded-tl-2xl">TABLE</th>
                  <th className="px-6 py-4">CAPACITY</th>
                  <th className="px-6 py-4">AREA</th>
                  <th className="px-6 py-4">LAST UPDATED</th>
                  <th className="px-6 py-4 text-center rounded-tr-2xl">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTables.map((table, index) => {
                  const isLastTwo =
                    index >= filteredTables.length - 2 &&
                    filteredTables.length > 2;
                  return (
                    <tr
                      key={table.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className={table.status === 4 ? "text-slate-400 line-through" : ""}>
                            {table.table_number}
                          </span>
                          {table.status === 4 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-600 uppercase tracking-wide">
                              Closed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-slate-400" />{" "}
                          {table.capacity}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {table.section?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {table.updated_at ? new Date(table.updated_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }) : "-"}
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        <button
                          onClick={() =>
                            setActivePopover(
                              activePopover === table.id ? null : table.id,
                            )
                          }
                          className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Simple Custom Popover */}
                        {activePopover === table.id && (
                          <div
                            className={`absolute right-8 ${isLastTwo ? "bottom-8" : "top-10"} bg-white border border-slate-200 shadow-lg rounded-xl w-32 py-1 z-10 text-sm overflow-hidden`}
                          >
                            <button
                              onClick={() => handleOpenEditModal(table)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(table)}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
                            >
                              {table.status === 4 ? "Mark Available" : "Close Table"}
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(table)}
                              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Showing {totalTables > 0 ? (currentPage - 1) * limit + 1 : 0} to {Math.min(currentPage * limit, totalTables)} of {totalTables} tables
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-600 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button className="px-3 py-1.5 border border-indigo-600 bg-indigo-600 text-white rounded-md text-sm font-medium shadow-sm">
                {currentPage}
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-600 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-end mt-6">
        <p className="text-sm text-slate-500">
          Showing {filteredTables.length} tables
        </p>
      </div>

      {/* MODALS */}
      {/* Overlay */}
      {(isAddModalOpen ||
        isEditModalOpen ||
        isDeleteModalOpen ||
        isAddAreaModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Add / Edit Modal */}
          {(isAddModalOpen || isEditModalOpen) && (
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {isEditModalOpen ? "Edit Table" : "Add New Table"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {isEditModalOpen
                      ? "Update table information"
                      : "Create a new table for your restaurant floor"}
                  </p>
                </div>
                <button
                  onClick={handleCloseModals}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Table Number / Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Table 05"
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                      formError
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                    }`}
                  />
                  {formError && (
                    <div className="flex items-center gap-1.5 mt-2 text-red-500 text-xs font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formError}
                    </div>
                  )}
                </div>

                {/* Capacity Stepper */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    Table Capacity *{" "}
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-200 rounded-lg p-1">
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            capacity: Math.max(1, formData.capacity - 1),
                          })
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
                      >
                        -
                      </button>
                      <div className="w-10 text-center font-semibold text-slate-900 text-sm">
                        {formData.capacity}
                      </div>
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            capacity: formData.capacity + 1,
                          })
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-slate-500">
                      Minimum 1 guest
                    </span>
                  </div>
                </div>

                {/* Area Select */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Select Area *
                  </label>
                  <select
                    value={formData.area_id}
                    onChange={(e) =>
                      setFormData({ ...formData, area_id: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                    {sections.length === 0 && (
                      <option value="">No areas available</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseModals}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveData}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  {isEditModalOpen ? "Save Changes" : "Add Table"}
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  Delete Table?
                </h2>
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete table \"
                  <span className="font-semibold text-slate-900">
                    {selectedTable?.table_number}
                  </span>
                  \"? This action cannot be undone and will remove all associated
                </p>
              </div>
              <div className="px-6 py-4 bg-slate-50 flex items-center justify-center gap-3">
                <button
                  onClick={handleCloseModals}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteData}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Add Area Modal */}
          {isAddAreaModalOpen && (
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">
                  Add New Area
                </h2>
                <button
                  onClick={handleCloseModals}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {areaError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {areaError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Area Name *
                  </label>
                  <input
                    type="text"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    placeholder="e.g., VIP Lounge, Outdoor Patio"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                <button
                  onClick={handleCloseModals}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveArea}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Save Area
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
