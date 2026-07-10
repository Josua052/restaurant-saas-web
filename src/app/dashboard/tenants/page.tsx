import Link from "next/link";
import { Search, Download, Plus, MoreVertical, Store } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import tenantsData from "@/data/mock-tenants.json";

export default function TenantsPage() {
  // We can simulate having active/trial tabs by just rendering the table inside the TabsContent
  return (
    <div className="flex flex-col h-full space-y-6">
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

      {/* Search Bar - inside page as requested */}
      <div className="shrink-0 flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            type="search" 
            placeholder="Search tenants..." 
            className="w-full pl-9 h-11 lg:h-10 bg-white border-slate-300 focus-visible:ring-indigo-500 rounded-md"
          />
        </div>
      </div>

      {/* Data Container with Tabs */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <Tabs defaultValue="all" className="flex flex-col h-full w-full">
          <div className="shrink-0 px-6 border-b border-slate-200">
            <TabsList className="bg-transparent h-14 p-0 space-x-6">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-0 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                All Tenants
                <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-100">142</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-0 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Active
              </TabsTrigger>
              <TabsTrigger 
                value="trial" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-0 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Trial
              </TabsTrigger>
              <TabsTrigger 
                value="suspended" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-0 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Suspended
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="flex-1 overflow-y-auto p-0 m-0 outline-none">
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
                  {tenantsData.map((tenant) => (
                    <TableRow key={tenant.id} className="hover:bg-slate-50 transition-colors group cursor-pointer relative">
                      <TableCell className="py-4">
                        <Link href={`/dashboard/tenants/${tenant.id}`} className="absolute inset-0 z-0" aria-label={`View ${tenant.restaurantName}`} />
                        <div className="flex items-center gap-3 relative z-10 pointer-events-none">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm text-slate-500">
                            <Store className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-slate-900 text-sm">{tenant.restaurantName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 relative z-10 pointer-events-none">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 bg-indigo-50 text-indigo-700">
                            <AvatarFallback className="text-[10px] font-semibold bg-indigo-50 text-indigo-700">{tenant.ownerInitials}</AvatarFallback>
                          </Avatar>
                          <span className="text-slate-600 text-sm">{tenant.owner}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 relative z-10 pointer-events-none">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-medium">
                          {tenant.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 relative z-10 pointer-events-none">
                        {tenant.status === "Active" && (
                          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-50 rounded-full px-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                            Active
                          </Badge>
                        )}
                        {tenant.status === "Trial" && (
                          <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-50 rounded-full px-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                            Trial
                          </Badge>
                        )}
                        {tenant.status === "Suspended" && (
                          <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 hover:bg-red-50 rounded-full px-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5"></span>
                            Suspended
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 tabular-nums py-4 text-sm relative z-10 pointer-events-none">{tenant.registeredDate}</TableCell>
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
                            {tenant.status !== "Suspended" ? (
                              <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50">Suspend Account</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600 focus:text-green-700 focus:bg-green-50">Activate Account</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile Stacked Card View */}
            <div className="md:hidden flex flex-col gap-3 p-4">
              {tenantsData.map((tenant) => (
                <div key={`mobile-${tenant.id}`} className="rounded-lg border border-slate-200 p-4 relative group">
                  <Link href={`/dashboard/tenants/${tenant.id}`} className="absolute inset-0 z-0" aria-label={`View ${tenant.restaurantName}`} />
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3 relative z-10 pointer-events-none">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500">
                        <Store className="h-4 w-4" />
                      </div>
                      <h4 className="font-semibold text-slate-900 text-[15px]">{tenant.restaurantName}</h4>
                    </div>
                    {tenant.status === "Active" && (
                      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 rounded-full px-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                        Active
                      </Badge>
                    )}
                    {tenant.status === "Trial" && (
                      <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 rounded-full px-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                        Trial
                      </Badge>
                    )}
                    {tenant.status === "Suspended" && (
                      <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 rounded-full px-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5"></span>
                        Suspended
                      </Badge>
                    )}
                  </div>
                  
                  {/* Card Body */}
                  <div className="grid grid-cols-2 gap-y-3 relative z-10 pointer-events-none">
                    <div>
                      <span className="block text-[13px] font-medium text-slate-500 mb-1">Owner</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5 bg-indigo-50 text-indigo-700">
                          <AvatarFallback className="text-[9px] font-semibold bg-indigo-50 text-indigo-700">{tenant.ownerInitials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-700">{tenant.owner}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[13px] font-medium text-slate-500 mb-1">Plan</span>
                      <span className="text-sm text-slate-700">{tenant.plan}</span>
                    </div>
                    <div>
                      <span className="block text-[13px] font-medium text-slate-500 mb-1">Join Date</span>
                      <span className="text-sm text-slate-700 tabular-nums">{tenant.registeredDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Pagination Footer */}
          <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
            <div className="hidden sm:block text-sm text-slate-500">
                Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">10</span> of <span className="font-medium text-slate-900">142</span> results
              </div>
              <Pagination className="w-auto mx-0 sm:ml-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" className="h-8 px-2 text-slate-500 hover:text-slate-900" />
                  </PaginationItem>
                  <PaginationItem className="hidden sm:inline-block">
                    <PaginationLink href="#" isActive className="h-8 w-8 bg-indigo-600 text-white hover:bg-indigo-700 border-none">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem className="hidden sm:inline-block">
                    <PaginationLink href="#" className="h-8 w-8 text-slate-700 hover:bg-slate-100 border-none">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem className="hidden sm:inline-block">
                    <PaginationLink href="#" className="h-8 w-8 text-slate-700 hover:bg-slate-100 border-none">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem className="hidden sm:inline-block">
                    <PaginationEllipsis className="h-8 w-8" />
                  </PaginationItem>
                  <PaginationItem className="hidden sm:inline-block">
                    <PaginationLink href="#" className="h-8 w-8 text-slate-700 hover:bg-slate-100 border-none">15</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" className="h-8 px-2 text-slate-500 hover:text-slate-900" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
