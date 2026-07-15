"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TenantLoginFormProps {
  domain: string;
}

export function TenantLoginForm({ domain }: TenantLoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);

  useEffect(() => {
    // Check if redirected due to suspension
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("suspended") === "true") {
        setShowSuspendedModal(true);
        // Optional: clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorDetail = result.errors?.detail || result.message || "Invalid credentials.";
        
        // Intercept suspension error
        if (errorDetail.toLowerCase().includes("suspended")) {
          setShowSuspendedModal(true);
        } else {
          setError(errorDetail);
        }
        
        setIsLoading(false);
        return;
      }

      // Route the user to their specific tenant dashboard
      router.push(`/${domain}/owner`);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Network error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-600 py-3 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`pl-10 h-11 ${errors.email ? "border-red-500" : ""}`}
              disabled={isLoading}
              {...register("email")}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`pl-10 pr-10 h-11 ${errors.password ? "border-red-500" : ""}`}
              disabled={isLoading}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <Dialog open={showSuspendedModal} onOpenChange={setShowSuspendedModal}>
        <DialogContent className="sm:max-w-md text-center border-t-4 border-t-red-600">
          <DialogHeader>
            <div className="mx-auto bg-red-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
              <Ban className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 text-center">
              Account Suspended
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-base text-slate-600 text-center pt-2">
            Your restaurant account has been temporarily suspended by the administrator. 
            You cannot log in or perform any actions at this time.
            <br /><br />
            Please contact support or the Super Admin for further assistance.
          </DialogDescription>
          <div className="flex justify-center mt-6">
            <Button 
              onClick={() => setShowSuspendedModal(false)}
              className="bg-slate-900 hover:bg-slate-800 text-white w-full sm:w-auto px-8"
            >
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
