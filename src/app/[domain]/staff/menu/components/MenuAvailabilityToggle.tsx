"use client";

import { useState } from "react";
import { Switch } from "@mantine/core";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MenuAvailabilityToggleProps {
  menuId: string;
  initialAvailable: boolean;
  token: string;
}

export default function MenuAvailabilityToggle({
  menuId,
  initialAvailable,
  token,
}: MenuAvailabilityToggleProps) {
  const getStoredBranchId = (): string => {
    if (typeof window === "undefined") return "";
    const pathParts = window.location.pathname.split("/");
    const domain = pathParts[1] !== "dashboard" ? pathParts[1] : "";
    const key = domain ? `active_branch_id_${domain}` : "active_branch_id";
    return localStorage.getItem(key) || "";
  };
  const [isAvailable, setIsAvailable] = useState(initialAvailable);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (checked: boolean) => {
    // Optimistic Update
    setIsAvailable(checked);
    setLoading(true);

    try {
      const branchId = getStoredBranchId();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/management/menus/${menuId}/branch-override`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(branchId ? { "X-Branch-ID": branchId } : {}),
          },
          body: JSON.stringify({ is_available: checked }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update availability");
      }

      toast.success(`Menu kini ${checked ? "tersedia" : "habis"}!`);
      // Optionally refresh the server component to sync data
      router.refresh();
    } catch (err) {
      toast.error("Gagal mengubah status ketersediaan menu.");
      // Rollback
      setIsAvailable(!checked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className="bg-white/90 px-2 py-1.5 rounded-md shadow-sm backdrop-blur-md">
      <Switch
        checked={isAvailable}
        onChange={(event) => handleToggle(event.currentTarget.checked)}
        disabled={loading}
        color="teal"
        size="xs"
        label={isAvailable ? "Available" : "Sold Out"}
        styles={{
          label: {
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: isAvailable ? "#047857" : "#be123c",
            cursor: "pointer",
          },
          track: {
            cursor: "pointer",
          }
        }}
      />
    </div>
  );
}
