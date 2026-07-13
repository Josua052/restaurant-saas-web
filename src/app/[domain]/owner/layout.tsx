import { ReactNode } from "react"
import Link from "next/link"
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Utensils, 
  Layers, 
  Armchair, 
  Users, 
  Settings, 
  LogOut,
  Star,
  Bell,
  Grip,
  Menu
} from "lucide-react"

export default function OwnerLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { domain: string }
}) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex w-[280px] bg-white border-r border-slate-200 flex-col shrink-0">
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 gap-3">
          <div className="w-10 h-10 bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-xl">
            K
          </div>
          <div>
            <h2 className="font-bold text-indigo-700 text-lg leading-tight">Kopi Kenangan</h2>
            <p className="text-xs text-slate-500 font-medium">Jakarta Central Branch</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
          <Link href={`/owner`} className="flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-sm shadow-indigo-200">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <CalendarCheck className="w-5 h-5 text-slate-500" />
            Reservations
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Utensils className="w-5 h-5 text-slate-500" />
            Menu
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Layers className="w-5 h-5 text-slate-500" />
            Menu & Category Builder
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Armchair className="w-5 h-5 text-slate-500" />
            Tables
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Users className="w-5 h-5 text-slate-500" />
            Employees
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5 text-slate-500" />
            Settings
          </Link>
        </nav>

        {/* Bottom Nav */}
        <div className="p-4 border-t border-slate-100 flex flex-col gap-1.5 mt-auto">
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5 text-slate-500" />
            Settings
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between md:justify-end px-4 md:px-8 shrink-0">
          {/* Mobile Hamburger (Visible only on mobile) */}
          <button className="md:hidden p-2 text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-indigo-100/80 text-indigo-700 rounded-full font-bold text-xs tracking-wide">
              <Star className="w-3.5 h-3.5 fill-indigo-700" />
              OWNER
            </div>
          <button className="text-slate-500 hover:text-slate-700 transition-colors relative">
            <Bell className="w-5 h-5" />
            {/* Optional dot indicator could go here */}
          </button>
          <button className="text-slate-500 hover:text-slate-700 transition-colors">
            <Grip className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 overflow-hidden ml-2 cursor-pointer">
            <img src="https://i.pravatar.cc/150?img=32" alt="User avatar" className="w-full h-full object-cover" />
          </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
