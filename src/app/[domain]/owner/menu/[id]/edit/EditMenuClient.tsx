"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useProfile } from "@/providers/ProfileProvider";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight, UtensilsCrossed, Loader2, X } from "lucide-react";
import Image from "next/image";

interface EditMenuClientProps {
  token: string;
}

interface Category {
  ID: string;
  Name: string;
}

export default function EditMenuClient({ token }: EditMenuClientProps) {
  const router = useRouter();
  const params = useParams();
  const domain = params.domain as string;
  const menuId = params.id as string;
  const { currency } = useProfile();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    category_name: "", // For display in breadcrumb
    price: 0,
    description: "",
    isAvailable: true,
    isFeatured: true,
    imageUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
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
    const extMatch = selectedFile.name.match(/\.[0-9a-z]+$/i);
    const extension = extMatch ? extMatch[0] : ".jpg";

    const presignRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/management/media/upload-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type: "menu", extension }),
    });

    const presignData = await presignRes.json();
    if (!presignRes.ok) throw new Error(presignData.message || "Failed to get upload URL");

    const { presigned_url, temp_path } = presignData.data;

    const uploadRes = await fetch(presigned_url, {
      method: "PUT",
      body: selectedFile,
      headers: { "Content-Type": selectedFile.type },
    });

    if (!uploadRes.ok) throw new Error("Failed to upload image to storage");
    return temp_path;
  };

  useEffect(() => {
    fetchData();
  }, [menuId]);

  const fetchData = async () => {
    try {
      // 1. Fetch Categories
      const catRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/management/menus/categories`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.data || []);
      }

      // 2. Fetch Menu Detail
      const menuRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/management/menus/${menuId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        const m = menuData.data;
        setFormData({
          name: m.Name || "",
          category_id: m.CategoryID || "",
          category_name: m.Category?.Name || "Uncategorized",
          price: m.Price || 0,
          description: m.Description || "",
          isAvailable: m.IsAvailable,
          isFeatured: m.IsFeatured,
          imageUrl:
            m.ImageURL ||
            "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&q=80",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: "isAvailable" | "isFeatured") => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaveModal(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    try {
      let tempImagePath = "";
      if (selectedFile) {
        const uploadedPath = await uploadPhotoToMinIO();
        if (uploadedPath) tempImagePath = uploadedPath;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category_id: formData.category_id || null,
        is_available: formData.isAvailable,
        is_featured: formData.isFeatured,
        temp_image_path: tempImagePath,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/management/menus/${menuId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        setShowSaveModal(false);
        router.push(`/${domain}/owner/menu/${menuId}`);
      } else {
        alert("Failed to update menu item.");
        setIsSaving(false);
        setShowSaveModal(false);
      }
    } catch (error) {
      console.error("Error updating menu:", error);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <nav className="flex items-center text-sm text-slate-500 font-medium mb-1">
            <Link
              href={`/${domain}/owner/menu`}
              className="hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Menu
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-slate-700">{formData.category_name}</span>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-slate-700">{formData.name}</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Edit {formData.name}{" "}
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${domain}/owner/menu/${menuId}`)}
            className="px-4 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
          Basic Information
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Photo */}
          <div className="w-full md:w-64 shrink-0">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Item Photo
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={isSaving}
            />
            <div 
              onClick={() => !isSaving && fileInputRef.current?.click()}
              className="aspect-square relative rounded-xl border border-dashed border-slate-300 overflow-hidden bg-slate-50 group cursor-pointer hover:border-indigo-400 transition-colors"
            >
              {previewUrl ? (
                <>
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={clearFile}
                      className="bg-white text-rose-600 px-4 py-2 rounded-lg font-medium text-sm shadow flex items-center gap-2 hover:bg-rose-50"
                    >
                      <X className="w-4 h-4" /> Remove Photo
                    </button>
                  </div>
                </>
              ) : formData.imageUrl ? (
                <>
                  <Image
                    src={formData.imageUrl}
                    alt="Menu"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">
                      Change Photo
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <UtensilsCrossed className="w-8 h-8 opacity-50" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">
                      Add Photo
                    </span>
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center leading-relaxed">
              Photo will only be updated if you upload a new one. Leave
              unchanged to keep the current photo.
            </p>
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Item Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 appearance-none bg-white"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.ID} value={cat.ID}>
                    {cat.Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-medium text-sm">
                    {currency === "USD" ? "$" : currency}
                  </span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
          Description
        </h2>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            Item Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-y"
          ></textarea>
          <p className="text-xs text-slate-500 mt-2">
            Visible to customers on the menu app.
          </p>
        </div>
      </div>

      {/* Visibility & Promotion */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
          Visibility & Promotion
        </h2>

        <div className="space-y-6">
          {/* Toggle Available */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Available for order
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Turn this off to hide the item from customers when it's out of
                stock.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("isAvailable")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isAvailable ? "bg-indigo-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isAvailable ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <hr className="border-slate-100" />

          {/* Toggle Featured */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Featured / Promo
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Highlight this item in the featured/promo section of the
                customer menu.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("isFeatured")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isFeatured ? "bg-indigo-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isFeatured ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Save Changes
              </h3>
              <p className="text-slate-500 mb-8">
                Are you sure you want to save the changes you've made to{" "}
                <span className="font-bold text-slate-700">
                  "{formData.name}"
                </span>
                ?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={confirmSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Yes, Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
