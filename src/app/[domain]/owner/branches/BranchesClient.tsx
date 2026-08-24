"use client";

import { useState, useEffect } from "react";
import { Search, Plus, MapPin, Building2, Store } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import { fetchAuth } from "@/lib/fetchAuth";
import { toast } from "sonner";
import { Modal, TextInput, Checkbox, Button } from "@mantine/core";
import { useForm } from "@mantine/form";

type Branch = {
  id?: string;
  ID?: string;
  name?: string;
  Name?: string;
  address?: string;
  Address?: string;
  phone?: string;
  Phone?: string;
  is_main?: boolean;
  IsMain?: boolean;
};

const getBranchId = (b: Branch) => b.id || b.ID || "";
const getBranchName = (b: Branch) => b.name || b.Name || "";
const getBranchAddress = (b: Branch) => b.address || b.Address || "";
const getBranchPhone = (b: Branch) => b.phone || b.Phone || "";
const getIsMain = (b: Branch) => b.is_main || b.IsMain || false;

const fetcher = async ([url]: [string]) => {
  const res = await fetchAuth(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to fetch branches");
  }
  const json = await res.json();
  return json.data;
};

export default function BranchesClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: branches = [], mutate } = useSWR<Branch[]>(
    ["/api/v1/management/tenant/branches"],
    fetcher,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const form = useForm({
    initialValues: {
      name: "",
      phone: "",
      address: "",
      is_main: false,
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const safeBranches = Array.isArray(branches) ? branches : [];
  const filteredBranches = safeBranches.filter((branch) =>
    getBranchName(branch)
      .toLowerCase()
      .includes((debouncedSearch || "").toLowerCase()),
  );

  const handleAddBranch = async (values: typeof form.values) => {
    setIsSubmitting(true);
    try {
      const res = await fetchAuth("/api/v1/management/tenant/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create branch");
      }
      toast.success("Branch created successfully");
      mutate();
      setIsAddModalOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to create branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 mx-auto min-h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
            Branches
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage your restaurant locations and operating hours
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search branches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors bg-white text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.map((branch) => {
          const bId = getBranchId(branch);
          const bName = getBranchName(branch);
          const bAddress = getBranchAddress(branch);
          const bPhone = getBranchPhone(branch);
          const bIsMain = getIsMain(branch);

          return (
            <Link
              key={bId || Math.random().toString()}
              href={`branches/${bId}`}
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer relative flex flex-col h-full"
            >
              {bIsMain && (
                <span className="absolute top-4 right-4 px-2.5 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Main Branch
                </span>
              )}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300">
                  <Store className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {bName}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {bPhone || "No phone set"}
                  </p>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 line-clamp-2">
                  {bAddress || "Address not provided"}
                </p>
              </div>
            </Link>
          );
        })}
        {filteredBranches.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No branches found.</p>
          </div>
        )}
      </div>

      <Modal
        opened={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Branch"
        centered
        overlayProps={{ blur: 3 }}
      >
        <form onSubmit={form.onSubmit(handleAddBranch)} className="space-y-4">
          <TextInput
            label="Branch Name"
            placeholder="e.g. Downtown Branch"
            withAsterisk
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Phone Number"
            placeholder="e.g. +1 234 567 8900"
            {...form.getInputProps("phone")}
          />
          <TextInput
            label="Address"
            placeholder="e.g. 123 Main St, City, Country"
            {...form.getInputProps("address")}
          />
          <Checkbox
            label="Set as Main Branch"
            description="Other branches will be demoted if this is checked."
            {...form.getInputProps("is_main", { type: "checkbox" })}
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button
              variant="light"
              color="gray"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} color="indigo">
              Create Branch
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
