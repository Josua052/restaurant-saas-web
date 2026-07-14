"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Star } from "lucide-react";

// Define the interface based on the Go backend User entity
export interface UserProfile {
  ID?: string;
  id?: string;
  Name?: string;
  name?: string;
  Email?: string;
  email?: string;
  Role?: {
    Name?: string;
    name?: string;
  };
  role?: {
    Name?: string;
    name?: string;
  };
}

interface ProfileClientProps {
  userProfile?: UserProfile | null;
}

export default function ProfileClient({ userProfile }: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Personal Info Form State (Hydrated from Server Data)
  const [personalData, setPersonalData] = useState({
    fullName: userProfile?.Name || userProfile?.name || "",
    email: userProfile?.Email || userProfile?.email || "",
    role:
      userProfile?.Role?.Name ||
      userProfile?.Role?.name ||
      userProfile?.role?.Name ||
      userProfile?.role?.name ||
      "",
  });
  const [draftPersonalData, setDraftPersonalData] = useState({
    ...personalData,
  });

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSavePersonalInfo = () => {
    setPersonalData(draftPersonalData);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleCancelEdit = () => {
    setDraftPersonalData(personalData);
    setIsEditing(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const isPasswordFormFilled =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0;
  const isPasswordsMatch =
    newPassword === confirmPassword || confirmPassword.length === 0;

  return (
    <div suppressHydrationWarning className="w-full space-y-8 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 font-heading tracking-tight">
          My Profile
        </h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">
          View and manage your account information.
        </p>
      </div>

      {/* Card 1: Personal Information */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 md:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Personal Information
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePersonalInfo}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Update Profile
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Full Name */}
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                {!isEditing ? (
                  <p className="text-slate-900 font-medium text-[15px]">
                    {personalData.fullName}
                  </p>
                ) : (
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={draftPersonalData.fullName}
                    onChange={(e) =>
                      setDraftPersonalData({
                        ...draftPersonalData,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full h-11 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  />
                )}
              </div>

              {/* Role - Only shown in read mode, but can be displayed in edit mode too as read-only */}
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Role
                </label>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-indigo-800 to-amber-700 text-white text-xs font-medium shadow-sm">
                  <Star
                    className="w-3.5 h-3.5 text-amber-300"
                    fill="currentColor"
                  />
                  {personalData.role}
                </div>
              </div>

              {/* Email Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                {!isEditing ? (
                  <div className="flex items-center gap-2">
                    <p className="text-slate-900 font-medium text-[15px]">
                      {personalData.email}
                    </p>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      suppressHydrationWarning
                      type="text"
                      value={draftPersonalData.email}
                      disabled
                      className="w-full h-11 pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  This email is locked to protect system access. Contact your
                  technical team to change it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Change Password */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 md:p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Change Password
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Update your password to keep your account secure. This account has
              full server access — choose a strong password.
            </p>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="border-t border-slate-100 pt-6 space-y-6"
          >
            {/* Current Password */}
            <div className="max-w-xl">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  suppressHydrationWarning
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-3 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="max-w-xl">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  suppressHydrationWarning
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full h-11 pl-3 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="max-w-xl">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  suppressHydrationWarning
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full h-11 pl-3 pr-10 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow ${!isPasswordsMatch ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-indigo-500"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {!isPasswordsMatch && (
                <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full border border-red-500 text-[8px] leading-none">
                    !
                  </span>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="pt-4 flex justify-end max-w-xl">
              <button
                type="submit"
                disabled={!isPasswordFormFilled || !isPasswordsMatch}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm transition-colors ${
                  isPasswordFormFilled && isPasswordsMatch
                    ? "text-white bg-indigo-600 hover:bg-indigo-700"
                    : "text-slate-400 bg-slate-100 cursor-not-allowed"
                }`}
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
