"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/providers/ProfileProvider";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronRight,
  Edit,
  Trash2,
  UtensilsCrossed,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface MenuDetailClientProps {
  token: string;
}

interface Menu {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  isAvailable: boolean;
  isFeatured: boolean;
  imageUrl: string;
}

export default function MenuDetailClient({ token }: MenuDetailClientProps) {
  const router = useRouter();
  const params = useParams();
  const domain = params.domain as string;
  const menuId = params.id as string;
  const { currency } = useProfile();

  const [menu, setMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  useEffect(() => {
    const getStoredBranchId = (): string => {
      const pathParts = window.location.pathname.split("/");
      const dom = pathParts[1] !== "dashboard" ? pathParts[1] : "";
      const key = dom ? `active_branch_id_${dom}` : "active_branch_id";
      return localStorage.getItem(key) || "";
    };
    setActiveBranchId(getStoredBranchId());
  }, []);

  useEffect(() => {
    if (activeBranchId !== null) {
      fetchMenuDetail();
    }
  }, [menuId, activeBranchId]);

  const fetchMenuDetail = async () => {
    try {
      const headers: any = {
        Authorization: `Bearer ${token}`,
      };
      if (activeBranchId) {
        headers["X-Branch-ID"] = activeBranchId;
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/management/menus/${menuId}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        const m = data.data;
        setMenu({
          id: m.ID,
          name: m.Name,
          category: m.Category?.Name || "Uncategorized",
          price: m.Price || 0,
          description: m.Description || "",
          isAvailable: m.IsAvailable,
          isFeatured: m.IsFeatured,
          imageUrl: m.ImageURL || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/management/menus/${menuId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setShowDeleteModal(false);
        router.push(`/${domain}/owner/menu`);
      } else {
        alert("Failed to delete menu item.");
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="w-full p-12 text-center text-slate-500">
        Menu item not found.
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-sm flex flex-col gap-4 px-6 md:px-8 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-slate-500 font-medium">
          <Link
            href={`/${domain}/owner/menu`}
            className="hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Menu
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-slate-700">{menu.category}</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-slate-900 font-bold">{menu.name}</span>
        </nav>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Image Section */}
        <div className="w-full md:w-[320px] shrink-0">
          <div className="aspect-square relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            {menu.imageUrl ? (
              <Image
                src={menu.imageUrl}
                alt={menu.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <UtensilsCrossed className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-sm font-medium">No image</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {menu.name}
              </h1>
              <div className="mt-2 inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-bold tracking-widest uppercase">
                {menu.category}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  router.push(`/${domain}/owner/menu/${menuId}/edit`)
                }
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Item
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {isDeleting ? "Deleting..." : "Delete Item"}
              </button>
            </div>
          </div>

          <div>
            <div className="text-3xl font-bold text-indigo-600">
              {new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
                style: "currency",
                currency: currency,
              }).format(menu.price)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {menu.isAvailable ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Out of Stock
              </span>
            )}

            {menu.isFeatured && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full text-xs font-bold">
                <span className="w-3 h-3 text-indigo-500 text-lg leading-none mt-[1px]">
                  ★
                </span>
                Featured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Description
          </h3>
        </div>
        <div className="p-6">
          <p className="text-slate-700 leading-relaxed text-sm">
            {menu.description || "No description provided."}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Delete Menu Item
              </h3>
              <p className="text-slate-500 mb-8">
                Are you sure you want to delete{" "}
                <span className="font-bold text-slate-700">"{menu.name}"</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
