import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Calendar, User, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import TenantActionsClient from "./TenantActionsClient";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_access_token")?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!token) {
    return notFound();
  }

  let detail = null;

  try {
    const res = await fetch(`${API_URL}/superadmin/tenants/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      detail = json.data;
    } else if (res.status === 404) {
      return notFound();
    } else {
      console.error("Failed to fetch tenant detail, status:", res.status);
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <Store className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Failed to load tenant
          </h2>
          <p className="text-slate-500 max-w-md">
            There was a problem retrieving the tenant details from the server.
            Please try again later.
          </p>
          <Link
            href="/dashboard/tenants"
            className="mt-6 text-indigo-600 font-medium hover:underline"
          >
            ← Back to Tenants
          </Link>
        </div>
      );
    }
  } catch (error) {
    console.error("Network error fetching tenant detail:", error);
  }

  if (!detail) {
    return notFound();
  }

  // Formatting date safely
  let formattedDate = "Unknown Date";
  try {
    if (detail.created_at) {
      const dateObj = new Date(detail.created_at);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(dateObj);
      } else {
        formattedDate = detail.created_at; // fallback to raw string
      }
    }
  } catch (e) {
    formattedDate = detail.created_at;
  }

  return (
    <div className="flex-1 space-y-8 bg-[#f8fafc] min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm font-medium">
        <Store className="h-5 w-5 mr-2 text-slate-900" />
        <Link
          href="/dashboard/tenants"
          className="text-slate-500 hover:text-slate-900 transition-colors flex items-center"
        >
          Tenants
        </Link>
        <span className="mx-2 text-slate-400">›</span>
        <span className="text-indigo-700 font-semibold truncate max-w-[200px] md:max-w-none">
          {detail.restaurant_name}
        </span>
      </div>

      {/* Header Profile */}
      <div className="flex items-center gap-6">
        <div className="h-16 w-auto flex items-center justify-center shrink-0 overflow-hidden p-1">
          {detail.logo_url ? (
            <img
              src={detail.logo_url}
              alt={`${detail.restaurant_name} Logo`}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 uppercase font-bold text-xl font-heading">
              {detail.restaurant_name ? (
                detail.restaurant_name.substring(0, 2)
              ) : (
                <Store className="h-8 w-8" />
              )}
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              {detail.restaurant_name}
            </h1>
            {detail.status === 1 ? (
              <Badge
                variant="outline"
                className="bg-emerald-100/80 text-emerald-700 border-transparent font-bold tracking-wider text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                ACTIVE
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-red-100/80 text-red-700 border-transparent font-bold tracking-wider text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                SUSPENDED
              </Badge>
            )}
          </div>
          <div className="flex items-center text-slate-500 text-sm">
            <Calendar className="h-4 w-4 mr-2 text-slate-500" />
            Registered: {formattedDate}
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Restaurant Info */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4 pt-6">
            <CardTitle className="text-base font-bold flex items-center text-slate-900">
              <Store className="h-5 w-5 mr-2 text-indigo-700" />
              Restaurant Info
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <dl className="space-y-6 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-slate-500 font-semibold text-[11px] tracking-wider uppercase pt-0.5">
                  Name
                </dt>
                <dd className="col-span-2 text-slate-800 font-medium">
                  {detail.restaurant_name}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-slate-500 font-semibold text-[11px] tracking-wider uppercase pt-0.5">
                  Branch Info
                </dt>
                <dd className="col-span-2 text-slate-800">
                  {detail.branch_name}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-slate-500 font-semibold text-[11px] tracking-wider uppercase pt-0.5">
                  Cuisine
                </dt>
                <dd className="col-span-2 text-slate-400 italic">
                  Not set in system
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-slate-500 font-semibold text-[11px] tracking-wider uppercase pt-0.5">
                  Address
                </dt>
                <dd className="col-span-2 text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {detail.address}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Owner Info */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden self-start">
          <CardHeader className="border-b border-slate-100 pb-4 pt-6">
            <CardTitle className="text-base font-bold flex items-center text-slate-900">
              <User className="h-5 w-5 mr-2 text-indigo-700" />
              Owner Info
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <dl className="space-y-6 text-sm">
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-slate-500 font-semibold text-[11px] tracking-wider uppercase pt-0.5">
                  Name
                </dt>
                <dd className="col-span-2 text-slate-800 font-medium">
                  {detail.owner_name}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-slate-500 font-semibold text-[11px] tracking-wider uppercase pt-0.5">
                  Email
                </dt>
                <dd className="col-span-2 text-slate-800">
                  {detail.owner_email}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-slate-500 font-semibold text-[11px] tracking-wider uppercase pt-0.5">
                  Phone
                </dt>
                <dd className="col-span-2 text-slate-500">
                  {detail.owner_phone || "No phone number provided yet"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Account Management (Client Component for Interactivity) */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 pt-6">
          <CardTitle className="text-base font-bold flex items-center text-slate-900">
            <ShieldAlert className="h-5 w-5 mr-2 text-red-600" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-6">
          <TenantActionsClient
            tenantId={detail.id}
            initialStatus={detail.status}
            token={token}
          />
        </CardContent>
      </Card>
    </div>
  );
}
