import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Store, Calendar, User, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function TenantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="flex-1 space-y-8 bg-[#f8fafc] min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm font-medium">
        <Store className="h-5 w-5 mr-2 text-slate-900" />
        <Link
          href="/dashboard/tenants"
          className="text-slate-500 hover:text-slate-900 transition-colors"
        >
          Tenants
        </Link>
        <span className="mx-2 text-slate-400">›</span>
        <span className="text-indigo-700 font-semibold">Kopi Kenangan</span>
      </div>

      {/* Header Profile */}
      <div className="flex items-center gap-6">
        <div className="h-[72px] w-[72px] bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden p-1">
          {/* Using a placeholder image to match the user's screenshot which has an image logo */}
          <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
            <Store className="h-8 w-8" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Kopi Kenangan
            </h1>
            <Badge
              variant="outline"
              className="bg-emerald-100/80 text-emerald-700 border-transparent font-bold tracking-wider text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              ACTIVE
            </Badge>
          </div>
          <div className="flex items-center text-slate-500 text-sm">
            <Calendar className="h-4 w-4 mr-2 text-slate-500" />
            Registered: Oct 12, 2022
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
                <dd className="col-span-2 text-slate-800">Kopi Kenangan</dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-slate-500 font-semibold text-[11px] tracking-wider uppercase pt-0.5">
                  Branch Info
                </dt>
                <dd className="col-span-2 text-slate-800">
                  Jakarta Central, Indonesia
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-slate-500 font-semibold text-[11px] tracking-wider uppercase pt-0.5">
                  Cuisine
                </dt>
                <dd className="col-span-2 text-slate-800">Coffee & Snacks</dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-slate-500 font-semibold text-[11px] tracking-wider uppercase pt-0.5">
                  Address
                </dt>
                <dd className="col-span-2 text-slate-800 leading-relaxed">
                  Menara Standard Chartered, Lt. 21
                  <br />
                  Jl. Prof. Dr. Satrio No. 164
                  <br />
                  Jakarta Selatan 12930
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
                <dd className="col-span-2 text-slate-800">Elena Rossi</dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-slate-500 font-semibold text-[11px] tracking-wider uppercase pt-0.5">
                  Email
                </dt>
                <dd className="col-span-2 text-slate-800">
                  elena@kopikenangan.com
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-slate-500 font-semibold text-[11px] tracking-wider uppercase pt-0.5">
                  Phone
                </dt>
                <dd className="col-span-2 text-slate-500">
                  No phone number provided yet
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Account Management */}
      <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 pt-6">
          <CardTitle className="text-base font-bold flex items-center text-slate-900">
            <ShieldAlert className="h-5 w-5 mr-2 text-red-600" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Active Status
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Toggle whether this tenant can access the platform and process
                orders.
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-red-600">
                Danger Zone
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Suspending the tenant will immediately halt all active services.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white font-medium shadow-none"
            >
              Suspend Tenant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
