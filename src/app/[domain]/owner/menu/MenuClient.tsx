"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Plus, X } from "lucide-react";

// Mock Data for Menu Items
const menuItems = [
  {
    id: "MK-001",
    name: "Kopi Kenangan Mantan",
    price: "$2.50",
    description: "Our signature espresso blended with creamy milk and...",
    category: "Coffee",
    status: "Available",
    image:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80",
  },
  {
    id: "MK-002",
    name: "Double Espresso",
    price: "$3.00",
    description: "A robust double shot of our house blend, perfectly...",
    category: "Coffee",
    status: "Available",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80",
  },
  {
    id: "MP-012",
    name: "Butter Croissant",
    price: "$4.50",
    description: "Classic French pastry baked fresh daily.",
    category: "Pastries",
    status: "Sold Out",
    image:
      "https://images.unsplash.com/photo-1555507036-ab1e4006aa07?w=500&q=80",
  },
  {
    id: "MN-005",
    name: "Iced Matcha Latte",
    price: "$3.50",
    description: "Premium Japanese matcha green tea blended with your...",
    category: "Non-Coffee",
    status: "Available",
    image:
      "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&q=80",
  },
];

export default function MenuClient({ domain }: { domain: string }) {
  const [isCategorySlideOpen, setIsCategorySlideOpen] = useState(false);
  const [isCategoryActive, setIsCategoryActive] = useState(true);

  const getStatusStyle = (status: string) => {
    if (status === "Available") {
      return "bg-emerald-100/90 text-emerald-800";
    }
    return "bg-rose-100/90 text-rose-800";
  };

  const getStatusDot = (status: string) => {
    if (status === "Available") return "bg-emerald-500";
    return "bg-rose-500";
  };

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
            href={`/owner/menu/add`}
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
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="relative w-full sm:w-[150px]">
          <select className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 appearance-none bg-white font-medium text-slate-700 cursor-pointer">
            <option>All</option>
            <option>Coffee</option>
            <option>Pastries</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
          >
            {/* Image & Status */}
            <div className="h-48 bg-slate-100 relative overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div
                className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-sm ${getStatusStyle(item.status)}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${getStatusDot(item.status)}`}
                ></span>
                {item.status}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-bold text-slate-900 leading-tight">
                  {item.name}
                </h3>
                <span className="font-bold text-indigo-700 shrink-0">
                  {item.price}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                {item.description}
              </p>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">
                  {item.category}
                </span>
                <span className="text-slate-400 text-xs font-medium">
                  {item.id}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <p className="text-sm text-slate-500">Showing 1 to 4 of 42 items</p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 border border-slate-200 rounded-md text-sm text-slate-400 bg-slate-50 cursor-not-allowed">
            Previous
          </button>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm font-medium">
            1
          </button>
          <button className="px-3 py-1 hover:bg-slate-50 text-slate-700 rounded-md text-sm font-medium transition-colors">
            2
          </button>
          <button className="px-3 py-1 hover:bg-slate-50 text-slate-700 rounded-md text-sm font-medium transition-colors">
            3
          </button>
          <span className="px-2 text-slate-400">...</span>
          <button className="px-3 py-1 border border-slate-300 hover:bg-slate-50 rounded-md text-sm text-slate-700 font-medium transition-colors">
            Next
          </button>
        </div>
      </div>

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
