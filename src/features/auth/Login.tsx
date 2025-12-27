import React, { useState } from "react";
import { Button, Input, Checkbox } from "@/shared/ui";
import {
  School,
  ArrowRight,
  Lock,
  Mail,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/shared/ui/Toast";
import { useNavigate } from "@tanstack/react-router";
import { isFirebaseConfigured } from "@/services/firebase";
import { useAuth } from "@/features/auth/AuthContext";

const Login: React.FC = () => {
  const { toast } = useToast();
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  // If user is already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: "/overview" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password, remember);
      toast("Successfully logged in", "success");
      navigate({ to: "/overview" });
    } catch (error: any) {
      console.error(error);
      let msg = "Failed to login";
      if (error.code === "auth/invalid-credential")
        msg = "Invalid email or password";
      else if (error.code === "auth/user-not-found") msg = "User not found";
      else if (error.code === "auth/wrong-password") msg = "Incorrect password";

      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans bg-white selection:bg-sky-100 selection:text-sky-900">
      {/* Left Side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 xl:p-24 relative">
        <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden w-12 h-12 bg-gradient-to-tr from-sky-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 mb-6">
            <School className="text-white" size={24} />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="text-slate-500">
              Please enter your details to access the admin console.
            </p>
          </div>

          {!isFirebaseConfigured() && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 flex items-start gap-3">
              <div className="bg-amber-100 p-1 rounded-full shrink-0">
                <AlertTriangle size={14} className="text-amber-600" />
              </div>
              <p className="leading-relaxed">
                <strong>Demo Mode:</strong> Database not connected. You can use
                any email address to simulate access.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-slate-900">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={18} />
                  </div>
                  <Input
                    type="email"
                    placeholder="name@school.edu"
                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-0 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-slate-900">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-0 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Checkbox
                label="Remember for 30 days"
                className="text-sm text-slate-600"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold shadow-lg shadow-sky-500/25 bg-sky-600 hover:bg-sky-700 active:scale-[0.98] transition-all duration-200 rounded-xl mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Verified...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in to account
                  <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-8">
            EduSync &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Right Side: Branding/Gradient */}
      <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden text-white items-center justify-center">
        {/* Rich Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900 opacity-90 z-10"></div>

        {/* Abstract Shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-400 rounded-full blur-3xl opacity-20 z-0"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 z-0"></div>

        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10 z-0"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        {/* Content Card */}
        <div className="relative z-20 max-w-lg p-12 backdrop-blur-sm bg-white/10 border border-white/10 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-700 slide-in-from-right-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-8 shadow-inner border border-white/20">
            <School size={32} className="text-white" />
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6">
            Redefining School Management
          </h2>
          <p className="text-lg text-sky-100 leading-relaxed mb-8">
            Streamline operations, enhance communication, and empower your
            educators with our intelligent admin platform.
          </p>

          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-sky-200 flex items-center justify-center text-indigo-900 font-bold text-xs ring-2 ring-transparent"
                >
                  {/* Placeholder avatars */}
                  <span className="opacity-50">U{i}</span>
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-sky-100">
              Trusted by 500+ schools
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
