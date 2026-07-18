"use client";

import { useState } from "react";

// Mockup Data
const MOCK_CATEGORIES = ["All", "Coffee", "Non-Coffee", "Pastries", "Snacks"];

const MOCK_MENU_ITEMS = [
  {
    id: "1",
    category: "Coffee",
    name: "Kopi Kenangan Mantan",
    price: 2.5,
    description: "Our signature blend of premium espresso, palm sugar, and fresh milk.",
    image: "https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
  },
  {
    id: "2",
    category: "Pastries",
    name: "Croissant Chocolate",
    price: 3.0,
    description: "Buttery, flaky pastry filled with rich dark chocolate. Baked fresh daily.",
    image: "https://images.unsplash.com/photo-1549903072-7e6e0d234247?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
  },
  {
    id: "3",
    category: "Coffee",
    name: "Avocado Coffee",
    price: 3.5,
    description: "Creamy avocado blended with premium espresso and a touch of sweetness.",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=600&auto=format&fit=crop",
    isAvailable: false,
  },
  {
    id: "4",
    category: "Non-Coffee",
    name: "Matcha Espresso",
    price: 3.2,
    description: "A unique fusion of earthy Japanese matcha and rich signature espresso.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop",
    isAvailable: true,
  },
];

export default function StaffMenuPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  // Filter items based on selected category
  const filteredItems = MOCK_MENU_ITEMS.filter(
    (item) => activeCategory === "All" || item.category === activeCategory
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          Menu
        </h1>
        <p className="text-slate-500 mt-1">
          Browse available items and pricing.
        </p>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 pt-2">
        {MOCK_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === category
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all"
          >
            {/* Image Area */}
            <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              <img
                src={item.image}
                alt={item.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  item.isAvailable ? "group-hover:scale-105" : "opacity-70 grayscale-[30%]"
                }`}
              />
              
              {/* Status Badge */}
              <div
                className={`absolute top-3 right-3 px-2.5 py-1 rounded flex items-center gap-1.5 backdrop-blur-md shadow-sm text-[10px] font-bold tracking-wider uppercase ${
                  item.isAvailable
                    ? "bg-white/90 text-emerald-700"
                    : "bg-white/90 text-rose-700"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    item.isAvailable ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                ></span>
                {item.isAvailable ? "Available" : "Sold Out"}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-bold text-slate-900 leading-tight">
                  {item.name}
                </h3>
                <span className="font-bold text-slate-900 shrink-0">
                  ${item.price.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        ))}
        
        {filteredItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No items found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
