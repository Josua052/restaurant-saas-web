"use client";

import { useState, useEffect } from "react";
import { Pencil, Save, Lock, Eye, EyeOff, Flame, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileClient({ token }: { token?: string }) {
  const router = useRouter();

  // Toggle state for Personal Information
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Personal Info Form State
  const [personalData, setPersonalData] = useState({
    fullName: "",
    email: "",
    role: "",
  });

  // Draft for unsaved changes
  const [draftPersonalData, setDraftPersonalData] = useState(personalData);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password Visibility Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Derived state to check if password form is valid enough to enable the button
  const isPasswordFormFilled =
    passwordData.currentPassword.length > 0 &&
    passwordData.newPassword.length > 0 &&
    passwordData.confirmPassword.length > 0;

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/management/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { data } = await res.json();
        const profile = {
          fullName: data.name || "",
          email: data.email || "",
          role: data.role || "Owner",
        };
        setPersonalData(profile);
        setDraftPersonalData(profile);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPersonal = () => {
    setDraftPersonalData(personalData);
    setIsEditing(true);
  };

  const handleCancelPersonal = () => {
    setIsEditing(false);
  };

  const handleSavePersonal = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/management/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: draftPersonalData.fullName,
          email: draftPersonalData.email,
        }),
      });

      if (res.ok) {
        setPersonalData(draftPersonalData);
        setIsEditing(false);
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
        router.refresh();
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message || "Failed to update profile"}`);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirmation do not match!");
      return;
    }
    
    if (!token) return;
    setIsSavingPassword(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/management/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      if (res.ok) {
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.message || "Failed to change password"}`);
      }
    } catch (error) {
      console.error("Failed to change password", error);
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="w-full space-y-8">
      {/* Header Area */}
      <div className="pb-4">
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          My Profile
        </h1>
        <p className="text-slate-500 mt-1">
          View and manage your account information.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-8 relative">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Personal Information
            </h2>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelPersonal}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePersonal}
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditPersonal}
                  className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-slate-500" />
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Full Name
              </label>
              {isEditing ? (
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
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors font-medium text-slate-900"
                />
              ) : (
                <p className="text-slate-900 font-bold text-[15px] mt-2">
                  {personalData.fullName}
                </p>
              )}
            </div>

            {/* Email Address (Always read-only in this flow) */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-2 mt-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <p className="text-slate-700 font-medium">
                  {personalData.email}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Contact support to change your email address
              </p>
            </div>

            {/* Role */}
            <div className="md:col-span-2 mt-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Role
              </label>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-[13px] font-bold text-amber-700">
                  Owner
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Change Password */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="border-b border-slate-100 pb-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Change Password
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Update your password to keep your account secure.
            </p>
          </div>

          <div className="space-y-5 max-w-xl">
            {/* Current Password */}
            <div>
              <label className="text-[13px] font-bold text-slate-700 block mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  suppressHydrationWarning
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors text-sm font-medium placeholder:font-normal"
                />
                <button
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-[13px] font-bold text-slate-700 block mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  suppressHydrationWarning
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors text-sm font-medium placeholder:font-normal"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-[13px] font-bold text-slate-700 block mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  suppressHydrationWarning
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors text-sm font-medium placeholder:font-normal"
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Change Password Button */}
            <div className="pt-4 flex justify-end">
              <button
                disabled={!isPasswordFormFilled || isSavingPassword}
                onClick={handleChangePassword}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${
                  isPasswordFormFilled
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isSavingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSavingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Modal */}
      {showSuccessModal && (
        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
          <CheckCircle className="w-5 h-5" />
          <p className="font-bold">Profile updated successfully!</p>
        </div>
      )}
    </div>
  );
}
