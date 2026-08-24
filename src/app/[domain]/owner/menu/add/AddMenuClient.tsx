"use client";

import Link from "next/link";
import {
  ChevronRight,
  Info,
  CloudUpload,
  Archive,
  Loader2,
  X,
} from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/providers/ProfileProvider";

export interface MenuCategory {
  ID: string;
  Name: string;
  SortOrder: number;
}

interface AddMenuClientProps {
  domain: string;
  categories: MenuCategory[];
  token: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AddMenuClient({
  domain,
  categories,
  token,
}: AddMenuClientProps) {
  const router = useRouter();
  const { currency } = useProfile();

  // Determine currency symbol
  const currencySymbol =
    currency === "IDR" ? "Rp" : currency === "USD" ? "$" : currency;

  // Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // Photo State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg(""); // Clear errors if any
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadPhotoToMinIO = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    // 1. Get Extension
    const extMatch = selectedFile.name.match(/\.[0-9a-z]+$/i);
    const extension = extMatch ? extMatch[0] : ".jpg";

    // 2. Request Presigned URL
    const presignRes = await fetch(`${API_URL}/management/media/upload-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "menu",
        extension: extension,
      }),
    });

    const presignData = await presignRes.json();
    if (!presignRes.ok) {
      throw new Error(presignData.message || "Failed to get upload URL");
    }

    const presignedUrl = presignData.data.presigned_url;
    const tempPath = presignData.data.temp_path;

    // 3. Upload File directly to MinIO using PUT
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      body: selectedFile,
      headers: {
        "Content-Type": selectedFile.type,
      },
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload image to storage");
    }

    return tempPath;
  };

  const handleSubmit = async () => {
    // 1. Validation
    if (!name.trim()) return setErrorMsg("Item Name is required");
    if (!categoryId) return setErrorMsg("Category is required");
    if (!price || isNaN(Number(price)))
      return setErrorMsg("Valid Price is required");

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 2. Optional: Upload photo if selected
      let tempImagePath = "";
      if (selectedFile) {
        const uploadedPath = await uploadPhotoToMinIO();
        if (uploadedPath) tempImagePath = uploadedPath;
      }

      // 3. Create Menu Item
      const res = await fetch(`${API_URL}/management/menus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          category_id: categoryId,
          price: Number(price),
          description: description.trim(),
          is_available: isAvailable,
          temp_image_path: tempImagePath,
          sort_order: 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create menu item");
      }

      // Success
      setSuccessMsg("Menu item created successfully! Redirecting...");
      router.refresh();

      setTimeout(() => {
        router.push(`/${domain}/owner/menu`);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
      setIsSubmitting(false); // Only re-enable if failed, on success we redirect
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center text-sm font-medium text-slate-500 gap-2">
          <UtensilsIcon className="w-4 h-4" />
          <Link
            href={`/${domain}/owner/menu`}
            className="hover:text-slate-900 transition-colors"
          >
            Menu
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900">Add New Item</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
              Add New Menu Item
            </h1>
            <p className="text-slate-500 mt-1">
              Create a new item to appear on your digital menu and POS.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${domain}/owner/menu`}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Archive className="w-4 h-4" />
              )}
              {isSubmitting ? "Saving..." : "Save Menu Item"}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center">
          <Info className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center">
          <Archive className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Info className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                General Information
              </h2>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="e.g. Cappuccino"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.ID} value={cat.ID}>
                        {cat.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-slate-700">
                    Price <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-medium sm:text-sm">
                        {currencySymbol}
                      </span>
                    </div>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="0"
                      min="0"
                      className="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-slate-700">
                    Description
                  </label>
                  <span className="text-xs text-slate-400 font-medium">
                    Optional
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="e.g. Smooth espresso with steamed milk and a light layer of foam..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors resize-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Photo & Availability */}
        <div className="space-y-6 lg:col-span-1">
          {/* Menu Photo */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
              <CloudUpload className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Menu Photo</h2>
            </div>

            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={isSubmitting}
            />

            {!previewUrl ? (
              <div
                onClick={() => !isSubmitting && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors group ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 cursor-pointer"}`}
              >
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <CloudUpload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Upload Menu Photo
                </h3>
                <p className="text-xs text-slate-500 mb-4">Click to browse</p>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  PNG, JPG up to 5MB
                </span>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={clearFile}
                      className="bg-white text-rose-600 px-4 py-2 rounded-lg font-medium text-sm shadow flex items-center gap-2 hover:bg-rose-50"
                    >
                      <X className="w-4 h-4" /> Remove Photo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
              <Archive className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Availability</h2>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Available</p>
                <p className="text-xs text-slate-500">
                  {isAvailable ? "Yes" : "No"}
                </p>
              </div>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                disabled={isSubmitting}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${isAvailable ? "bg-indigo-600" : "bg-slate-300"} disabled:opacity-50`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isAvailable ? "translate-x-5" : "translate-x-0"}`}
                ></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UtensilsIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
