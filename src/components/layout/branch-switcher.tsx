"use client";

import { useEffect, useState } from "react";
import { Store, Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchAuth } from "@/lib/fetchAuth";

export interface Branch {
  id?: string;
  ID?: string;
  name?: string;
  Name?: string;
  address?: string;
  Address?: string;
  is_main?: boolean;
  IsMain?: boolean;
}

export const getBranchId = (b: Branch) => b.id || b.ID || "";
export const getBranchName = (b: Branch) => b.name || b.Name || "Unnamed Branch";
export const getBranchAddress = (b: Branch) => b.address || b.Address || "No address provided";

interface BranchSwitcherProps {
  onActiveBranchChange?: (branch: Branch | null) => void;
}

export function BranchSwitcher({ onActiveBranchChange }: BranchSwitcherProps = {}) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const getStorageKey = () => {
    if (typeof window === "undefined") return "active_branch_id";
    const pathParts = window.location.pathname.split("/");
    const domain = pathParts[1] !== "dashboard" ? pathParts[1] : "";
    return domain ? `active_branch_id_${domain}` : "active_branch_id";
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetchAuth("/api/v1/management/tenant/branches");
        const data = await res.json();
        if (data.success && data.data) {
          setBranches(data.data);
          
          // If no active branch is set, default to the main one (or first one)
          const storageKey = getStorageKey();
          let stored = localStorage.getItem(storageKey);
          
          // Fallback to legacy
          if (!stored) {
             stored = localStorage.getItem("active_branch_id");
             if (stored) localStorage.setItem(storageKey, stored); // migrate
          }

          let isValid = false;
          if (stored) {
            const found = data.data.find((b: Branch) => getBranchId(b) === stored);
            if (found) {
              setActiveBranch(found);
              if (onActiveBranchChange) onActiveBranchChange(found);
              isValid = true;
            }
          }

          if (!isValid && data.data.length > 0) {
            const main = data.data.find((b: Branch) => b.is_main || b.IsMain) || data.data[0];
            const mainId = getBranchId(main);
            setActiveBranch(main);
            if (onActiveBranchChange) onActiveBranchChange(main);
            if (mainId) {
              localStorage.setItem(storageKey, mainId);
              localStorage.setItem("active_branch_id", mainId); // update legacy fallback
            }
            window.location.reload();
          }
        }
      } catch (error) {
        console.error("Failed to fetch branches", error);
      }
    };

    fetchBranches();
  }, []);

  const handleBranchSelect = (branch: Branch) => {
    setActiveBranch(branch);
    const id = getBranchId(branch);
    if (id) {
      localStorage.setItem(getStorageKey(), id);
    }
    // Reload page to reflect branch data context across all components
    window.location.reload();
  };

  if (branches.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <div className="flex items-center gap-2 truncate">
          <Store className="h-4 w-4 text-slate-500" />
          <span className="truncate">{activeBranch ? getBranchName(activeBranch) : "Select Branch"}</span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-1 bg-white">
        {branches.map((branch) => (
          <DropdownMenuItem
            key={getBranchId(branch)}
            onClick={() => handleBranchSelect(branch)}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <Check
              className={`h-4 w-4 ${
                getBranchId(activeBranch as Branch) === getBranchId(branch) ? "opacity-100" : "opacity-0"
              }`}
            />
            {getBranchName(branch)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
