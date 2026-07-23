"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Search,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Edit2,
  CheckCircle2,
  X,
} from "lucide-react";
import { 
  MenuCategory, 
  MenuItem, 
  TableResponseDTO, 
  CartItem, 
  CompletedSession 
} from "./types";
import NoteModal from "./components/NoteModal";
import OpenBillModal from "./components/OpenBillModal";
import PaymentModal from "./components/PaymentModal";
import SuccessModal from "./components/SuccessModal";

// SWR Fetcher
const fetcher = async ([url, token]: [string, string]) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || errData.message || "Failed to fetch data",
    );
  }
  const json = await res.json();
  return json.data;
};

export default function OrdersClient({
  token,
  apiUrl,
}: {
  token: string;
  apiUrl: string;
}) {
  const apiUrlV2 = apiUrl.replace("/v1", "/v2");
  
  const [activeCategory, setActiveCategory] = useState<string>("All Menu");
  const [orderType, setOrderType] = useState<"Dine-in" | "Takeaway">("Dine-in");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activeNoteItemId, setActiveNoteItemId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // Checkout Modals State
  const [showOpenBillModal, setShowOpenBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedSession, setCompletedSession] = useState<CompletedSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [customerName, setCustomerName] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [cashReceived, setCashReceived] = useState<string>("");

  // Data Fetching
  const { data: categories = [], isLoading: catLoading } = useSWR<MenuCategory[]>(
    [`${apiUrl}/management/menus/categories`, token], fetcher
  );

  const { data: menus = [], isLoading: menuLoading } = useSWR<MenuItem[]>(
    [`${apiUrl}/management/menus`, token], fetcher
  );

  const { data: tablesData = [] } = useSWR<TableResponseDTO[]>(
    [`${apiUrlV2}/management/tables?limit=100`, token], fetcher
  );

  // Filter Menus
  const filteredMenus = useMemo(() => {
    if (activeCategory === "All Menu") return menus;
    const cat = categories.find((c) => c.Name === activeCategory);
    if (!cat) return menus;
    return menus.filter((m) => m.CategoryID === cat.ID);
  }, [menus, categories, activeCategory]);

  // Unique Areas for Tables
  const uniqueAreas = useMemo(() => {
    const areas = new Map<string, string>();
    tablesData.forEach(t => {
      if (t.section && t.section.id) {
        areas.set(t.section.id, t.section.name);
      }
    });
    return Array.from(areas.entries()).map(([id, name]) => ({ id, name }));
  }, [tablesData]);

  // Filtered Tables based on selected area
  const availableTables = useMemo(() => {
    let filtered = tablesData;
    if (selectedAreaId) {
      filtered = filtered.filter(t => t.section_id === selectedAreaId);
    }
    return filtered;
  }, [tablesData, selectedAreaId]);

  // Cart Logic
  const addToCart = (menu: MenuItem) => {
    if (menu.IsAvailable === false) return;
    
    setCart((prev) => {
      const existing = prev.find((item) => item.menu_id === menu.ID && item.note === "");
      if (existing) {
        return prev.map((item) =>
          item.cart_id === existing.cart_id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      
      return [
        ...prev,
        {
          cart_id: `${menu.ID}-${Date.now()}`,
          menu_id: menu.ID,
          name: menu.Name,
          price: menu.Price,
          image_url: menu.ImageURL || "",
          quantity: 1,
          note: "",
        },
      ];
    });
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cart_id === cartId) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cart_id !== cartId));
  };

  const clearCart = () => setCart([]);

  const openNoteModal = (cartId: string, currentNote: string) => {
    setActiveNoteItemId(cartId);
    setNoteText(currentNote);
    setIsNoteModalOpen(true);
  };

  const saveNote = () => {
    if (activeNoteItemId) {
      setCart((prev) =>
        prev.map((item) =>
          item.cart_id === activeNoteItemId
            ? { ...item, note: noteText.trim() }
            : item
        )
      );
    }
    setIsNoteModalOpen(false);
  };

  // Calculations
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% PB1
  const grandTotal = subtotal + tax;

  const cashVal = parseInt(cashReceived.replace(/\D/g, "")) || 0;
  const change = Math.max(0, cashVal - grandTotal);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };



  const closeSuccessModal = () => {
    setCart([]);
    setCustomerName("");
    setSelectedAreaId("");
    setSelectedTableId("");
    setCashReceived("");
    setCompletedSession(null);
    setShowSuccessModal(false);
  };

  // Checkout Submission
  const handleCheckout = async (isDirectPayment: boolean) => {
    if (!isDirectPayment && !customerName.trim()) {
      toast.error("Nama pelanggan wajib diisi.");
      return;
    }

    if (!isDirectPayment && !selectedTableId) {
      toast.error("Meja wajib dipilih untuk Open Bill.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        order_type: orderType,
        customer_name: customerName,
        table_id: isDirectPayment ? undefined : selectedTableId,
        payment_method: isDirectPayment ? paymentMethod : undefined,
        items: cart.map(item => ({
          menu_id: item.menu_id,
          quantity: item.quantity,
          notes: item.note
        }))
      };

      const res = await fetch(`${apiUrlV2}/management/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.message || "Gagal membuat pesanan");

      setCompletedSession({
        receiptNumber: data.receipt_number || data.data?.receipt_number || "N/A",
        queueNumber: data.queue_number || data.data?.queue_number,
        orderType: data.order_type || data.data?.order_type || orderType,
        items: [...cart],
        subtotal,
        tax,
        total: grandTotal,
        paymentMethod: isDirectPayment ? paymentMethod : undefined,
        cashReceived: isDirectPayment ? cashVal : undefined,
        change: isDirectPayment ? change : undefined,
        createdAt: new Date().toISOString(),
      });

      toast.success(isDirectPayment ? "Pesanan berhasil dibayar!" : "Open Bill berhasil dibuat!");
      setShowOpenBillModal(false);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-50">
      {/* LEFT: Menu Catalog */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200">
        <div className="p-6 bg-white border-b border-slate-200 shrink-0">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Katalog Menu</h1>
          
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("All Menu")}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border ${
                activeCategory === "All Menu"
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              All Menu
            </button>
            {categories.map((cat) => (
              <button
                key={cat.ID}
                onClick={() => setActiveCategory(cat.Name)}
                className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border ${
                  activeCategory === cat.Name
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat.Name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {menuLoading || catLoading ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              Loading menu...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMenus.map((menu) => {
                const isInCart = cart.some((c) => c.menu_id === menu.ID);
                return (
                  <div
                    key={menu.ID}
                    onClick={() => addToCart(menu)}
                    className={`group relative bg-white border rounded-2xl overflow-hidden transition-all ${
                      menu.IsAvailable !== false
                        ? "border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer"
                        : "border-slate-100 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {isInCart && (
                      <div className="absolute top-3 right-3 z-10 bg-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      </div>
                    )}
                    
                    <div className="aspect-[4/3] w-full bg-slate-100 relative">
                      {menu.ImageURL ? (
                        <img
                          src={menu.ImageURL}
                          alt={menu.Name}
                          className={`w-full h-full object-cover ${
                            menu.IsAvailable === false ? "grayscale" : ""
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          No Image
                        </div>
                      )}
                      
                      {menu.IsAvailable === false && (
                        <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
                          <span className="bg-slate-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wider">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">
                        {menu.Name}
                      </h3>
                      <p className="font-bold text-indigo-600 mt-1">
                        {formatCurrency(menu.Price || 0)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart Sidebar */}
      <div className="w-full lg:w-[400px] xl:w-[450px] bg-white border-l border-slate-200 flex flex-col h-full shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Cart Header */}
        <div className="p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">Keranjang</h2>
              {totalItems > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {totalItems} item
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Kosongkan Keranjang"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Dine-in / Takeaway Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => {
                setOrderType("Dine-in");
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                orderType === "Dine-in"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Dine-in
            </button>
            <button
              onClick={() => {
                setOrderType("Takeaway");
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                orderType === "Takeaway"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Takeaway
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Belum ada pesanan</h3>
              <p className="text-sm text-slate-500">Pilih menu untuk memulai pesanan</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <div key={item.cart_id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4 relative group">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h4>
                    <p className="text-indigo-600 font-medium text-sm mt-0.5">{formatCurrency(item.price)}</p>
                    
                    <button
                      onClick={() => openNoteModal(item.cart_id, item.note)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 mt-2 transition-colors w-max"
                    >
                      <Edit2 className="w-3 h-3" />
                      {item.note ? <span className="text-slate-600 truncate max-w-[120px]">{item.note}</span> : "+ Tambah Catatan"}
                    </button>
                  </div>

                  <div className="flex flex-col justify-between items-end shrink-0">
                    <button 
                      onClick={() => removeItem(item.cart_id)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100 mt-2">
                      <button 
                        onClick={() => updateQuantity(item.cart_id, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm border border-slate-200 text-slate-600 hover:text-indigo-600 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-slate-800">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.cart_id, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-indigo-600 rounded-md shadow-sm text-white hover:bg-indigo-700 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer Summary */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-slate-500 font-medium">Subtotal</span>
            <span className="text-slate-800 font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center mb-4 text-sm">
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              Pajak (PB1 10%)
            </div>
            <span className="text-slate-800 font-semibold">{formatCurrency(tax)}</span>
          </div>
          
          <div className="border-t border-slate-100 border-dashed mb-4"></div>
          
          <div className="flex justify-between items-end mb-6">
            <span className="text-base font-bold text-slate-900">Total</span>
            <span className="text-2xl font-black text-indigo-600">{formatCurrency(grandTotal)}</span>
          </div>

          <div className="flex flex-col gap-3">
            {orderType === "Dine-in" && (
              <button 
                onClick={() => setShowOpenBillModal(true)}
                disabled={cart.length === 0}
                className="w-full py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Open Bill
              </button>
            )}
            <button 
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0}
              className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bayar Langsung
            </button>
          </div>
        </div>
      </div>

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        noteText={noteText}
        setNoteText={setNoteText}
        onSave={saveNote}
      />

      <OpenBillModal
        isOpen={showOpenBillModal}
        onClose={() => setShowOpenBillModal(false)}
        customerName={customerName}
        setCustomerName={setCustomerName}
        selectedAreaId={selectedAreaId}
        setSelectedAreaId={setSelectedAreaId}
        selectedTableId={selectedTableId}
        setSelectedTableId={setSelectedTableId}
        uniqueAreas={uniqueAreas}
        availableTables={availableTables}
        isSubmitting={isSubmitting}
        handleCheckout={() => handleCheckout(false)}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        customerName={customerName}
        setCustomerName={setCustomerName}
        subtotal={subtotal}
        tax={tax}
        grandTotal={grandTotal}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        cashReceived={cashReceived}
        setCashReceived={setCashReceived}
        isSubmitting={isSubmitting}
        handleCheckout={() => handleCheckout(true)}
        formatCurrency={formatCurrency}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={closeSuccessModal}
        session={completedSession}
      />
    </div>
  );
}
