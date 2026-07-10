"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Shield } from "lucide-react";

import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate validation based on the image's error state requirement
    // In a real app, this would be an API response check
    if (data.email !== "admin@example.com" || data.password !== "password123") {
      setError("Invalid credentials. Please try again.");
      setIsLoading(false);
      return;
    }

    // On success, redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg border border-border p-8 relative z-10">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 text-primary-foreground shadow-sm">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Admin Central
        </h1>
        <p className="text-sm text-slate-500 mt-1">Super Admin Login</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Email Address
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              className={`pl-10 h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
              disabled={isLoading}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Password
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`pl-10 pr-10 h-11 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
              disabled={isLoading}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-600 py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 font-medium bg-primary hover:bg-primary/90 text-white shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Signing in...
            </span>
          ) : (
            <span className="flex items-center">
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">Secure internal system access only.</p>
      </div>
    </div>
  );
}
