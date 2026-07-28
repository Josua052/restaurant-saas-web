"use client";

import { useEffect, useState } from "react";
import { Store, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchAuth } from "@/lib/fetchAuth";

interface Branch {
  id: string;
  name: string;
}

export function BranchSwitcher() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>("");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetchAuth("/api/v1/management/tenant/branches");
        const data = await res.json();
        if (data.success && data.data) {
          setBranches(data.data);
          
          // Set active branch from localStorage or default to first branch
          const stored = localStorage.getItem("active_branch_id");
          if (stored && data.data.some((b: Branch) => b.id === stored)) {
            setActiveBranchId(stored);
          } else if (data.data.length > 0) {
            setActiveBranchId(data.data[0].id);
            localStorage.setItem("active_branch_id", data.data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch branches", error);
      }
    };

    fetchBranches();
  }, []);

  const handleSelect = (branchId: string) => {
    setActiveBranchId(branchId);
    localStorage.setItem("active_branch_id", branchId);
    // Reload page to reflect branch data context across all components
    window.location.reload();
  };

  const activeBranch = branches.find((b) => b.id === activeBranchId);

  if (branches.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between border-slate-200 bg-slate-50 hover:bg-slate-100"
        >
          <div className="flex items-center gap-2 truncate">
            <Store className="h-4 w-4 text-slate-500" />
            <span className="truncate">{activeBranch?.name || "Select Branch"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] p-1 bg-white">
        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => handleSelect(branch.id)}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <Check
              className={`h-4 w-4 ${
                activeBranchId === branch.id ? "opacity-100" : "opacity-0"
              }`}
            />
            {branch.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
