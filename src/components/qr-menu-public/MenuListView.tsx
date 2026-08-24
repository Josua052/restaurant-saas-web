import React, { useEffect, useState, useMemo } from "react";
import { Utensils, Search, Plus, ShoppingCart, Info, Check } from "lucide-react";
import Image from "next/image";
import { CartItem } from "./QRMenuPublicClient";
import MenuDetailModal from "./MenuDetailModal";
import useSWR from "swr";
import { useDebounce } from "use-debounce";

interface MenuListViewProps {
  apiUrl: string;
  tenantInfo: any;
  tableNumber: string;
  tableId: string;
  cart: CartItem[];
  cartItemCount: number;
  cartTotal: number;
  onAddToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  onUpdateCartItem: (cartItemId: string, quantity: number, notes: string) => void;
  onRemoveCartItem: (cartItemId: string) => void;
  onNavigateCheckout: () => void;
  onNavigateStatus: () => void;
  hasActiveOrder: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MenuListView({
  apiUrl,
  tenantInfo,
  tableNumber,
  tableId,
  cart,
  cartItemCount,
  cartTotal,
  onAddToCart,
  onUpdateCartItem,
  onRemoveCartItem,
  onNavigateCheckout,
  onNavigateStatus,
  hasActiveOrder
}: MenuListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  
  const [selectedMenu, setSelectedMenu] = useState<any | null>(null);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  // Fetch menus
  const { data, error, isLoading } = useSWR(
    `${apiUrl}/public/menus?tenant_id=${tenantInfo.tenant_id}&branch_id=${tenantInfo.branch_id}`,
    fetcher
  );

  const menus = data?.data || [];

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("Semua");
    menus.forEach((m: any) => {
      if (m.category?.name) {
        cats.add(m.category.name);
      }
    });
    return Array.from(cats);
  }, [menus]);

  // Filter menus
  const filteredMenus = useMemo(() => {
    return menus.filter((m: any) => {
      const menuName = m?.name || "";
      const matchSearch = menuName.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchCat = activeCategory === "Semua" || m?.category?.name === activeCategory;
      return matchSearch && matchCat;
    });
  }, [menus, debouncedSearch, activeCategory]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: tenantInfo.currency || "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-24">
      {/* Sticky Top Section (Header + Search + Categories) */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 pb-2 shadow-sm">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-900 px-3 py-1.5 rounded-full border border-indigo-100">
            <Utensils className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-xs">{tableNumber || "Meja"}</span>
          </div>
          <div className="font-bold text-lg text-indigo-700 tracking-tight font-heading">
            {tenantInfo.restaurant_name}
          </div>
        </div>

        <div className="px-4 pb-2 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari makanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>

          {/* Categories (Horizontal Scroll) */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-indigo-700 text-white shadow-sm shadow-indigo-200"
                    : "bg-indigo-50 text-indigo-900 hover:bg-indigo-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pt-4">

        {/* Menu List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-3 rounded-2xl flex gap-4 animate-pulse">
                <div className="w-24 h-24 bg-slate-200 rounded-xl"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm">Tidak ada menu yang sesuai.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMenus.map((menu: any) => {
              const isAvailable = menu.is_available ?? menu.IsAvailable ?? true;
              const id = menu.id || menu.ID;
              const name = menu.name || menu.Name;
              const imageUrl = menu.image_url || menu.ImageURL;
              const price = menu.price ?? menu.Price;
              const description = menu.description || menu.Description || "Hidangan lezat spesial untuk Anda.";
              
              return (
                <div
                  key={id}
                  onClick={() => isAvailable && setSelectedMenu(menu)}
                  className={`bg-white border border-slate-100 p-3 rounded-2xl flex gap-3 shadow-sm transition-all ${
                    isAvailable ? "cursor-pointer hover:border-indigo-200 hover:shadow-md" : "opacity-75 relative overflow-hidden"
                  }`}
                >
                  {/* Image */}
                  <div className="w-24 h-24 rounded-xl bg-slate-100 flex-shrink-0 relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                    
                    {/* Habis Overlay */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Habis
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <h3 className={`font-bold text-sm ${!isAvailable ? 'text-slate-500' : 'text-slate-900'}`}>
                        {name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className={`font-semibold text-sm ${!isAvailable ? 'text-slate-400' : 'text-indigo-700'}`}>
                        {formatPrice(price)}
                      </span>
                      
                      {/* Add Button / Qty Control */}
                      <div className="relative">
                        {isAvailable && (() => {
                          const menuId = menu.id || menu.ID;
                          const cartItemsForMenu = cart.filter(c => c.menuId === menuId);
                          const totalQty = cartItemsForMenu.reduce((sum, item) => sum + item.quantity, 0);

                          if (totalQty > 0) {
                            return (
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedMenu(menu); }}
                                className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-full px-2 py-1 text-indigo-700 hover:bg-indigo-100 transition-colors"
                              >
                                <span className="w-5 h-5 flex items-center justify-center font-bold text-lg leading-none rounded-full shrink-0">-</span>
                                <span className="font-semibold text-sm w-3 text-center">{totalQty}</span>
                                <span className="w-5 h-5 flex items-center justify-center font-bold text-lg leading-none rounded-full shrink-0">+</span>
                              </button>
                            );
                          }

                          return (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedMenu(menu); }}
                              className="w-8 h-8 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Summary */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[500px] px-4 z-30">
          <div 
            onClick={onNavigateCheckout}
            className="bg-indigo-700 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-indigo-200/50 cursor-pointer hover:bg-indigo-800 transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-xs text-indigo-200 font-medium">{cartItemCount} item</span>
              <span className="font-bold">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-sm relative">
              Lihat Keranjang
              <div className="relative">
                <ShoppingCart className={`w-4 h-4 ${isCartBouncing ? "animate-bounce" : ""}`} />
                <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center ${isCartBouncing ? 'animate-bounce' : ''}`}>
                  {cartItemCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] bg-white border-t border-slate-100 flex justify-around py-3 z-20 pb-safe">
        <button className="flex flex-col items-center gap-1 text-indigo-700">
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Menu</span>
        </button>
        <button 
          onClick={hasActiveOrder ? onNavigateStatus : undefined}
          className={`flex flex-col items-center gap-1 transition-colors relative ${hasActiveOrder ? 'text-indigo-700 hover:text-indigo-800 cursor-pointer' : 'text-slate-400 hover:text-slate-600 cursor-default'}`}
        >
          <Check className="w-5 h-5" />
          <span className="text-[10px] font-medium">Pesanan</span>
          {hasActiveOrder && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          )}
        </button>
      </div>

      {/* Detail Modal */}
      {selectedMenu && (
        <MenuDetailModal
          menu={selectedMenu}
          cartItems={cart.filter(c => c.menuId === (selectedMenu.id || selectedMenu.ID))}
          formatPrice={formatPrice}
          onClose={() => setSelectedMenu(null)}
          onAdd={(qty, notes) => {
            onAddToCart({
              menuId: selectedMenu.id || selectedMenu.ID,
              name: selectedMenu.name || selectedMenu.Name,
              price: selectedMenu.price ?? selectedMenu.Price ?? 0,
              quantity: qty,
              notes: notes,
              imageUrl: selectedMenu.image_url || selectedMenu.ImageURL,
            });
            setIsCartBouncing(true);
            setTimeout(() => setIsCartBouncing(false), 1000);
            setSelectedMenu(null);
          }}
          onUpdateCartItem={onUpdateCartItem}
          onRemoveCartItem={onRemoveCartItem}
        />
      )}
    </div>
  );
}
