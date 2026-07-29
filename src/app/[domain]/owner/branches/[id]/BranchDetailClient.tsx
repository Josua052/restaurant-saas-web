"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Save,
  Pencil,
} from "lucide-react";
import { fetchAuth } from "@/lib/fetchAuth";
import { toast } from "sonner";
import { Checkbox } from "@mantine/core";

interface OperatingHourRow {
  day_of_week: number;
  open_time: string;
  close_time: string;
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

export default function BranchDetailClient({
  token,
  branchId,
}: {
  token: string;
  branchId: string;
}) {
  const router = useRouter();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isHoursLoading, setIsHoursLoading] = useState(true);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    is_main: false,
  });
  const [draftData, setDraftData] = useState(formData);

  // Operating Hours Data
  const [operatingHours, setOperatingHours] = useState<OperatingHourRow[]>(
    buildFullWeek([])
  );
  const [draftHours, setDraftHours] = useState<OperatingHourRow[]>(
    buildFullWeek([])
  );

  useEffect(() => {
    fetchBranchDetails();
    fetchOperatingHours();
  }, [branchId]);

  const fetchBranchDetails = async () => {
    try {
      const res = await fetchAuth(`/api/v1/management/tenant/branches/${branchId}`);
      if (!res.ok) throw new Error("Failed to fetch branch details");
      const json = await res.json();
      if (json.data) {
        const branchData = {
          name: json.data.name || json.data.Name || "",
          phone: json.data.phone || json.data.Phone || "",
          address: json.data.address || json.data.Address || "",
          is_main: json.data.is_main || json.data.IsMain || false,
        };
        setFormData(branchData);
        setDraftData(branchData);
      }
    } catch (err: any) {
      toast.error(err.message || "Could not load branch details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOperatingHours = async () => {
    try {
      const res = await fetchAuth(`/api/v1/management/operating-hours`, {
        headers: {
          "X-Branch-ID": branchId, // Explicitly pass branch ID
        },
      });
      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
        const fullWeek = buildFullWeek(data);
        setOperatingHours(fullWeek);
        setDraftHours(fullWeek);
      }
    } catch (error) {
      console.error("Failed to load operating hours:", error);
    } finally {
      setIsHoursLoading(false);
    }
  };

  const updateDraftHour = (
    dayIndex: number,
    field: keyof OperatingHourRow,
    value: any
  ) => {
    setDraftHours((prev) =>
      prev.map((row) =>
        row.day_of_week === dayIndex ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save Branch Info
      const resBranch = await fetchAuth(
        `/api/v1/management/tenant/branches/${branchId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draftData),
        }
      );
      if (!resBranch.ok) {
        const errData = await resBranch.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update branch info");
      }

      // 2. Save Operating Hours
      const resHours = await fetchAuth(`/api/v1/management/operating-hours`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Branch-ID": branchId,
        },
        body: JSON.stringify(draftHours),
      });
      if (!resHours.ok) {
        const errData = await resHours.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update operating hours");
      }

      setFormData(draftData);
      setOperatingHours(draftHours);
      setIsEditing(false);
      toast.success("Branch settings saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftData(formData);
    setDraftHours(operatingHours);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 mx-auto min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {formData.name}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Branch Settings and Operating Hours
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50"
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
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
            >
              <Pencil className="w-4 h-4" />
              Edit Settings
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Branch Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Branch Information
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Branch Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={draftData.name}
                  onChange={(e) => setDraftData({ ...draftData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors text-sm"
                />
              ) : (
                <p className="text-slate-900 font-bold text-base">{formData.name}</p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={draftData.phone}
                    onChange={(e) => setDraftData({ ...draftData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
              ) : (
                <p className="text-slate-700 font-medium text-sm">{formData.phone || "Not set"}</p>
              )}
            </div>

            {isEditing && (
              <div className="col-span-full">
                <Checkbox
                  label="Set as Main Branch"
                  description="Other branches will automatically be demoted if this is checked."
                  checked={draftData.is_main}
                  onChange={(event) =>
                    setDraftData({ ...draftData, is_main: event.currentTarget.checked })
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Location Details */}
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
                onChange={(e) => setDraftData({ ...draftData, address: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors resize-none leading-relaxed text-sm"
              />
            ) : (
              <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-line text-sm">
                {formData.address || "Not set"}
              </p>
            )}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Operating Hours
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Set branch opening and closing times for each day.
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
                      <th className="pb-3 text-center font-bold w-24">Closed</th>
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
                        <td className="py-3 text-center">
                          {isEditing ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateDraftHour(row.day_of_week, "is_closed", !row.is_closed)
                              }
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                                row.is_closed ? "bg-red-400" : "bg-emerald-500"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                  row.is_closed ? "translate-x-1" : "translate-x-6"
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
                        <td className="py-3 pl-4 pr-4">
                          {isEditing ? (
                            <input
                              type="time"
                              value={row.open_time}
                              disabled={row.is_closed}
                              onChange={(e) =>
                                updateDraftHour(row.day_of_week, "open_time", e.target.value)
                              }
                              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed w-32"
                            />
                          ) : (
                            <span
                              className={
                                row.is_closed ? "text-slate-400 italic" : "text-slate-700 font-medium"
                              }
                            >
                              {row.is_closed ? "—" : row.open_time}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pl-4">
                          {isEditing ? (
                            <input
                              type="time"
                              value={row.close_time}
                              disabled={row.is_closed}
                              onChange={(e) =>
                                updateDraftHour(row.day_of_week, "close_time", e.target.value)
                              }
                              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed w-32"
                            />
                          ) : (
                            <span
                              className={
                                row.is_closed ? "text-slate-400 italic" : "text-slate-700 font-medium"
                              }
                            >
                              {row.is_closed ? "—" : row.close_time}
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
      </div>
    </div>
  );
}
