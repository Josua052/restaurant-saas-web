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
  Percent,
} from "lucide-react";

interface SettingsClientProps {
  token: string;
}

interface OperatingHourRow {
  day_of_week: number; // 0=Sun, 1=Mon â€¦ 6=Sat
  open_time: string; // "HH:MM"
  close_time: string; // "HH:MM"
  is_closed: boolean;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Build a full 7-day skeleton, merging data from API */
function buildFullWeek(apiData: OperatingHourRow[]): OperatingHourRow[] {
  return Array.from({ length: 7 }, (_, i) => {
    const found = apiData.find((d) => d.day_of_week === i);
    return found
      ? { ...found }
      : {
          day_of_week: i,
          open_time: "09:00",
          close_time: "22:00",
          is_closed: i === 0,
        };
  });
}

//
// Component
//

export default function SettingsClient({ token }: SettingsClientProps) {
  const router = useRouter();

  //  UI State
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [tempLogoPath, setTempLogoPath] = useState("");

  //  Store Settings State
  const [formData, setFormData] = useState({
    restaurantName: "",
    phone: "",
    address: "",
    currency: "USD",
    timezone: "UTC",
    domain: "",
    logo_url: "",
    taxRate: 0,
  });
  const [draftData, setDraftData] = useState(formData);

  //  Operating Hours State
  const [operatingHours, setOperatingHours] = useState<OperatingHourRow[]>(
    buildFullWeek([]),
  );
  const [draftHours, setDraftHours] = useState<OperatingHourRow[]>(
    buildFullWeek([]),
  );
  const [isHoursLoading, setIsHoursLoading] = useState(true);

  

  useEffect(() => {
    fetchSettings();
    fetchOperatingHours();
  }, []);

  const fetchSettings = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/management/tenant/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        const data = result.data;
        const mapped = {
          restaurantName: data.restaurant_name || "",
          phone: data.phone || "",
          address: data.address || "",
          currency: data.currency || "USD",
          timezone: data.timezone || "UTC",
          domain: data.custom_domain || "",
          logo_url: data.logo_url || "",
          taxRate: typeof data.tax_rate === "number" ? data.tax_rate : 0,
        };
        setFormData(mapped);
        setDraftData(mapped);
        setLogoPreview(data.logo_url || "");
      }
    } catch (err) {
      console.error("Failed to fetch store settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOperatingHours = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/management/operating-hours`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        const filled = buildFullWeek(result.data || []);
        setOperatingHours(filled);
        setDraftHours(filled);
      }
    } catch (err) {
      console.error("Failed to fetch operating hours:", err);
    } finally {
      setIsHoursLoading(false);
    }
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoPreview(URL.createObjectURL(file));
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
    } catch (err) {
      console.error("Error uploading logo:", err);
      alert("Failed to upload logo. Please try again.");
      setLogoPreview(formData.logo_url);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleEdit = () => {
    setDraftData(formData);
    setDraftHours(operatingHours.map((h) => ({ ...h })));
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  /** Save store settings AND operating hours atomically */
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      // 1. PUT store settings (includes tax_rate)
      const resSettings = await fetch(`${API_URL}/management/tenant/settings`, {
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
          tax_rate: draftData.taxRate,
          temp_logo_path: tempLogoPath,
        }),
      });
      if (!resSettings.ok) throw new Error("Failed to save store settings");

      // 2. PUT operating hours (backend requires exactly 7 rows)
      const resHours = await fetch(`${API_URL}/management/operating-hours`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          draftHours.map((h) => ({
            day_of_week: h.day_of_week,
            open_time: h.is_closed ? "00:00" : h.open_time,
            close_time: h.is_closed ? "00:00" : h.close_time,
            is_closed: h.is_closed,
            time_slots: [],
          })),
        ),
      });
      if (!resHours.ok) throw new Error("Failed to save operating hours");

      // Commit drafts â†’ stable state
      setFormData(draftData);
      setOperatingHours(draftHours.map((h) => ({ ...h })));
      setIsEditing(false);
      setShowSuccessModal(true);
      router.refresh();
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateDraftHour = (
    dayIndex: number,
    field: keyof OperatingHourRow,
    value: string | boolean,
  ) => {
    setDraftHours((prev) =>
      prev.map((h) =>
        h.day_of_week === dayIndex ? { ...h, [field]: value } : h,
      ),
    );
  };

  //
  // Render
  //

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="w-full space-y-8">
      {/*  Header  */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
            Store Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your restaurant&apos;s profile and regional preferences.
          </p>
        </div>

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

      {/* Save Error Banner */}
      {saveError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {saveError}
        </div>
      )}

      <div className="space-y-6">
        {/*  Section 1: Basic Information  */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Basic Information
            </h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-8">
              {/* Logo */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                {isEditing ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-24 h-24 rounded-full border-2 border-dashed border-indigo-200 bg-indigo-50 flex items-center justify-center cursor-pointer hover:bg-indigo-100 transition-colors overflow-hidden group"
                  >
                    {logoPreview ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="w-full h-full object-cover"
                        />
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
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoPreview}
                        alt="Restaurant Logo"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="text-slate-300">
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
                        To change the restaurant name, please submit a request
                        to the Super Admin.
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

        {/*  Section 2: Location Details  */}
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

        {/*  Section 3: Regional Settings + Tax Rate  */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-indigo-600" />
              Regional Settings
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Currency */}
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

            {/* Timezone */}
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

            {/* Tax Rate */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Tax Rate
              </label>
              {isEditing ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="settings-tax-rate"
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={draftData.taxRate}
                      onChange={(e) =>
                        setDraftData({
                          ...draftData,
                          taxRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-bold text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    Applied automatically to all orders.
                  </p>
                </>
              ) : (
                <p className="text-slate-700 font-medium">
                  {formData.taxRate > 0 ? `${formData.taxRate}%` : "Not set"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/*  Section 4: Operating Hours  */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Operating Hours
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Set your branch opening and closing times for each day of the
              week.
            </p>
          </div>

          <div className="p-6">
            {isHoursLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                      <th className="pb-3 text-left font-bold w-32">Day</th>
                      <th className="pb-3 text-center font-bold w-24">
                        Closed
                      </th>
                      <th className="pb-3 text-left font-bold pl-4">Open</th>
                      <th className="pb-3 text-left font-bold pl-4">Close</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(isEditing ? draftHours : operatingHours).map((row) => (
                      <tr key={row.day_of_week}>
                        <td className="py-3 pr-4">
                          <span className="font-semibold text-slate-700">
                            {DAY_NAMES[row.day_of_week]}
                          </span>
                        </td>

                        {/* Closed Toggle */}
                        <td className="py-3 text-center">
                          {isEditing ? (
                            <button
                              type="button"
                              id={`toggle-closed-day-${row.day_of_week}`}
                              onClick={() =>
                                updateDraftHour(
                                  row.day_of_week,
                                  "is_closed",
                                  !row.is_closed,
                                )
                              }
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                                row.is_closed ? "bg-red-400" : "bg-emerald-500"
                              }`}
                              aria-label={`Toggle ${DAY_NAMES[row.day_of_week]} closed`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                  row.is_closed
                                    ? "translate-x-1"
                                    : "translate-x-6"
                                }`}
                              />
                            </button>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                row.is_closed
                                  ? "bg-red-100 text-red-600"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {row.is_closed ? "Closed" : "Open"}
                            </span>
                          )}
                        </td>

                        {/* Open Time */}
                        <td className="py-3 pl-4 pr-4">
                          {isEditing ? (
                            <input
                              type="time"
                              value={row.open_time}
                              disabled={row.is_closed}
                              onChange={(e) =>
                                updateDraftHour(
                                  row.day_of_week,
                                  "open_time",
                                  e.target.value,
                                )
                              }
                              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed w-32"
                            />
                          ) : (
                            <span
                              className={
                                row.is_closed
                                  ? "text-slate-400 italic"
                                  : "text-slate-700 font-medium"
                              }
                            >
                              {row.is_closed ? "â€”" : row.open_time}
                            </span>
                          )}
                        </td>

                        {/* Close Time */}
                        <td className="py-3 pl-4">
                          {isEditing ? (
                            <input
                              type="time"
                              value={row.close_time}
                              disabled={row.is_closed}
                              onChange={(e) =>
                                updateDraftHour(
                                  row.day_of_week,
                                  "close_time",
                                  e.target.value,
                                )
                              }
                              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed w-32"
                            />
                          ) : (
                            <span
                              className={
                                row.is_closed
                                  ? "text-slate-400 italic"
                                  : "text-slate-700 font-medium"
                              }
                            >
                              {row.is_closed ? "â€”" : row.close_time}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/*  Section 5: Custom Domain  */}
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

      {/*  Success Modal  */}
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
