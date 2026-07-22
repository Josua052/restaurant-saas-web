"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  User, 
  MoreVertical, 
  X, 
  AlertCircle,
  Armchair
} from "lucide-react";

// Mock Data Types
type TableData = {
  id: string;
  name: string;
  capacity: number;
  area: string;
  lastUpdated: string;
};

// Initial Mock Data
const INITIAL_TABLES: TableData[] = [
  { id: "1", name: "T-101", capacity: 4, area: "Indoor Main", lastUpdated: "10 mins ago" },
  { id: "2", name: "T-102", capacity: 2, area: "Indoor Main", lastUpdated: "45 mins ago" },
  { id: "3", name: "P-201", capacity: 6, area: "Outdoor Patio", lastUpdated: "2 hours ago" },
  { id: "4", name: "V-01", capacity: 8, area: "VIP Lounge", lastUpdated: "Just now" },
  { id: "5", name: "T-105", capacity: 2, area: "Indoor Main", lastUpdated: "30 mins ago" },
  { id: "6", name: "P-202", capacity: 4, area: "Outdoor Patio", lastUpdated: "1 hour ago" },
];

export default function TablesClient() {
  const [tables, setTables] = useState<TableData[]>(INITIAL_TABLES); // Set to [] to see Empty State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeZone, setActiveZone] = useState("All Zones");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected Item State
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);

  // Form States (for Add/Edit)
  const [formData, setFormData] = useState({ name: "", capacity: 4, area: "Indoor Main" });
  const [formError, setFormError] = useState("");
  
  // Popover State (for action menu)
  const [activePopover, setActivePopover] = useState<string | null>(null);

  // Handlers
  const handleOpenAddModal = () => {
    setFormData({ name: "", capacity: 4, area: "Indoor Main" });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (table: TableData) => {
    setSelectedTable(table);
    setFormData({ name: table.name, capacity: table.capacity, area: table.area });
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
    setSelectedTable(null);
    setFormError("");
  };

  const handleSaveData = () => {
    if (!formData.name.trim()) {
      setFormError("Table name is required");
      return;
    }
    // Simulate Saving Data (Mock)
    if (isAddModalOpen) {
      const newTable: TableData = {
        id: Math.random().toString(),
        name: formData.name,
        capacity: formData.capacity,
        area: formData.area,
        lastUpdated: "Just now"
      };
      setTables([newTable, ...tables]);
    } else if (isEditModalOpen && selectedTable) {
      setTables(tables.map(t => t.id === selectedTable.id ? { ...t, ...formData, lastUpdated: "Just now" } : t));
    }
    handleCloseModals();
  };

  const handleDeleteData = () => {
    if (selectedTable) {
      setTables(tables.filter(t => t.id !== selectedTable.id));
    }
    handleCloseModals();
  };

  // Render components
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-24 px-4 border border-slate-200 rounded-2xl bg-white shadow-sm mt-6">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Armchair className="w-12 h-12 text-slate-300" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">No tables found</h3>
      <p className="text-slate-500 text-center max-w-sm mb-6">
        Add your first table to get started or try adjusting your filters if you're looking for something specific.
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Table Management</h1>
        <p className="text-slate-500 mt-1">Configure and monitor your restaurant's floor plan and seating capacity.</p>
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
          {/* Filter Button */}
          <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          Add Table
        </button>
      </div>

      {/* Zone Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["All Zones", "Main Dining", "Patio"].map(zone => (
            <button 
              key={zone}
              onClick={() => setActiveZone(zone)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeZone === zone 
                  ? "border-slate-300 bg-white text-slate-900 shadow-sm" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500 hidden md:block">
          Showing {tables.length} tables
        </p>
      </div>

      {/* Main Content Area */}
      {tables.length === 0 ? renderEmptyState() : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">TABLE</th>
                  <th className="px-6 py-4">CAPACITY</th>
                  <th className="px-6 py-4">AREA</th>
                  <th className="px-6 py-4">LAST UPDATED</th>
                  <th className="px-6 py-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tables.map((table) => (
                  <tr key={table.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{table.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" /> {table.capacity}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{table.area}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{table.lastUpdated}</td>
                    <td className="px-6 py-4 text-center relative">
                      <button 
                        onClick={() => setActivePopover(activePopover === table.id ? null : table.id)}
                        className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {/* Simple Custom Popover */}
                      {activePopover === table.id && (
                        <div className="absolute right-8 top-10 bg-white border border-slate-200 shadow-lg rounded-xl w-32 py-1 z-10 text-sm overflow-hidden">
                          <button 
                            onClick={() => handleOpenEditModal(table)}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
                          >
                            Edit
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
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">Showing 1 to {tables.length} of {tables.length} tables</span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-400 bg-slate-100 cursor-not-allowed">Previous</button>
              <button className="px-3 py-1.5 border border-indigo-600 bg-indigo-600 text-white rounded-md text-sm font-medium shadow-sm">1</button>
              <button className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-md text-sm text-slate-600 transition-colors">Next</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* Overlay */}
      {(isAddModalOpen || isEditModalOpen || isDeleteModalOpen) && (
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
                    {isEditModalOpen ? "Update table information" : "Create a new table for your restaurant floor"}
                  </p>
                </div>
                <button onClick={handleCloseModals} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-5">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Table Number / Name *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Table 05"
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                      formError ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
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
                    Table Capacity * <User className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-200 rounded-lg p-1">
                      <button 
                        onClick={() => setFormData({...formData, capacity: Math.max(1, formData.capacity - 1)})}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
                      >
                        -
                      </button>
                      <div className="w-10 text-center font-semibold text-slate-900 text-sm">
                        {formData.capacity}
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, capacity: formData.capacity + 1})}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-slate-500">Minimum 1 guest</span>
                  </div>
                </div>

                {/* Area Select */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Area *</label>
                  <select 
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                  >
                    <option value="Indoor Main">Indoor Main</option>
                    <option value="Outdoor Patio">Outdoor Patio</option>
                    <option value="VIP Lounge">VIP Lounge</option>
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
                <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Table?</h2>
                <p className="text-sm text-slate-500">
                  Are you sure you want to delete <span className="font-bold text-slate-700">{selectedTable?.name}</span>? This action cannot be undone.
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

        </div>
      )}

    </div>
  );
}
