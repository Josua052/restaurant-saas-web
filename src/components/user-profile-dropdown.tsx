"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { User, LogOut, Settings } from "lucide-react"

interface UserProfileDropdownProps {
  profileHref: string;
  avatarSrc?: string;
  fallbackText?: string;
  restaurantName?: string;
  branchAddress?: string;
}

export default function UserProfileDropdown({ 
  profileHref, 
  avatarSrc = "https://i.pravatar.cc/150?img=32",
  fallbackText = "U",
  restaurantName = "My Restaurant",
  branchAddress = "Admin Account"
}: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const params = useParams()
  
  const domain = params?.domain as string;
  const targetLoginUrl = domain ? `/${domain}/login` : "/login";

  const handleLogout = async () => {
    try {
      setIsOpen(false);
      const path = window.location.pathname;
      // Determine scope: admin → admin, /staff/ → staff, otherwise → owner
      const scope = path.startsWith('/dashboard')
        ? 'admin'
        : path.includes('/staff')
        ? 'staff'
        : 'owner';
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scope }),
      });
      if (res.ok) {
        router.push(targetLoginUrl);
      } else {
        console.error("Logout failed on server");
        router.push(targetLoginUrl);
      }
    } catch (err) {
      console.error("Logout request failed:", err);
      router.push(targetLoginUrl);
    }
  };

  return (
    <div className="relative">
      {/* Profile Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-inner overflow-hidden">
          {avatarSrc ? (
            <img src={avatarSrc} alt={restaurantName} className="w-full h-full object-cover" />
          ) : (
            fallbackText
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <p className="text-sm font-bold text-slate-900 truncate">
                {restaurantName}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {branchAddress}
              </p>
            </div>

            <div className="p-1.5">
              <Link 
                href={profileHref}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
            </div>

            <div className="p-1.5 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
