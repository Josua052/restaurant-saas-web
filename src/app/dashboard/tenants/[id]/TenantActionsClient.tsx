"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface TenantActionsClientProps {
  tenantId: string;
  initialStatus: number; // 1 for active, 0 for suspended
  token: string;
}

export default function TenantActionsClient({ tenantId, initialStatus, token }: TenantActionsClientProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);

  const isActive = currentStatus === 1;

  const toggleStatus = async (newStatus: number) => {
    setIsUpdating(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/superadmin/tenants/${tenantId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setCurrentStatus(newStatus);
        // Force the server components to refetch data to update the Active/Suspended badges
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`Failed to update status: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Network error while updating tenant status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="pt-6 pb-6 space-y-6">
      {/* Active Switch Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Active Status</h3>
          <p className="text-sm text-slate-500 mt-1">
            Toggle whether this tenant can access the platform and process orders.
          </p>
        </div>
        <Switch 
          checked={isActive} 
          onCheckedChange={(checked) => toggleStatus(checked ? 1 : 0)} 
          disabled={isUpdating} 
        />
      </div>

      {/* Danger Zone */}
      <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-red-600">Danger Zone</h3>
          <p className="text-sm text-slate-500 mt-1">
            Suspending the tenant will immediately halt all active services.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={isUpdating || !isActive}
          onClick={() => toggleStatus(0)}
          className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white font-medium shadow-none"
        >
          {isUpdating && !isActive ? "Suspending..." : "Suspend Tenant"}
        </Button>
      </div>
    </div>
  );
}
