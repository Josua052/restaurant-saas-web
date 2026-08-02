"use client";

import React, { useState } from "react";
import SplashView from "./SplashView";
import MenuListView from "./MenuListView";

export interface CartItem {
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

  const addToCart = (item: CartItem) => {
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
      return [...prev, item];
    });
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
          cartItemCount={cartItemCount}
          cartTotal={cartTotal}
          onAddToCart={addToCart}
        />
      )}
    </main>
  );
}
