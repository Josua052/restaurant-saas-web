"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Save,
  Info,
  Phone,
  Building2,
  Globe2,
  MapPin,
  Clock,
  Loader2,
  Camera,
  AlertCircle,
} from "lucide-react";

interface SettingsClientProps {
  token: string;
}

export default function SettingsClient({ token }: SettingsClientProps) {
  const router = useRouter();

  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [tempLogoPath, setTempLogoPath] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    restaurantName: "",
    phone: "",
    address: "",
    currency: "USD",
    timezone: "UTC",
    domain: "",
  });

  // Temporary state for when user is typing, before they click Save
  const [draftData, setDraftData] = useState(formData);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/management/tenant/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const result = await res.json();
        const data = result.data;
        const mappedData = {
          restaurantName: data.restaurant_name || "",
          phone: data.phone || "",
          address: data.address || "",
          currency: data.currency || "USD",
          timezone: data.timezone || "UTC",
          domain: data.custom_domain || "",
          logo_url: data.logo_url || "",
        };
        setFormData(mappedData);
        setDraftData(mappedData);
        setLogoPreview(data.logo_url || "");
      }
    } catch (error) {
      console.error("Failed to fetch store settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    setIsUploadingLogo(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const ext = file.name.substring(file.name.lastIndexOf("."));

      const resUrl = await fetch(`${API_URL}/management/media/upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: "logo", extension: ext }),
      });

      if (!resUrl.ok) throw new Error("Failed to get upload URL");
      const { data } = await resUrl.json();

      const resUpload = await fetch(data.presigned_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!resUpload.ok) throw new Error("Failed to upload image");
      setTempLogoPath(data.temp_path);
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo. Please try again.");
      // revert preview
      // @ts-ignore
      setLogoPreview(formData.logo_url);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleEdit = () => {
    setDraftData(formData); // Reset draft to current saved data
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/management/tenant/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurant_name: draftData.restaurantName,
          phone: draftData.phone,
          address: draftData.address,
          currency: draftData.currency,
          timezone: draftData.timezone,
          temp_logo_path: tempLogoPath,
        }),
      });

      if (res.ok) {
        setFormData(draftData);
        setIsEditing(false);
        setShowSuccessModal(true);
        // Refresh the server components to update global context like ProfileProvider
        router.refresh();
      } else {
        console.error("Failed to save store settings");
      }
    } catch (error) {
      console.error("Error saving store settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

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
                disabled={isSaving}
                className="px-5 py-2.5 border border-slate-300 bg-white text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
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
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-24 h-24 rounded-full border-2 border-dashed border-indigo-200 bg-indigo-50 flex items-center justify-center cursor-pointer hover:bg-indigo-100 transition-colors overflow-hidden group"
                  >
                    {logoPreview ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider text-center px-2">
                        Upload Logo
                      </span>
                    )}
                    {isUploadingLogo && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border border-slate-200 bg-white overflow-hidden p-2 flex items-center justify-center shadow-sm">
                    {logoPreview ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={logoPreview} alt="Restaurant Logo" className="w-full h-full object-cover rounded-full" />
                    ) : (
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
                    )}
                  </div>
                )}
                
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoSelect}
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                />
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
                        disabled
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        To change the restaurant name, please submit a request to the Super Admin.
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-900 font-bold text-lg">
                      {formData.restaurantName || "Not set"}
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
                      {formData.phone || "Not set"}
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
                {formData.address || "Not set"}
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
                  <option value="IDR">IDR - Indonesian Rupiah</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
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
                      <option value="UTC">UTC (Default)</option>
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="Asia/Makassar">
                        Asia/Makassar (WITA)
                      </option>
                      <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
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
                {formData.domain || "Not set yet"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Settings Saved!
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Your store profile and preferences have been updated
                successfully.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
