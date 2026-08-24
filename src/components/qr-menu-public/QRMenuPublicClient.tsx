"use client";

import React, { useState, useEffect } from "react";
import SplashView from "./SplashView";
import MenuListView from "./MenuListView";
import CheckoutView from "./CheckoutView";
import OrderStatusView from "./OrderStatusView";
import { v4 as uuidv4 } from "uuid";

export interface CartItem {
  cartItemId: string; // Unique ID for this specific order variant
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  imageUrl?: string;
}

interface QRMenuPublicClientProps {
  apiUrl: string;
  tenantInfo: any;
  tableNumber: string;
  tableId: string;
}

export default function QRMenuPublicClient({
  apiUrl,
  tenantInfo,
  tableNumber,
  tableId,
}: QRMenuPublicClientProps) {
  const [view, setView] = useState<"splash" | "menu" | "checkout" | "status">("splash");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  useEffect(() => {
    const savedOrderId = localStorage.getItem(`activeOrderId_${tableId}`);
    if (savedOrderId) {
      fetch(`${apiUrl}/public/orders/${savedOrderId}?branch_id=${tenantInfo.branch_id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            // Check if order is still active (status == 1)
            if (data.data.status === 1) {
              setCurrentOrder(data.data);
              setView("status");
            } else {
              localStorage.removeItem(`activeOrderId_${tableId}`);
            }
          } else {
            localStorage.removeItem(`activeOrderId_${tableId}`);
          }
        })
        .catch((err) => console.error("Failed to restore order:", err));
    }
  }, [apiUrl, tableId, tenantInfo.branch_id]);

  const addToCart = (item: Omit<CartItem, 'cartItemId'>) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (p) => p.menuId === item.menuId && p.notes === item.notes
      );
      if (existingIdx >= 0) {
        const newCart = [...prev];
        newCart[existingIdx].quantity += item.quantity;
        return newCart;
      }
      return [...prev, { ...item, cartItemId: Date.now().toString() + Math.random().toString(36).substr(2, 5) }];
    });
  };

  const updateCartItem = (cartItemId: string, quantity: number, notes: string) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.cartItemId === cartItemId);
      if (idx === -1) return prev;
      
      const newCart = [...prev];
      if (quantity <= 0) {
        newCart.splice(idx, 1);
      } else {
        newCart[idx] = { ...newCart[idx], quantity, notes };
      }
      return newCart;
    });
  };

  const removeCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter(p => p.cartItemId !== cartItemId));
  };

  const handleCheckoutConfirm = async (customerName: string, paymentMethod: string) => {
    setIsSubmitting(true);
    try {
      const payload = {
        idempotency_key: uuidv4(),
        tenant_id: tenantInfo.tenant_id,
        branch_id: tenantInfo.branch_id,
        table_id: tableId,
        customer_name: customerName,
        items: cart.map(item => ({
          menu_id: item.menuId,
          quantity: item.quantity,
          notes: item.notes || ""
        }))
      };

      const res = await fetch(`${apiUrl}/public/orders/qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentOrder(data.data);
        localStorage.setItem(`activeOrderId_${tableId}`, data.data.id);
        setCart([]); // Kosongkan keranjang
        setView("status");
      } else {
        alert(data.message || "Terjadi kesalahan saat membuat pesanan.");
      }
    } catch (error) {
      console.error(error);
      alert("Gagal terhubung ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: tenantInfo?.currency || "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <main className="max-w-[500px] w-full mx-auto bg-slate-50 min-h-screen relative sm:shadow-2xl sm:border-x sm:border-slate-200 flex flex-col font-sans">
      {view === "splash" && (
        <SplashView
          tenantInfo={tenantInfo}
          tableNumber={tableNumber}
          onStart={() => setView("menu")}
        />
      )}

      {view === "menu" && (
        <MenuListView
          apiUrl={apiUrl}
          tenantInfo={tenantInfo}
          tableNumber={tableNumber}
          tableId={tableId}
          cart={cart}
          cartItemCount={cartItemCount}
          cartTotal={cartTotal}
          onAddToCart={addToCart}
          onUpdateCartItem={updateCartItem}
          onRemoveCartItem={removeCartItem}
          onNavigateCheckout={() => setView("checkout")}
          onNavigateStatus={() => setView("status")}
          hasActiveOrder={!!currentOrder}
        />
      )}

      {view === "checkout" && (
        <CheckoutView
          tenantInfo={tenantInfo}
          tableNumber={tableNumber}
          cart={cart}
          cartTotal={cartTotal}
          onBack={() => setView("menu")}
          onConfirm={handleCheckoutConfirm}
          isSubmitting={isSubmitting}
        />
      )}

      {view === "status" && (
        <OrderStatusView
          tenantInfo={tenantInfo}
          order={currentOrder}
          onNewOrder={() => setView("menu")}
          formatPrice={formatPrice}
        />
      )}
    </main>
  );
}
