import { Metadata } from "next";
import { LoginForm } from "./components/login-form";

export const metadata: Metadata = {
  title: "Admin Login | SaaS Restaurant",
  description: "Secure login for Super Admin",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-indigo-200/50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-indigo-200/40 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Login Card Component */}
      <LoginForm />
    </div>
  );
}
