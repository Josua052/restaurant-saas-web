"use client";

import { useState } from "react";
import {
  Pencil,
  Save,
  Info,
  Phone,
  Building2,
  Globe2,
  MapPin,
  Clock,
} from "lucide-react";

export default function SettingsClient() {
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    restaurantName: "Kopi Kenangan",
    phone: "+62 811 1234 5678",
    address:
      "Menara Standard Chartered, Lt. 32.\nJl. Prof. DR. Satrio No.164, Jakarta Selatan, 12930",
    currency: "IDR - Indonesian Rupiah",
    timezone: "Asia/Jakarta (WIB)",
    domain: "menu.kopikenangan.com",
  });

  // Temporary state for when user is typing, before they click Save
  const [draftData, setDraftData] = useState(formData);

  const handleEdit = () => {
    setDraftData(formData); // Reset draft to current saved data
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setFormData(draftData);
    setIsEditing(false);
    // Optional: add a toast notification here in a real app
  };

  return (
    <div suppressHydrationWarning className="w-full space-y-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
            Store Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your restaurant's profile and regional preferences.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 border border-slate-300 bg-white text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Basic Information
            </h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-8">
              {/* Logo Area */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                {isEditing ? (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-200 bg-indigo-50 flex items-center justify-center cursor-pointer hover:bg-indigo-100 transition-colors">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider text-center px-2">
                      Update Logo
                    </span>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border border-slate-200 bg-white overflow-hidden p-2 flex items-center justify-center shadow-sm">
                    <div className="text-slate-300">
                      {/* Placeholder Coffee Icon for Logo */}
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                        <line x1="6" x2="6" y1="2" y2="4" />
                        <line x1="10" x2="10" y1="2" y2="4" />
                        <line x1="14" x2="14" y1="2" y2="4" />
                      </svg>
                    </div>
                  </div>
                )}
                {!isEditing && (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Restaurant Logo
                  </p>
                )}
              </div>

              {/* Text Fields */}
              <div className="flex-1 space-y-6">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Restaurant Name
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={draftData.restaurantName}
                        onChange={(e) =>
                          setDraftData({
                            ...draftData,
                            restaurantName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                      />
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        This name will be displayed on receipts and
                        customer-facing interfaces.
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-900 font-bold text-lg">
                      {formData.restaurantName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Business Phone Number
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={draftData.phone}
                        onChange={(e) =>
                          setDraftData({ ...draftData, phone: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  ) : (
                    <p className="text-slate-700 font-medium">
                      {formData.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Location Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Location Details
            </h2>
          </div>

          <div className="p-6">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Full Address
            </label>
            {isEditing ? (
              <textarea
                rows={3}
                value={draftData.address}
                onChange={(e) =>
                  setDraftData({ ...draftData, address: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors resize-none leading-relaxed"
              />
            ) : (
              <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                {formData.address}
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Regional Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-indigo-600" />
              Regional Settings
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Currency
              </label>
              {isEditing ? (
                <select
                  value={draftData.currency}
                  onChange={(e) =>
                    setDraftData({ ...draftData, currency: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white cursor-pointer appearance-none"
                >
                  <option value="IDR - Indonesian Rupiah">
                    IDR - Indonesian Rupiah
                  </option>
                  <option value="USD - US Dollar">USD - US Dollar</option>
                  <option value="SGD - Singapore Dollar">
                    SGD - Singapore Dollar
                  </option>
                </select>
              ) : (
                <p className="text-slate-700 font-medium">
                  {formData.currency}
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Timezone
              </label>
              {isEditing ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                      value={draftData.timezone}
                      onChange={(e) =>
                        setDraftData({ ...draftData, timezone: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white cursor-pointer appearance-none"
                    >
                      <option value="Asia/Jakarta (WIB)">
                        Asia/Jakarta (WIB)
                      </option>
                      <option value="Asia/Makassar (WITA)">
                        Asia/Makassar (WITA)
                      </option>
                      <option value="Asia/Jayapura (WIT)">
                        Asia/Jayapura (WIT)
                      </option>
                    </select>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    Affects reporting and reservation times.
                  </p>
                </>
              ) : (
                <p className="text-slate-700 font-medium">
                  {formData.timezone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Custom Domain */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Custom Domain</h2>
            <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
              V2 Feature
            </span>
          </div>

          <div className="p-6">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Domain Name
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={draftData.domain}
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed font-medium"
                />
                <div className="flex items-start gap-2 text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">
                    Custom domain management is currently read-only. Full DNS
                    configuration will be available in the upcoming V2 release.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic font-medium">
                {formData.domain === "menu.kopikenangan.com"
                  ? "Not set yet"
                  : formData.domain}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
