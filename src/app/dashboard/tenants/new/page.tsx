import Link from "next/link";
import { ChevronRight, ArrowRight, AlertCircle, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateTenantPage() {
  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Breadcrumbs - placed inside page content as requested */}
      <div className="shrink-0 flex items-center text-sm font-medium text-slate-500">
        <Link href="/dashboard/tenants" className="hover:text-slate-900 transition-colors">Tenants</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-indigo-600">New</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex justify-center pb-12">
          <div className="w-full max-w-[720px]">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-slate-200">
                <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 font-heading mb-2">Register New Restaurant</h1>
                <p className="text-sm md:text-base text-slate-500">Create a new tenant account and establish owner credentials.</p>
              </div>

              {/* Form */}
              <div className="p-6 md:p-8 space-y-8">
                {/* Restaurant Info */}
                <section className="space-y-5">
                  <h2 className="text-[15px] md:text-base font-semibold text-slate-900 pb-3 border-b border-slate-100">Restaurant Information</h2>
                  <div className="space-y-2">
                    <label htmlFor="restaurantName" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Restaurant Name
                    </label>
                    <Input id="restaurantName" placeholder="e.g. Acme Dining Group" className="h-11 text-base md:text-sm" />
                  </div>
                </section>

                {/* Owner Account */}
                <section className="space-y-5">
                  <h2 className="text-[15px] md:text-base font-semibold text-slate-900 pb-3 border-b border-slate-100">Owner Account</h2>
                  
                  <div className="space-y-2">
                    <label htmlFor="ownerName" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Owner Name
                    </label>
                    <Input id="ownerName" placeholder="Full Legal Name" className="h-11 text-base md:text-sm" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label htmlFor="ownerEmail" className="text-xs font-semibold text-red-600 uppercase tracking-wider block">
                        Owner Email
                      </label>
                      <div className="relative">
                        <Input 
                          id="ownerEmail" 
                          defaultValue="invalid-email@" 
                          className="h-11 pr-10 border-red-500 focus-visible:ring-red-500 text-slate-900 text-base md:text-sm" 
                        />
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500 pointer-events-none" />
                      </div>
                      <p className="text-[11px] md:text-xs font-medium text-red-600 mt-1">Email address is invalid or required</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="initialPassword" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        Initial Password
                      </label>
                      <div className="relative">
                        <Input 
                          id="initialPassword" 
                          type="password" 
                          defaultValue="12345678" 
                          className="h-11 pr-10 text-base md:text-sm" 
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          <EyeOff className="h-5 w-5" />
                          <span className="sr-only">Toggle password visibility</span>
                        </button>
                      </div>
                      <p className="text-[11px] md:text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                    </div>
                  </div>
                </section>

                {/* Actions */}
                <div className="pt-6 flex flex-col gap-3">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-[15px] font-medium shadow-sm transition-all hover:shadow">
                    Register Restaurant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-700 h-11 text-[15px]">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
