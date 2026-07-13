"use client"

import { useState } from "react"
import Link from "next/link"
import { User, LogOut } from "lucide-react"

interface UserProfileDropdownProps {
  profileHref: string;
  avatarSrc?: string;
  fallbackText?: string;
}

export default function UserProfileDropdown({ 
  profileHref, 
  avatarSrc = "https://i.pravatar.cc/150?img=32",
  fallbackText = "U"
}: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative ml-2">
      {/* Avatar Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-indigo-100 border border-slate-300 overflow-hidden hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all cursor-pointer focus:outline-none flex items-center justify-center text-indigo-700 font-medium text-xs"
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt="User avatar" className="w-full h-full object-cover" />
        ) : (
          fallbackText
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Invisible Overlay to close when clicking outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
            <Link 
              href={profileHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            
            <div className="h-px bg-slate-100 my-1"></div>
            
            <button 
              onClick={() => {
                setIsOpen(false);
                alert("Logging out...");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  )
}
