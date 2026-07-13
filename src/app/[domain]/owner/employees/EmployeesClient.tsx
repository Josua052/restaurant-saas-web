"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  X,
  UserCog,
  Trash2,
} from "lucide-react";

// Mock Data for Employees
const mockEmployees = [
  {
    id: 1,
    name: "Arief Rahman",
    email: "arief@example.com",
    role: "Staff",
    status: "Active",
    dateAdded: "Oct 12, 2023",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "jane.doe@example.com",
    role: "Staff",
    status: "Active",
    dateAdded: "Oct 12, 2023",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 3,
    name: "Siti Aminah",
    email: "siti.a@example.com",
    role: "Staff",
    status: "Active",
    dateAdded: "Oct 12, 2023",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
];

export default function EmployeesClient() {
  // Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Dropdown & Change Role State
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [employeeForRoleChange, setEmployeeForRoleChange] = useState<
    any | null
  >(null);

  return (
    <div suppressHydrationWarning className="w-full space-y-6 relative">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
            Employees
          </h1>
          <p className="text-slate-500 mt-1">
            Manage who has access to your restaurant dashboard.
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Invite Employee
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white sm:ml-auto">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 text-center">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-center">
              {mockEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                      />
                      <span className="font-bold text-slate-900">
                        {emp.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-left text-slate-500 font-medium">
                    {emp.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50/50 text-emerald-700 font-semibold px-3 py-1 rounded-full text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {emp.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {emp.dateAdded}
                  </td>
                  <td className="px-6 py-4 relative">
                    <div className="flex justify-center">
                      <button
                        onClick={() =>
                          setActiveDropdownId(
                            activeDropdownId === emp.id ? null : emp.id,
                          )
                        }
                        className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-100"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Contextual Dropdown Menu */}
                    {activeDropdownId === emp.id && (
                      <>
                        {/* Invisible Overlay to close dropdown when clicking outside */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveDropdownId(null)}
                        ></div>

                        {/* Dropdown Box */}
                        <div className="absolute right-[50%] translate-x-[50%] sm:translate-x-0 sm:right-10 top-12 w-48 bg-white border border-slate-200 shadow-xl rounded-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={() => {
                              setActiveDropdownId(null);
                              setEmployeeForRoleChange(emp);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                          >
                            <UserCog className="w-4 h-4 text-indigo-500" />
                            Change Role
                          </button>
                          <button
                            onClick={() => setActiveDropdownId(null)}
                            className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                            Remove Employee
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 mt-auto bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">
            Showing 1 to 3 of 3 entries
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-400 bg-white cursor-not-allowed font-medium shadow-sm">
              Previous
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-400 bg-white cursor-not-allowed font-medium shadow-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Invite Employee */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Invite Employee
              </h2>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Alex Johnson"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  placeholder="alex@restaurant.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Role</label>
                <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white cursor-pointer appearance-none">
                  <option>Staff</option>
                  <option>Manager</option>
                </select>
                <p className="text-[13px] text-slate-500 font-medium">
                  Staff have limited access to dashboard metrics.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change Role */}
      {employeeForRoleChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-6 border-b border-slate-100 flex flex-col gap-1">
              <h2 className="text-xl font-bold text-slate-900">Change Role</h2>
              <p className="text-sm text-slate-500">
                Update the access level for{" "}
                <span className="font-bold text-slate-700">
                  {employeeForRoleChange.name}
                </span>
                .
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Select New Role
                </label>
                <select
                  defaultValue={employeeForRoleChange.role}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white cursor-pointer appearance-none"
                >
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                </select>
                <p className="text-[13px] text-slate-500 leading-relaxed mt-2">
                  Managers have full access to schedules and payroll. Staff can
                  only view their own shifts.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setEmployeeForRoleChange(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => setEmployeeForRoleChange(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
