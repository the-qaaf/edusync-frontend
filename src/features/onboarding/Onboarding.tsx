import React, { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle,
  School,
  User,
  Upload,
  ShieldCheck,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { Button, Input, Select, Textarea } from "@/shared/ui";
import { useAuth } from "@/features/auth/AuthContext";
import { uploadSchoolLogo } from "@/services/firebase/settings";
import { db } from "@/services/firebase/config";
import { doc, collection, runTransaction } from "firebase/firestore";
import { useToast } from "@/shared/ui/Toast";
import { useNavigate } from "@tanstack/react-router";

// Types for local form state
interface OnboardingData {
  email: string;
  password: string;
  confirmPassword: string;
  schoolName: string;
  address: string;
  phone: string;
  academicYear: string;
  logo: File | null;
  logoPreview: string | null;
}

const STEPS = [
  { p: 1, label: "Admin Access", icon: User },
  { p: 2, label: "Institution", icon: School },
  { p: 3, label: "Launch", icon: ShieldCheck },
];

const Onboarding: React.FC = () => {
  const { signup, user, isAuthenticated, refreshUser, setTenantId, schoolId } =
    useAuth();
  console.log("🚀 ~ Onboarding ~ schoolId:", schoolId);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    email: "",
    password: "",
    confirmPassword: "",
    schoolName: "",
    address: "",
    phone: "",
    academicYear:
      new Date().getFullYear() +
      "-" +
      (new Date().getFullYear() + 1).toString().slice(-2),
    logo: null,
    logoPreview: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if already authenticated AND has schoolId (onboarding complete)
  // If authenticated but no schoolId, allow them to complete onboarding.
  useEffect(() => {
    if (isAuthenticated && schoolId) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, schoolId, navigate]);

  // Handlers
  const handleChange = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast("File too large (max 2MB)", "error");
        return;
      }
      const preview = URL.createObjectURL(file);
      setData((prev) => ({ ...prev, logo: file, logoPreview: preview }));
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  // Step 1: Account Creation
  const handleAccountSetup = async () => {
    if (!data.email || !data.password) {
      toast("Please fill in all fields", "error");
      return;
    }
    if (data.password !== data.confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    if (data.password.length < 6) {
      toast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      nextStep();
    } catch (e: any) {
      console.error(e);
      toast("Failed to create account: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validation only
  const handleSchoolDetails = () => {
    if (!data.schoolName || !data.address) {
      toast("School Name and Address are required", "error");
      return;
    }
    nextStep();
  };

  // Step 3: Final Submission
  const handleCompleteSetup = async () => {
    setLoading(true);
    try {
      // 1. Ensure User Account Exists
      let currentUser = user;
      if (!currentUser) {
        // Attempt signup if not logged in
        const newUser = await signup(data.email, data.password);
        if (newUser) {
          currentUser = newUser;
        } else {
          // Fallback: This path is unlikely if signup returns normally, but just in case
          const { auth } = await import("@/services/firebase/config");
          currentUser = auth?.currentUser || null;
        }
      }

      if (!currentUser || !db) {
        throw new Error("Failed to authenticate user or connect to database.");
      }

      // 2. Upload Logo first (independent of batch)
      const tenantRef = doc(collection(db, "tenants"));
      const tenantId = tenantRef.id;
      let logoUrl = "";

      if (data.logo) {
        try {
          logoUrl = await uploadSchoolLogo(tenantId, data.logo);
        } catch (uploadError) {
          console.error("Logo upload failed", uploadError);
          toast("Logo upload failed, continuing without it.", "info");
        }
      }

      // 3. Transactional Tenant Onboarding
      // Enforces strict tenant containment and atomic consistency
      // We use a transaction to ensure no user is created without a tenant.
      await runTransaction(db, async (transaction) => {
        // B. Create Tenant Root Record (The Source of Truth)
        transaction.set(tenantRef, {
          name: data.schoolName,
          createdAt: new Date().toISOString(),
          ownerId: currentUser.uid,
          email: data.email,
          phone: data.phone,
          status: "active",
          plan: "free",
          address: data.address,
          academicYear: data.academicYear,
          updatedAt: new Date().toISOString(),
        });

        // A. Tenant Settings (General Doc)
        const settingsRef = doc(db, "tenants", tenantId, "settings", "general");
        transaction.set(settingsRef, {
          schoolName: data.schoolName, // UI still says School Name, mapped to tenant name
          address: data.address,
          phone: data.phone,
          academicYear: data.academicYear,
          logoUrl: logoUrl,
          currentTerm: "Term 1",
          terms: ["Term 1", "Term 2", "Annual"],
          contactEmail: data.email,
          website: "",
        });

        // C. Create Tenant-Scoped User Record
        // Path: /tenants/{tenantId}/users/{uid}
        const userRef = doc(db, "tenants", tenantId, "users", currentUser.uid);
        transaction.set(userRef, {
          uid: currentUser.uid, // Vital for Collection Group lookup
          tenantId: tenantId,
          role: "admin",
          email: currentUser.email,
          createdAt: new Date().toISOString(),
        });
      });

      // 5. Refresh Context & Optimistic Update
      await refreshUser();
      setTenantId(tenantId); // Immediate access even if index lags

      toast("Setup complete! Welcome to QAAF Connect.", "success");
      navigate({ to: "/" });
    } catch (e: any) {
      console.error(e);
      toast("Failed to save settings: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex gap-4 mb-10">
      {STEPS.map((s) => {
        const isActive = s.p === step;
        const isCompleted = s.p < step;
        return (
          <div key={s.p} className="flex items-center">
            <div
              className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                        ${
                          isActive
                            ? "bg-slate-900 text-white ring-4 ring-slate-100"
                            : ""
                        }
                        ${isCompleted ? "bg-green-600 text-white" : ""}
                        ${
                          !isActive && !isCompleted
                            ? "bg-slate-100 text-slate-400"
                            : ""
                        }
                    `}
            >
              {isCompleted ? <CheckCircle size={18} /> : <s.icon size={18} />}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLeftPanel = () => (
    <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between h-full bg-white relative overflow-y-auto">
      <div className="w-full max-w-md mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          <span className="font-bold text-slate-900 text-lg">EduSync</span>
        </div>

        <StepIndicator />

        {/* Content Area */}
        <div className="flex-1">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-left-8 duration-500 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Create Admin Account
                </h1>
                <p className="text-slate-500">
                  Begin by setting up your super-admin credentials.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Official Email"
                  placeholder="admin@school.edu"
                  type="email"
                  value={data.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  autoFocus
                />
                <Input
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  value={data.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                <Input
                  label="Confirm Password"
                  placeholder="••••••••"
                  type="password"
                  value={data.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                />
              </div>

              <Button
                className="w-full h-12 text-base mt-2 bg-slate-900 hover:bg-slate-800"
                onClick={handleAccountSetup}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  "Continue"
                )}
                {!loading && <ArrowRight size={18} className="ml-2" />}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-left-8 duration-500 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  School Profile
                </h1>
                <p className="text-slate-500">
                  Tell us about your institution.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="School Name"
                  placeholder="Springfield High School"
                  value={data.schoolName}
                  onChange={(e) => handleChange("schoolName", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    placeholder="+1 555-0123"
                    value={data.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                  <Select
                    label="Academic Year"
                    options={[
                      { value: "2023-24", label: "2023 - 2024" },
                      { value: "2024-25", label: "2024 - 2025" },
                      { value: "2025-26", label: "2025 - 2026" },
                    ]}
                    value={data.academicYear}
                    onChange={(val) => handleChange("academicYear", val)}
                  />
                </div>
                <Textarea
                  label="Address"
                  placeholder="School address..."
                  className="min-h-[80px]"
                  value={data.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />

                {/* Simple Image Upload */}
                <div
                  className="flex items-center gap-4 p-3 border border-dashed border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    {data.logoPreview ? (
                      <img
                        src={data.logoPreview}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Upload size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      Upload Logo
                    </p>
                    <p className="text-xs text-slate-400">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-12"
                >
                  Back
                </Button>
                <Button
                  className="flex-[2] h-12 bg-slate-900"
                  onClick={handleSchoolDetails}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-left-8 duration-500 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Review & Launch
                </h1>
                <p className="text-slate-500">
                  You're all set. Verify details below.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-2">
                    {data.logoPreview ? (
                      <img
                        src={data.logoPreview}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <School className="text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {data.schoolName}
                    </h3>
                    <p className="text-sm text-slate-500">{data.address}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                      Admin
                    </span>
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {data.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                      Session
                    </span>
                    <p className="text-sm font-medium text-slate-900">
                      {data.academicYear}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-12"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  className="flex-[2] h-12 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleCompleteSetup}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <CheckCircle size={18} className="mr-2" />
                  )}
                  Launch Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} QAAF Connect. Secure & Compliant.
        </div>
      </div>
    </div>
  );

  const renderRightPanel = () => (
    <div className="hidden lg:flex w-1/2 bg-[#F1F5F9] relative overflow-hidden items-center justify-center p-20">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Main Illustration */}
      <div className="relative z-10 w-full max-w-lg animate-in zoom-in-95 duration-1000 ease-out fill-mode-forwards">
        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 p-6 shadow-2xl shadow-slate-200/50 transform transition-all hover:scale-[1.02] duration-500">
          <img
            src="/assets/onboarding_illustration.png"
            alt="School Management Illustration"
            className="w-full h-auto rounded-2xl shadow-lg border border-white/50"
          />

          {/* Floating Cards / Decorations */}
          <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-forwards">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">
                  Status
                </p>
                <p className="text-sm font-bold text-slate-900">Verified</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-8 -left-8 bg-slate-900 p-5 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-forwards">
            <div className="flex items-center gap-4">
              <div className="text-white">
                <p className="text-xs text-slate-400">Active Students</p>
                <p className="text-xl font-bold">2,500+</p>
              </div>
              <div className="h-8 w-[1px] bg-slate-700" />
              <div className="text-white">
                <GraduationCap size={24} className="text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full font-sans bg-white overflow-hidden">
      {renderLeftPanel()}
      {renderRightPanel()}
    </div>
  );
};

export default Onboarding;
