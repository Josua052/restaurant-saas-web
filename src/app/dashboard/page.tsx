import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, TrendingUp, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import mockTenants from "@/data/mock-tenants.json";

export default function DashboardPage() {
  // Take only the first 5 for the preview
  const recentTenants = mockTenants.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stat Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 font-sans">
              Total Tenants
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-sans tabular-nums text-slate-900">
              1,492
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 font-sans">
              Active Tenants
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold font-sans tabular-nums text-slate-900">
                1,240
              </div>
              <span className="text-xs font-medium text-green-600 font-sans">
                +12%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 font-sans">
              New This Month
            </CardTitle>
            <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-sans tabular-nums text-slate-900">
              84
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tenants Table */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 font-sans">Recent Tenants</h3>
          <Link href="/dashboard/tenants" className={buttonVariants({ variant: "ghost", className: "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium text-sm" })}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="bg-white">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40%] text-xs font-semibold text-slate-500 uppercase tracking-wider">Restaurant Name</TableHead>
                <TableHead className="w-[25%] text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</TableHead>
                <TableHead className="w-[15%] text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="w-[20%] text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTenants.map((tenant) => (
                <TableRow key={tenant.id} className="group cursor-pointer hover:bg-slate-50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all">
                        <Store className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-slate-900">{tenant.restaurantName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{tenant.owner}</TableCell>
                  <TableCell>
                    {tenant.status === "Active" && (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-transparent">
                        Active
                      </Badge>
                    )}
                    {tenant.status === "Trial" && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-transparent">
                        Trial
                      </Badge>
                    )}
                    {tenant.status === "Suspended" && (
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-transparent">
                        Suspended
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 tabular-nums">{tenant.registeredDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
