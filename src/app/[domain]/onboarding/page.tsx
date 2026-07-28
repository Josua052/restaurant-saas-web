"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Store, MapPin, Phone, Percent, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { fetchAuth } from "@/lib/fetchAuth";

interface OnboardingFormInputs {
  name: string;
  address: string;
  phone: string;
  tax_rate: number;
}

export default function OnboardingPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingFormInputs>({
    defaultValues: {
      name: "Cabang Pusat",
      tax_rate: 0,
    }
  });

  const onSubmit = async (data: OnboardingFormInputs) => {
    setIsLoading(true);
    setError(null);

    try {
      // Menembak API Backend untuk membuat cabang pertama (is_main: true)
      const res = await fetchAuth(`/api/v1/management/tenant/branches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          address: data.address,
          phone: data.phone,
          tax_rate: Number(data.tax_rate),
          is_main: true,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.message || "Gagal menyimpan data cabang.");
        setIsLoading(false);
        return;
      }

      // Simpan branchID ke localStorage sebagai cabang aktif
      if (typeof window !== "undefined") {
        localStorage.setItem("active_branch_id", result.data.id);
      }

      // Arahkan ke dashboard Owner
      router.push(`/${domain}/owner`);

    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-indigo-200/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-indigo-200/40 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="w-full max-w-xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-12 relative z-10">
        <div className="text-center mb-8 space-y-2">
          <div className="mx-auto bg-indigo-100 w-16 h-16 flex items-center justify-center rounded-2xl mb-6 shadow-sm">
            <Store className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Selamat Datang!</h1>
          <p className="text-slate-500 text-sm">
            Mari atur cabang pertama Anda sebelum mulai menggunakan dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Nama Cabang</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Store className="h-4 w-4" />
              </div>
              <Input
                placeholder="Cabang Sudirman"
                className="pl-10 h-12 bg-white"
                disabled={isLoading}
                {...register("name", { required: "Nama cabang wajib diisi" })}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Alamat Lengkap</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <Input
                placeholder="Jl. Jend. Sudirman No. 1"
                className="pl-10 h-12 bg-white"
                disabled={isLoading}
                {...register("address", { required: "Alamat wajib diisi" })}
              />
            </div>
            {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Nomor Telepon</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <Input
                  type="tel"
                  placeholder="08123456789"
                  className="pl-10 h-12 bg-white"
                  disabled={isLoading}
                  {...register("phone")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Pajak / PB1 (%)</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Percent className="h-4 w-4" />
                </div>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="10"
                  className="pl-10 h-12 bg-white"
                  disabled={isLoading}
                  {...register("tax_rate", { min: 0, max: 100 })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Menyiapkan...
                </>
              ) : (
                <>
                  Mulai Gunakan SaaS
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
