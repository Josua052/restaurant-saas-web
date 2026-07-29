"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Branch {
  id?: string;
  ID?: string;
  name?: string;
  Name?: string;
  address?: string;
}

interface InviteEmployeeModalProps {
  token: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branches: Branch[];
}

export default function InviteEmployeeModal({
  token,
  isOpen,
  onClose,
  onSuccess,
  branches,
}: InviteEmployeeModalProps) {
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Staff",
    branch_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleInvite = async () => {
    setErrorMsg(""); // Clear previous errors
    if (!inviteForm.name || !inviteForm.email || !inviteForm.password) {
      setErrorMsg("Please fill all fields, including password.");
      return;
    }

    if (inviteForm.role === "Staff" && !inviteForm.branch_id) {
      setErrorMsg("Please select a branch for Staff.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...inviteForm,
        branch_id: inviteForm.branch_id || undefined, // Omitting if empty
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/management/employees`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setInviteForm({ name: "", email: "", password: "", role: "Staff", branch_id: "" });
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.details || data.message || "Failed to invite employee");
      }
    } catch (error) {
      console.error("Invite error:", error);
      setErrorMsg("Failed to invite employee due to a network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Invite Employee</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium">
              {errorMsg}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Full Name</label>
            <input
              type="text"
              value={inviteForm.name}
              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              placeholder="e.g. Alex Johnson"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              placeholder="alex@restaurant.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Temporary Password</label>
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
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value, branch_id: "" })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white cursor-pointer appearance-none"
            >
              <option value="Staff">Staff</option>
              <option value="Owner">Owner</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Assign Branch</label>
            <select
              value={inviteForm.branch_id}
              onChange={(e) => setInviteForm({ ...inviteForm, branch_id: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white cursor-pointer appearance-none"
            >
              <option value="">{inviteForm.role === "Staff" ? "Select a branch" : "No Branch (All Access)"}</option>
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
            {inviteForm.role === "Staff" && (
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
            onClick={handleInvite}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? "Inviting..." : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
