import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  TrendingUp,
  Store,
  AlertCircle,
} from "lucide-react";
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

export const metadata = {
  title: "Dashboard | Admin Central",
  description: "Overview of your SaaS tenants and statistics.",
};

// Types corresponding to Backend JSON Response
interface TenantDetailResponse {
  id: string;
  restaurant_name: string;
  slug: string;
  status: number;
  created_at: string;
  branch_name: string;
  address: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
}

interface DashboardStatsResponse {
  total_tenants: number;
  active_tenants: number;
  new_this_month: number;
  recent_tenants: TenantDetailResponse[];
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  let stats: DashboardStatsResponse | null = null;
  let fetchError = null;

  if (token) {
    try {
      // Using cache: "no-store" to ensure real-time data freshness
      const res = await fetch(`${API_URL}/superadmin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        stats = json.data;
      } else {
        const errJson = await res.json();
        fetchError = errJson.message || "Failed to fetch stats";
      }
    } catch (error) {
      console.error("Dashboard Stats Fetch Error:", error);
      fetchError = "Network error. Make sure the backend is running.";
    }
  }

  // Formatting utility for Date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper function to render Status Badge
  const renderStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 border-transparent"
          >
            Active
          </Badge>
        );
      case 0:
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-700 border-transparent"
          >
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-700 border-transparent"
          >
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {fetchError && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{fetchError}</p>
        </div>
      )}

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
              {stats?.total_tenants?.toLocaleString() || 0}
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
                {stats?.active_tenants?.toLocaleString() || 0}
              </div>
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
              {stats?.new_this_month?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tenants Table */}
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h3 className="text-lg font-semibold text-slate-900 font-sans">
            Recent Tenants
          </h3>
          <Link
            href="/dashboard/tenants"
            className={buttonVariants({
              variant: "ghost",
              className:
                "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium text-sm",
            })}
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="bg-white">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40%] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Restaurant Name
                </TableHead>
                <TableHead className="w-[25%] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Owner
                </TableHead>
                <TableHead className="w-[15%] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="w-[20%] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Registered Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!stats?.recent_tenants || stats.recent_tenants.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-slate-500"
                  >
                    No recent tenants found.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recent_tenants.map((tenant) => (
                  <TableRow
                    key={tenant.id}
                    className="group cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all">
                          <Store className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-slate-900">
                          {tenant.restaurant_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {tenant.owner_name}
                    </TableCell>
                    <TableCell>{renderStatusBadge(tenant.status)}</TableCell>
                    <TableCell className="text-slate-500 tabular-nums">
                      {formatDate(tenant.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
