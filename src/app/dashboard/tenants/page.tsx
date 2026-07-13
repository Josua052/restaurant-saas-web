import Link from "next/link";
import { cookies } from "next/headers";
import { Search, Download, Plus, MoreVertical, Store, Filter, AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const metadata = {
  title: "Tenants | Admin Central",
  description: "Manage and oversee all restaurant clients across the platform.",
};

// Based on TenantListResponse in Backend
interface TenantListResponse {
  id: string;
  name: string;
  slug: string;
  owner_name: string;
  plan: string;
  email: string;
  status: number;
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const search = params.search || "";
  const limit = 10;

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  let tenants: TenantListResponse[] = [];
  let meta: PaginationMeta = {
    current_page: 1,
    per_page: limit,
    total_items: 0,
    total_pages: 1,
  };
  let fetchError = null;

  if (token) {
    try {
      const url = new URL(`${API_URL}/superadmin/tenants`);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());
      if (search) {
        url.searchParams.append("search", search);
      }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        tenants = json.data || [];
        meta = json.meta || meta;
      } else {
        const errJson = await res.json();
        fetchError = errJson.message || "Failed to fetch tenants";
      }
    } catch (error) {
      console.error("Tenants List Fetch Error:", error);
      fetchError = "Network error. Make sure the backend is running.";
    }
  }

  // Helper formatting functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const renderStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-50 rounded-full px-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
            Active
          </Badge>
        );
      case 0:
        return (
          <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 hover:bg-red-50 rounded-full px-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5"></span>
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full px-2.5">
            Unknown
          </Badge>
        );
    }
  };

  // Pagination bounds calculation
  const startItem = (meta.current_page - 1) * meta.per_page + 1;
  const endItem = Math.min(meta.current_page * meta.per_page, meta.total_items);

  // Generate Pagination Range (e.g. 1 2 3 ... 10)
  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, meta.current_page - Math.floor(maxVisible / 2));
    let endPage = Math.min(meta.total_pages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1" className="hidden sm:inline-block">
          <PaginationLink href={`?page=1${search ? `&search=${search}` : ''}`} className="h-8 w-8 text-slate-700 hover:bg-slate-100 border-none">1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start" className="hidden sm:inline-block">
            <PaginationEllipsis className="h-8 w-8" />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i} className="hidden sm:inline-block">
          <PaginationLink 
            href={`?page=${i}${search ? `&search=${search}` : ''}`}
            isActive={i === meta.current_page}
            className={`h-8 w-8 border-none ${i === meta.current_page ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < meta.total_pages) {
      if (endPage < meta.total_pages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end" className="hidden sm:inline-block">
            <PaginationEllipsis className="h-8 w-8" />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={meta.total_pages} className="hidden sm:inline-block">
          <PaginationLink href={`?page=${meta.total_pages}${search ? `&search=${search}` : ''}`} className="h-8 w-8 text-slate-700 hover:bg-slate-100 border-none">{meta.total_pages}</PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {fetchError && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-200 shrink-0">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{fetchError}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] leading-7 md:text-2xl md:leading-8 lg:text-3xl lg:leading-9 font-bold text-slate-900 font-heading">
            Tenants
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and oversee all restaurant clients across the platform.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-medium h-11 lg:h-10">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link 
            href="/dashboard/tenants/new" 
            className={buttonVariants({ variant: "default", className: "w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-11 lg:h-10" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Tenant
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="shrink-0 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          {/* We'll use a standard form to submit search to URL without needing a dedicated client component for now */}
          <form method="GET" action="/dashboard/tenants">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              type="search" 
              name="search"
              defaultValue={search}
              placeholder="Search tenants..." 
              className="w-full pl-9 h-11 lg:h-10 bg-white border-slate-300 focus-visible:ring-indigo-500 rounded-md shadow-sm"
            />
          </form>
        </div>
        
        <div className="w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto bg-white !border-slate-300 text-slate-700 hover:bg-white hover:text-slate-700 aria-expanded:bg-white aria-expanded:text-slate-700 font-medium h-11 lg:h-10" })}>
              <Filter className="mr-2 h-4 w-4" />
              Filter: All Tenants
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] border border-slate-200 shadow-lg bg-white">
              <DropdownMenuItem className="cursor-pointer font-medium text-indigo-600 bg-indigo-50/50">All Tenants</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Active</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Suspended</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Data Container */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-0 m-0 outline-none">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[30%] text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Restaurant</TableHead>
                    <TableHead className="w-[20%] text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Owner</TableHead>
                    <TableHead className="w-[15%] text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Plan</TableHead>
                    <TableHead className="w-[15%] text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Status</TableHead>
                    <TableHead className="w-[15%] text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">Join Date</TableHead>
                    <TableHead className="w-[5%] text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.length === 0 && !fetchError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                        No tenants found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenants.map((tenant) => (
                      <TableRow key={tenant.id} className="hover:bg-slate-50 transition-colors group cursor-pointer relative">
                        <TableCell className="py-4">
                          <Link href={`/dashboard/tenants/${tenant.id}`} className="absolute inset-0 z-0" aria-label={`View ${tenant.name}`} />
                          <div className="flex items-center gap-3 relative z-10 pointer-events-none">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm text-slate-500">
                              <Store className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-slate-900 text-sm">{tenant.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 relative z-10 pointer-events-none">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 bg-indigo-50 text-indigo-700">
                              <AvatarFallback className="text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                                {getInitials(tenant.owner_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-slate-600 text-sm">{tenant.owner_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 relative z-10 pointer-events-none">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-medium capitalize">
                            {tenant.plan || 'Basic'} {/* Fallback to Basic if empty */}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 relative z-10 pointer-events-none">
                          {renderStatusBadge(tenant.status)}
                        </TableCell>
                        <TableCell className="text-slate-500 tabular-nums py-4 text-sm relative z-10 pointer-events-none">
                          {formatDate(tenant.created_at)}
                        </TableCell>
                        <TableCell className="text-right py-4 relative z-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-slate-400 hover:text-slate-600 focus-visible:ring-indigo-500" })}>
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem render={<Link href={`/dashboard/tenants/${tenant.id}`} />}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit Tenant</DropdownMenuItem>
                              {tenant.status !== 0 ? (
                                <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50">Suspend Account</DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600 focus:text-green-700 focus:bg-green-50">Activate Account</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile Stacked Card View */}
            <div className="md:hidden flex flex-col gap-3 p-4">
              {tenants.map((tenant) => (
                <div key={`mobile-${tenant.id}`} className="rounded-lg border border-slate-200 p-4 relative group">
                  <Link href={`/dashboard/tenants/${tenant.id}`} className="absolute inset-0 z-0" aria-label={`View ${tenant.name}`} />
                  
                  <div className="flex items-center justify-between mb-3 relative z-10 pointer-events-none">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500">
                        <Store className="h-4 w-4" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-[15px]">{tenant.name}</h4>
                    </div>
                    {renderStatusBadge(tenant.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 relative z-10 pointer-events-none">
                    <div>
                      <span className="block text-[13px] font-medium text-slate-500 mb-1">Owner</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5 bg-indigo-50 text-indigo-700">
                          <AvatarFallback className="text-[9px] font-semibold bg-indigo-50 text-indigo-700">
                            {getInitials(tenant.owner_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-700">{tenant.owner_name}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[13px] font-medium text-slate-500 mb-1">Plan</span>
                      <span className="text-sm text-slate-700 capitalize">{tenant.plan || 'Basic'}</span>
                    </div>
                    <div>
                      <span className="block text-[13px] font-medium text-slate-500 mb-1">Join Date</span>
                      <span className="text-sm text-slate-700 tabular-nums">{formatDate(tenant.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pagination Footer */}
          {meta.total_items > 0 && (
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
              <div className="hidden sm:block text-sm text-slate-500">
                  Showing <span className="font-medium text-slate-900">{startItem}</span> to <span className="font-medium text-slate-900">{endItem}</span> of <span className="font-medium text-slate-900">{meta.total_items}</span> results
                </div>
                <Pagination className="w-auto mx-0 sm:ml-auto">
                  <PaginationContent>
                    <PaginationItem>
                      {meta.current_page > 1 ? (
                        <PaginationPrevious href={`?page=${meta.current_page - 1}${search ? `&search=${search}` : ''}`} className="h-8 px-2 text-slate-500 hover:text-slate-900" />
                      ) : (
                        <span className="h-8 px-2 flex items-center text-slate-300 cursor-not-allowed">Previous</span>
                      )}
                    </PaginationItem>
                    
                    {renderPaginationItems()}
                    
                    <PaginationItem>
                      {meta.current_page < meta.total_pages ? (
                        <PaginationNext href={`?page=${meta.current_page + 1}${search ? `&search=${search}` : ''}`} className="h-8 px-2 text-slate-500 hover:text-slate-900" />
                      ) : (
                        <span className="h-8 px-2 flex items-center text-slate-300 cursor-not-allowed">Next</span>
                      )}
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
            </div>
          )}
      </div>
    </div>
  );
}
