"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Branch {
  id?: string;
  ID?: string;
  name?: string;
  Name?: string;
  address?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  branch_id?: string;
  branch_name?: string;
}

interface EditEmployeeModalProps {
  token: string;
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branches: Branch[];
}

export default function EditEmployeeModal({
  token,
  employee,
  isOpen,
  onClose,
  onSuccess,
  branches,
}: EditEmployeeModalProps) {
  const [editForm, setEditForm] = useState({
    role: "Staff",
    branch_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form state when modal opens or employee changes
  useEffect(() => {
    if (employee) {
      setEditForm({
        role: employee.role || "Staff",
        branch_id: employee.branch_id || "",
      });
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleEdit = async () => {
    if (editForm.role === "Staff" && !editForm.branch_id) {
      alert("Please select a branch for Staff.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        role: editForm.role,
        branch_id: editForm.branch_id || undefined, // Omitting if empty
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/management/employees/${employee.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert(data.message || "Failed to update employee");
      }
    } catch (error) {
      console.error("Edit error:", error);
      alert("Failed to update employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Employee</h2>
            <p className="text-sm text-slate-500 mt-1">{employee.name} ({employee.email})</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Role</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value, branch_id: "" })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white cursor-pointer appearance-none"
            >
              <option value="Staff">Staff</option>
              <option value="Owner">Owner</option>
            </select>
            <p className="text-[13px] text-slate-500 font-medium">
              Staff have limited access to dashboard metrics.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Assign Branch</label>
            <select
              value={editForm.branch_id}
              onChange={(e) => setEditForm({ ...editForm, branch_id: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white cursor-pointer appearance-none"
            >
              <option value="">{editForm.role === "Staff" ? "Select a branch" : "No Branch (All Access)"}</option>
              {branches.map((b) => {
                const branchId = b.id || b.ID;
                const branchName = b.name || b.Name;
                return (
                  <option key={branchId} value={branchId}>
                    {branchName}
                  </option>
                );
              })}
            </select>
            {editForm.role === "Staff" && (
              <p className="text-[13px] text-amber-600 font-medium">
                Branch assignment is required for Staff.
              </p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
