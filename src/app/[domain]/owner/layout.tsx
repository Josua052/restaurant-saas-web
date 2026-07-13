import { ReactNode } from "react"
import { 
  Star,
  Bell,
  Grip,
  Menu
} from "lucide-react"
import TenantSidebar from "@/components/tenant-sidebar"

export default function OwnerLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { domain: string }
}) {
  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      {/* Dynamic Sidebar (Handles mobile hiding and active states internally) */}
      <TenantSidebar />


      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
