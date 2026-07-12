import LoginForm from "@/components/auth/login-form";
import { Truck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">TransitOps</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-3xl font-bold leading-tight">
            Smart Transport Operations Platform
          </h1>
          <p className="text-slate-300 text-base max-w-md">
            One platform for Fleet Managers, Drivers, Safety Officers, and
            Financial Analysts to run operations end-to-end.
          </p>
        </div>

        <p className="relative z-10 text-sm text-slate-400">
          © 2026 TransitOps. All rights reserved.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">TransitOps</span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}