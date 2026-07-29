"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, CreditCard, CheckSquare, CheckCircle2, Edit2 } from "lucide-react";

interface TenantDetail {
  id: string;
  restaurant_name: string;
  subscription_tier: string;
  subscription_valid_until: string;
  max_branches: number;
  capabilities: string[];
}

interface EditTenantModalProps {
  tenant: TenantDetail;
  token: string;
}

export default function EditTenantModal({ tenant, token }: EditTenantModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Form State
  const [restaurantName, setRestaurantName] = useState(tenant.restaurant_name);
  const [subscriptionTier, setSubscriptionTier] = useState(tenant.subscription_tier || "Basic");
  const [subscriptionValidUntil, setSubscriptionValidUntil] = useState(
    tenant.subscription_valid_until ? tenant.subscription_valid_until.split("T")[0] : ""
  );
  const [maxBranches, setMaxBranches] = useState(tenant.max_branches || 1);
  const [capabilities, setCapabilities] = useState<string[]>(tenant.capabilities || []);

  // Helper: parse date string robustly (handles both "YYYY-MM-DD HH:MM:SS" and "YYYY-MM-DDTHH:MM:SS")
  const parseDateString = (raw: string): string => {
    if (!raw) return "";
    // Split on either space or 'T' to extract YYYY-MM-DD
    return raw.split(/[T ]/)[0] ?? "";
  };

  // Sync state when modal opens
  useEffect(() => {
    if (open) {
      setRestaurantName(tenant.restaurant_name);
      setSubscriptionTier(tenant.subscription_tier || "Basic");
      setSubscriptionValidUntil(parseDateString(tenant.subscription_valid_until));
      setMaxBranches(tenant.max_branches || 1);
      setCapabilities(tenant.capabilities || []);
      setServerError("");
    }
  }, [open, tenant]);

  // Auto-lock maxBranches to 1 when multi_branch module is not active
  const isMultiBranchActive = capabilities.includes("multi_branch");
  useEffect(() => {
    if (!isMultiBranchActive) {
      setMaxBranches(1);
    }
  }, [isMultiBranchActive]);

  // Auto-select based on Tier (Optional helper, but user can override)
  const handleTierChange = (tier: string) => {
    setSubscriptionTier(tier);
    switch (tier) {
      case "Basic":
        setMaxBranches(1);
        setCapabilities(["pos", "menu", "order"]);
        break;
      case "Pro":
        setMaxBranches(3);
        setCapabilities(["pos", "menu", "order", "reservation", "inventory", "qr_menu"]);
        break;
      case "Enterprise":
        setMaxBranches(10);
        setCapabilities([
          "pos",
          "menu",
          "order",
          "reservation",
          "inventory",
          "analytics",
          "website",
          "qr_menu",
          "multi_branch",
          "loyalty",
        ]);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/superadmin/tenants/${tenant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurant_name: restaurantName,
          subscription_tier: subscriptionTier,
          subscription_valid_until: subscriptionValidUntil,
          max_branches: maxBranches,
          capabilities: capabilities,
        }),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        setServerError(data.message || "Failed to update tenant.");
      }
    } catch (error) {
      console.error(error);
      setServerError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableModules = [
    { id: "pos", label: "Point of Sale" },
    { id: "menu", label: "Menu Management" },
    { id: "order", label: "Order Tracking" },
    { id: "reservation", label: "Reservations" },
    { id: "inventory", label: "Inventory" },
    { id: "analytics", label: "Analytics" },
    { id: "website", label: "Mini Website" },
    { id: "qr_menu", label: "QR Menu" },
    { id: "multi_branch", label: "Multi Branch" },
    { id: "loyalty", label: "Loyalty Program" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button variant="outline" className="flex items-center gap-2 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 shadow-sm font-medium h-10 px-4" />
        }
      >
        <Edit2 className="h-4 w-4" /> Edit Subscription
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-900">Edit Tenant Subscription</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-1">
            Update the subscription tier, valid date, branch limit, and active modules for {tenant.restaurant_name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {serverError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="text-[13px] font-semibold text-slate-700 block">Restaurant Name</label>
                <Input
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="h-11 font-medium"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[13px] font-semibold text-slate-700 block">Subscription Tier</label>
                <select
                  value={subscriptionTier}
                  onChange={(e) => handleTierChange(e.target.value)}
                  className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="text-[13px] font-semibold text-slate-700 block">Valid Until</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={subscriptionValidUntil}
                    onChange={(e) => setSubscriptionValidUntil(e.target.value)}
                    className="h-11 pl-10 font-medium border-slate-200 focus-visible:ring-indigo-500"
                  />
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[13px] font-semibold text-slate-700 block">
                  Max Branches Allowed
                  {!isMultiBranchActive && (
                    <span className="ml-2 text-[11px] font-normal text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                      Aktifkan Multi Branch untuk mengubah
                    </span>
                  )}
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={maxBranches}
                  disabled={!isMultiBranchActive}
                  onChange={(e) => setMaxBranches(parseInt(e.target.value) || 1)}
                  className={`h-11 font-medium border-slate-200 focus-visible:ring-indigo-500 ${
                    !isMultiBranchActive ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-[13px] font-semibold text-slate-700 block flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-slate-500" /> Active Modules (A La Carte Override)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableModules.map((mod) => (
                  <label
                    key={mod.id}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      capabilities.includes(mod.id)
                        ? "bg-indigo-50/50 border-indigo-200"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={capabilities.includes(mod.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCapabilities([...capabilities, mod.id]);
                        } else {
                          setCapabilities(capabilities.filter((c) => c !== mod.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="text-[13px] font-medium text-slate-700">
                      {mod.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex flex-row items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
