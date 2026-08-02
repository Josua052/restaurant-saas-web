"use client";

import React, { useState } from "react";
import SplashView from "./SplashView";
import MenuListView from "./MenuListView";

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
  const [view, setView] = useState<"splash" | "menu">("splash");
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'cartItemId'>) => {
    setCart((prev) => {
      // If same item and notes, just increment quantity
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

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <main className="max-w-[500px] w-full mx-auto bg-slate-50 min-h-screen relative sm:shadow-2xl sm:border-x sm:border-slate-200 flex flex-col font-sans">
      {view === "splash" ? (
        <SplashView
          tenantInfo={tenantInfo}
          tableNumber={tableNumber}
          onStart={() => setView("menu")}
        />
      ) : (
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
        />
      )}
    </main>
  );
}
