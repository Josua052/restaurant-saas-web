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
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InviteEmployeeModal from "@/components/modals/InviteEmployeeModal";
import EditEmployeeModal from "@/components/modals/EditEmployeeModal";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  branch_id?: string;
  branch_name?: string;
  dateAdded: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
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

  // Branch States
  const [branches, setBranches] = useState<Branch[]>([]);

  // Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  // Dropdown State
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Delete State
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Employees
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/management/employees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
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

  const fetchBranches = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/management/tenant/branches`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setBranches(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
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

  // Handled by Modals now

  // Handle Remove via Modal
  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/management/employees/${employeeToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        fetchEmployees(); // Refresh
        setEmployeeToDelete(null);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to remove employee");
      }
    } catch (error) {
      console.error("Remove error:", error);
      alert("Failed to remove employee");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div suppressHydrationWarning className="w-full space-y-6 relative p-6 md:p-8">
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

      {/* Search and Filters */}
      <div className="shrink-0 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-11 lg:h-10 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white shadow-sm"
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-slate-400" />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-48 pl-9 pr-8 h-11 lg:h-10 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white appearance-none cursor-pointer text-slate-700 font-medium shadow-sm"
          >
            <option value="All">Filter: All Roles</option>
            <option value="Manager">Manager</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[400px]">

        {/* Table */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 text-center">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-center">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-500"
                  >
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
                      <span className="text-sm font-medium text-slate-700">
                        {emp.branch_name || "All Branches"}
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
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-100">
                              <MoreVertical className="w-5 h-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-xl rounded-xl">
                            <DropdownMenuItem 
                              className="cursor-pointer text-slate-700 hover:bg-slate-50 gap-2 font-medium py-2.5"
                              onClick={() => {
                                setEmployeeToEdit(emp);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <UserCog className="w-4 h-4 text-indigo-500" />
                              <span>Edit Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-2 font-medium py-2.5 focus:text-rose-700 focus:bg-rose-50"
                              onClick={() => setEmployeeToDelete(emp)}
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                              <span>Remove Employee</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
            Showing {filteredEmployees.length > 0 ? 1 : 0} to{" "}
            {filteredEmployees.length} of {filteredEmployees.length} entries
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


      {/* Modals */}
      <InviteEmployeeModal
        token={token}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchEmployees}
        branches={branches}
      />

      <EditEmployeeModal
        token={token}
        employee={employeeToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEmployeeToEdit(null);
        }}
        onSuccess={fetchEmployees}
        branches={branches}
      />

      {/* Modal: Confirm Delete */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Remove Employee</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Are you sure you want to remove <span className="font-semibold text-slate-700">{employeeToDelete.name}</span>? This action will revoke their access to the dashboard.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setEmployeeToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
