"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, Plus, X, UtensilsCrossed } from "lucide-react";

export interface MenuCategory {
  ID: string;
  Name: string;
  SortOrder: number;
}

export interface MenuItem {
  ID: string;
  CategoryID: string | null;
  Name: string;
  Description: string;
  Price: number;
  ImageURL: string;
  IsAvailable: boolean;
  IsFeatured: boolean;
}

interface MenuClientProps {
  domain: string;
  menus: MenuItem[];
  categories: MenuCategory[];
}

export default function MenuClient({ domain, menus, categories }: MenuClientProps) {
  const [isCategorySlideOpen, setIsCategorySlideOpen] = useState(false);
  const [isCategoryActive, setIsCategoryActive] = useState(true);
  
  // State for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("All");

  const getStatusStyle = (isAvailable: boolean) => {
    if (isAvailable) {
      return "bg-emerald-100/90 text-emerald-800";
    }
    return "bg-rose-100/90 text-rose-800";
  };

  const getStatusDot = (isAvailable: boolean) => {
    if (isAvailable) return "bg-emerald-500";
    return "bg-rose-500";
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((c) => c.ID === categoryId);
    return category ? category.Name : "Uncategorized";
  };

  // Filter items based on search and selected category
  const filteredMenus = useMemo(() => {
    return menus.filter((item) => {
      const matchesSearch = item.Name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.Description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryId === "All" || item.CategoryID === selectedCategoryId;
      return matchesSearch && matchesCategory;
    });
  }, [menus, searchQuery, selectedCategoryId]);

  return (
    <div className="w-full space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
            Menu
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your menu items and categories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCategorySlideOpen(true)}
            className="bg-white border border-slate-300 text-indigo-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
          <Link
            href={`/${domain}/owner/menu/add`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </Link>
        </div>
      </div>

      {/* Toolbar (Search & Filter) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="relative w-full sm:w-[200px]">
          <select 
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 appearance-none bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.ID} value={cat.ID}>{cat.Name}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Menu Cards Grid or Empty State */}
      {menus.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <UtensilsCrossed className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            No menu items found
          </h3>
          <p className="text-slate-500 max-w-md mb-8">
            Your menu is currently empty. Get started by adding your first delicious category and item.
          </p>
          <div className="flex gap-4">
             <button
              onClick={() => setIsCategorySlideOpen(true)}
              className="bg-white border border-slate-300 text-indigo-700 hover:bg-slate-50 px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
            <Link
              href={`/${domain}/owner/menu/add`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Item
            </Link>
          </div>
        </div>
      ) : filteredMenus.length === 0 ? (
        <div className="py-20 text-center">
           <p className="text-slate-500">No items match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMenus.map((item) => (
            <div
              key={item.ID}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
            >
              {/* Image & Status */}
              <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {item.ImageURL ? (
                  <img
                    src={item.ImageURL}
                    alt={item.Name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <UtensilsCrossed className="w-12 h-12 text-slate-300" />
                )}
                <div
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-sm ${getStatusStyle(item.IsAvailable)}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${getStatusDot(item.IsAvailable)}`}
                  ></span>
                  {item.IsAvailable ? "Available" : "Sold Out"}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 leading-tight">
                    {item.Name}
                  </h3>
                  <span className="font-bold text-indigo-700 shrink-0">
                    ${item.Price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {item.Description || "No description provided."}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">
                    {getCategoryName(item.CategoryID)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination (Simplified visually for now until connected to real pagination state) */}
      {menus.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Showing {filteredMenus.length} of {menus.length} total items
          </p>
        </div>
      )}

      {/* Add Category Slide-over Panel */}
      {isCategorySlideOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Dark Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCategorySlideOpen(false)}
          ></div>

          {/* Slide Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Panel Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Add New Category
              </h2>
              <button
                onClick={() => setIsCategorySlideOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Signature Coffee"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Active Status
                  </p>
                  <p className="text-xs text-slate-500">
                    Available for ordering
                  </p>
                </div>
                {/* Custom Toggle Switch */}
                <button
                  onClick={() => setIsCategoryActive(!isCategoryActive)}
                  className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${isCategoryActive ? "bg-indigo-600" : "bg-slate-300"}`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isCategoryActive ? "translate-x-5" : "translate-x-0"}`}
                  ></div>
                </button>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsCategorySlideOpen(false)}
                className="px-5 py-2.5 border border-slate-300 bg-white text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsCategorySlideOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
