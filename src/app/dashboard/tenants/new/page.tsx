"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ArrowRight, AlertCircle, EyeOff, CheckCircle2, Utensils, User, Info, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function CreateTenantPage() {
  const router = useRouter();
  
  // Form state
  const [restaurantName, setRestaurantName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const isEmailValid = ownerEmail.includes("@") && ownerEmail.includes(".");
  const showEmailError = emailTouched && !isEmailValid && ownerEmail.length > 0;
  
  const isPasswordValid = initialPassword.length >= 6;
  const showPasswordSuccess = passwordTouched && isPasswordValid;
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmRegister = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setShowSuccess(true);
    }, 800);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (showSuccess && countdown === 0) {
      router.push("/dashboard/tenants");
    }
    return () => clearTimeout(timer);
  }, [showSuccess, countdown, router]);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-[13px] font-medium text-slate-500">
        <Users className="h-4 w-4 mr-1.5" />
        <Link href="/dashboard/tenants" className="hover:text-slate-900 transition-colors">Tenants</Link>
        <ChevronRight className="h-3.5 w-3.5 mx-1" />
        <span className="text-slate-900 font-semibold">New</span>
      </div>

      <div className="pb-12">
        <div className="w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 font-heading mb-2">Register New Restaurant</h1>
            <p className="text-sm md:text-[15px] text-slate-500">Create a new tenant account and configure initial owner access.</p>
          </div>

          <form onSubmit={handleInitialSubmit}>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              {/* Form Body */}
              <div className="p-6 md:p-8 space-y-10">
                {/* Restaurant Info */}
                <section>
                  <div className="flex items-center gap-2.5 mb-6">
                    <Utensils className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-[17px] font-semibold text-slate-900">Restaurant Information</h2>
                  </div>
                  
                  <div className="space-y-2.5">
                    <label htmlFor="restaurantName" className="text-[13px] font-semibold text-slate-700 block">
                      Restaurant Name <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      id="restaurantName" 
                      placeholder="e.g. The Rustic Spoke" 
                      className="h-11 text-base md:text-sm font-medium placeholder:font-normal" 
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                    />
                  </div>
                </section>

                <hr className="border-slate-200" />

                {/* Owner Account */}
                <section>
                  <div className="flex items-center gap-2.5 mb-6">
                    <User className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-[17px] font-semibold text-slate-900">Owner Account</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <label htmlFor="ownerName" className="text-[13px] font-semibold text-slate-700 block">
                        Owner Name <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        id="ownerName" 
                        placeholder="Jane Doe" 
                        className="h-11 text-base md:text-sm font-medium placeholder:font-normal" 
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <label htmlFor="ownerEmail" className={`text-[13px] font-semibold block ${showEmailError ? 'text-red-600' : 'text-slate-700'}`}>
                          Owner Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Input 
                            id="ownerEmail" 
                            type="email"
                            placeholder="name@example.com" 
                            value={ownerEmail}
                            onChange={(e) => setOwnerEmail(e.target.value)}
                            onBlur={() => setEmailTouched(true)}
                            className={`h-11 pl-10 pr-10 text-base md:text-sm font-medium ${showEmailError ? 'border-red-500 focus-visible:ring-red-500 bg-red-50/30' : 'border-slate-200 focus-visible:ring-indigo-500'}`} 
                          />
                          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${showEmailError ? 'text-red-500' : 'text-slate-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                          </div>
                          {showEmailError && (
                            <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500 pointer-events-none" />
                          )}
                        </div>
                        {showEmailError && (
                          <p className="text-[11px] md:text-xs font-semibold text-red-600 mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" /> Please enter a valid email address
                          </p>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        <label htmlFor="initialPassword" className="text-[13px] font-semibold text-slate-700 block">
                          Initial Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Input 
                            id="initialPassword" 
                            type={showPasswordForm ? "text" : "password"} 
                            value={initialPassword}
                            onChange={(e) => setInitialPassword(e.target.value)}
                            onBlur={() => setPasswordTouched(true)}
                            className={`h-11 pl-10 pr-10 text-base md:text-sm font-medium ${showPasswordSuccess ? 'border-green-500 focus-visible:ring-green-500 bg-green-50/30' : 'border-slate-200 focus-visible:ring-indigo-500'}`} 
                          />
                          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${showPasswordSuccess ? 'text-green-500' : 'text-slate-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showPasswordForm ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle password visibility</span>
                          </button>
                        </div>
                        {showPasswordSuccess ? (
                          <p className="text-[11px] md:text-xs font-semibold text-green-600 mt-1.5 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Minimum 6 characters
                          </p>
                        ) : (
                          <p className="text-[11px] md:text-xs font-medium text-slate-500 mt-1.5 flex items-center gap-1">
                            Minimum 6 characters
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Form Footer */}
              <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col-reverse md:flex-row md:items-center justify-between gap-4">
                <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/tenants")} className="text-slate-600 hover:text-slate-900 font-medium px-0 hover:bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Tenants
                </Button>
                
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium px-6 h-11"
                >
                  Register Restaurant
                  <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                </Button>
              </div>
            </div>
          </form>

          <p className="text-center text-xs font-medium text-slate-500 mt-6">
            Secured by Enterprise Trust Protocol
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-lg md:text-xl font-bold font-heading text-slate-900">Confirm Restaurant Registration</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-1">
              Please review the details below. The owner will use this email and password to log in.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 pb-2">
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
              <div className="grid grid-cols-[140px_1fr] items-center p-3.5 border-b border-slate-200 text-[13px]">
                <span className="font-semibold text-slate-500 text-[11px] tracking-wider uppercase">Restaurant Name</span>
                <span className="text-slate-900 font-medium text-right">{restaurantName || "The Rustic Spoke"}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center p-3.5 border-b border-slate-200 text-[13px]">
                <span className="font-semibold text-slate-500 text-[11px] tracking-wider uppercase">Owner Name</span>
                <span className="text-slate-900 font-medium text-right">{ownerName || "Jane Doe"}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center p-3.5 border-b border-slate-200 text-[13px]">
                <span className="font-semibold text-slate-500 text-[11px] tracking-wider uppercase">Owner Email</span>
                <span className="text-slate-900 font-medium text-right truncate">{ownerEmail}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center p-3.5 text-[13px]">
                <span className="font-semibold text-slate-500 text-[11px] tracking-wider uppercase">Initial Password</span>
                <div className="flex items-center justify-end gap-3">
                  <span className={`text-slate-900 font-medium ${!showPasswordModal ? 'tracking-widest text-base translate-y-[2px]' : 'text-[13px]'}`}>
                    {showPasswordModal ? initialPassword : "••••••••"}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setShowPasswordModal(!showPasswordModal)}
                    className="text-indigo-600 font-semibold text-xs flex items-center gap-1.5 cursor-pointer hover:text-indigo-700 focus:outline-none"
                  >
                    {showPasswordModal ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Hide
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        Show
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-[#eff2ff] rounded-lg border border-[#e0e7ff] p-3.5 flex gap-3">
              <Info className="h-5 w-5 text-indigo-600 shrink-0" />
              <p className="text-[13px] text-indigo-900/80 leading-snug">
                Make sure the email and password are correct — the owner will need them to access their dashboard.
              </p>
            </div>
          </div>

          <DialogFooter className="p-6 bg-white flex flex-row items-center justify-between sm:justify-between border-t border-slate-100 gap-2 mt-2">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="w-full sm:w-auto h-10 border-slate-300 text-slate-700 font-medium">
              Edit Details
            </Button>
            <Button onClick={handleConfirmRegister} disabled={isSubmitting} className="w-full sm:w-auto h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              {isSubmitting ? "Processing..." : "Confirm & Register"}
              {!isSubmitting && <CheckCircle2 className="ml-2 h-4 w-4" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-[360px] w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">Tenant Created!</h3>
            <p className="text-slate-500 text-[14px] mb-6 leading-relaxed">
              The new restaurant has been successfully registered on the platform.
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Redirecting to list in {countdown}s...
            </p>
            <Button onClick={() => router.push("/dashboard/tenants")} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-[15px] font-medium rounded-lg">
              Go to Tenants List
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
