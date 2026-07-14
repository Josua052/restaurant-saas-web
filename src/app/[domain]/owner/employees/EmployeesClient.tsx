"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  X,
  UserCog,
  Trash2,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  dateAdded: string;
}

interface EmployeesClientProps {
  token: string;
}

export default function EmployeesClient({ token }: EmployeesClientProps) {
  // Data States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Staff",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown & Change Role State
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [employeeForRoleChange, setEmployeeForRoleChange] = useState<
    Employee | null
  >(null);

  // Fetch Employees
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/management/employees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filtered Employees Computation
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "All" || emp.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [employees, searchQuery, roleFilter]);

  // Handle Invite
  const handleInvite = async () => {
    if (!inviteForm.name || !inviteForm.email || !inviteForm.password) {
      alert("Please fill all fields, including password.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/management/employees`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(inviteForm),
        }
      );
      
      const data = await res.json();
      if (res.ok) {
        setIsInviteModalOpen(false);
        setInviteForm({ name: "", email: "", password: "", role: "Staff" });
        fetchEmployees(); // Refresh
      } else {
        alert(data.message || "Failed to invite employee");
      }
    } catch (error) {
      console.error("Invite error:", error);
      alert("Failed to invite employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Change Role
  const handleChangeRole = async (newRole: string) => {
    if (!employeeForRoleChange) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/management/employees/${employeeForRoleChange.id}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );
      
      if (res.ok) {
        setEmployeeForRoleChange(null);
        fetchEmployees(); // Refresh
      } else {
        const data = await res.json();
        alert(data.message || "Failed to change role");
      }
    } catch (error) {
      console.error("Change role error:", error);
      alert("Failed to change role");
    }
  };

  // Handle Remove
  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this employee?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/management/employees/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (res.ok) {
        fetchEmployees(); // Refresh
      } else {
        const data = await res.json();
        alert(data.message || "Failed to remove employee");
      }
    } catch (error) {
      console.error("Remove error:", error);
      alert("Failed to remove employee");
    }
  };

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white"
            />
          </div>
          <div className="relative sm:ml-auto w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-40 pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white appearance-none cursor-pointer text-slate-600 font-medium"
            >
              <option value="All">All Roles</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative">
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No employees found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase border border-indigo-200">
                          {emp.name.substring(0, 2)}
                        </div>
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
                      {new Date(emp.dateAdded).toLocaleDateString()}
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
                              onClick={() => {
                                setActiveDropdownId(null);
                                handleRemove(emp.id);
                              }}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 mt-auto bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">
            Showing {filteredEmployees.length > 0 ? 1 : 0} to {filteredEmployees.length} of {filteredEmployees.length} entries
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
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
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
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  placeholder="alex@restaurant.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  placeholder="Create a password"
                />
                <p className="text-[13px] text-slate-500 font-medium">
                  Set an initial password for the employee to login.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white cursor-pointer appearance-none"
                >
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
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
                onClick={handleInvite}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Inviting..." : "Send Invite"}
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
                  onChange={(e) => handleChangeRole(e.target.value)}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
