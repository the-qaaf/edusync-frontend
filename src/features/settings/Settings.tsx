import React, { useState, useEffect } from "react";
import {
  Save,
  Image as ImageIcon,
  Plus,
  X,
  Globe,
  User as UserIcon,
  GraduationCap,
  Link as LinkIcon,
  Copy,
} from "lucide-react";
import { Card, Button, Input, Select, Textarea } from "@/shared/ui";
import { useToast } from "@/shared/ui/Toast";
import {
  getSchoolSettings,
  updateSchoolSettings,
  uploadSchoolLogo,
  SchoolSettings,
} from "@/services/firebase";
import { useAuth } from "@/features/auth/AuthContext";
import { useSchoolSettings } from "@/features/settings/SchoolSettingsContext";

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { user, updateDisplayProfile, schoolId } = useAuth();
  const { refreshSettings } = useSchoolSettings();

  // School Settings State
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [settings, setSettings] = useState<SchoolSettings>({
    schoolName: "Greenfield Public School",
    contactEmail: "admin@greenfield.edu",
    address: "123 Education Lane, Springfield",
    academicYear: "2024-25",
    currentTerm: "Term 1",
    terms: ["Term 1", "Term 2", "Finals"],
  });

  // User Settings State
  const [userName, setUserName] = useState(user?.displayName || "");
  const [newTermName, setNewTermName] = useState("");
  const [isAddingTerm, setIsAddingTerm] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (!schoolId) {
        setFetching(false);
        return;
      }
      const data = await getSchoolSettings(schoolId);
      if (data) {
        setSettings({
          ...data,
          terms: data.terms || ["Term 1", "Term 2", "Finals"],
        });
      }
      setFetching(false);
    };
    loadSettings();
  }, [schoolId]);

  useEffect(() => {
    if (user?.displayName) {
      setUserName(user.displayName);
    }
  }, [user]);

  const handleSave = async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      await updateSchoolSettings(schoolId, settings);

      if (user && userName !== user.displayName) {
        await updateDisplayProfile(userName);
      }

      toast("Settings and profile saved successfully!", "success");
    } catch (error) {
      console.error(error);
      toast("Failed to save settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTerm = (index: number) => {
    const newTerms = [...settings.terms];
    newTerms.splice(index, 1);
    setSettings({ ...settings, terms: newTerms });
  };

  const handleAddTerm = () => {
    if (newTermName.trim()) {
      setSettings({
        ...settings,
        terms: [...settings.terms, newTermName.trim()],
      });
      setNewTermName("");
      setIsAddingTerm(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!schoolId) {
      toast("School ID missing", "error");
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Basic validation (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast("File size too large. Max 2MB allowed.", "error");
        return;
      }

      setUploadingLogo(true);
      try {
        const url = await uploadSchoolLogo(schoolId, file);

        // Update local state
        setSettings({ ...settings, logoUrl: url });

        // Persist to Firestore immediately
        await updateSchoolSettings(schoolId, { logoUrl: url });

        // Refresh global context so Sidebar updates immediately
        await refreshSettings();

        toast("Logo uploaded and saved successfully!", "success");
      } catch (error) {
        console.error("Logo upload failed:", error);
        toast("Failed to upload logo. Please try again.", "error");
      } finally {
        setUploadingLogo(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your school preferences and configuration.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="min-w-[140px] shadow-lg shadow-sky-200"
        >
          <Save size={18} className="mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Column 1: School General Info & Profile */}
        <div className="space-y-8">
          <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">School Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Basic information regarding the institution
                </p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Input
                  label="School Name"
                  value={settings.schoolName}
                  onChange={(e) =>
                    setSettings({ ...settings, schoolName: e.target.value })
                  }
                  placeholder="e.g. Springfield Public School"
                />
                <Input
                  label="Contact Email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contactEmail: e.target.value,
                    })
                  }
                  placeholder="admin@school.edu"
                />
                <Input
                  label="Phone Number"
                  value={settings.phone || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      phone: e.target.value,
                    })
                  }
                  placeholder="+91 98765 43210"
                />
                <Input
                  label="Website"
                  value={settings.website || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      website: e.target.value,
                    })
                  }
                  placeholder="www.school.edu"
                />
              </div>
              <Textarea
                label="Address"
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
                placeholder="Full street address"
              />
            </div>
          </Card>

          <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                <ImageIcon size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Branding</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  School identity and visuals
                </p>
              </div>
            </div>
            <div className="p-6">
              <label className="text-sm font-medium leading-none text-slate-900 mb-3 block">
                School Logo
              </label>
              <div
                className={`flex items-center gap-6 p-6 border border-dashed rounded-xl transition-all cursor-pointer group relative overflow-hidden ${
                  uploadingLogo
                    ? "bg-slate-50 border-slate-200"
                    : "border-slate-300 bg-slate-50/30 hover:bg-slate-50 hover:border-sky-300"
                }`}
                onClick={() => !uploadingLogo && fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleFileChange}
                />

                {settings.logoUrl ? (
                  <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shadow-sm relative z-10">
                    <img
                      src={settings.logoUrl}
                      alt="School Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm group-hover:border-sky-300 group-hover:text-sky-500 transition-all">
                    {uploadingLogo ? (
                      <div className="animate-spin w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full" />
                    ) : (
                      <ImageIcon size={28} />
                    )}
                  </div>
                )}

                <div className="space-y-1 relative z-10">
                  <h4 className="text-sm font-medium text-slate-900 group-hover:text-sky-600 transition-colors">
                    {uploadingLogo
                      ? "Uploading..."
                      : settings.logoUrl
                      ? "Change logo"
                      : "Upload new logo"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    SVG, PNG, JPG (max. 2MB)
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Column 2: Academic Setup & My Profile */}
        <div className="space-y-8">
          <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Academic Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Session years and term management
                </p>
              </div>
            </div>

            <div className="p-6 space-y-8">
              <div>
                <Select
                  label="Current Academic Year"
                  className="w-full"
                  options={[
                    { value: "2023-24", label: "2023 - 2024" },
                    { value: "2024-25", label: "2024 - 2025" },
                    { value: "2025-26", label: "2025 - 2026" },
                  ]}
                  value={settings.academicYear}
                  onChange={(val) =>
                    setSettings({ ...settings, academicYear: val })
                  }
                />
                <div className="mt-3 p-3 bg-amber-50 text-amber-800 text-xs rounded-md border border-amber-100 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>
                    Changing the academic year will archive current student
                    statuses. Proceed with caution.
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-900">
                    Exam Terms
                  </label>
                  <span className="text-xs text-slate-400">
                    {settings.terms.length} terms configured
                  </span>
                </div>

                <div className="space-y-3">
                  {settings.terms.map((term, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-center group animate-in slide-in-from-left-2 duration-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-white px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm">
                        {term}
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-all"
                        onClick={() => handleRemoveTerm(index)}
                        title="Remove Term"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  {isAddingTerm ? (
                    <div className="flex gap-3 items-center animate-in fade-in slide-in-from-top-1 duration-200 pt-2">
                      <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-xs font-bold text-sky-500">
                        +
                      </div>
                      <input
                        autoFocus
                        className="flex-1 h-10 rounded-lg border border-sky-300 bg-white px-4 py-1 text-sm shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        placeholder="Enter term name (e.g. Summer Term)"
                        value={newTermName}
                        onChange={(e) => setNewTermName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTerm()}
                      />
                      <Button
                        size="sm"
                        onClick={handleAddTerm}
                        disabled={!newTermName.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingTerm(false)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <button
                      className="flex items-center gap-2 text-sm text-sky-600 font-medium hover:text-sky-700 mt-2 px-1 py-1 rounded hover:bg-sky-50 transition-colors"
                      onClick={() => setIsAddingTerm(true)}
                    >
                      <Plus size={16} /> Add New Term
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <UserIcon size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Profile Settings
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your personal account details
                </p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Input
                  label="Display Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your full name"
                />
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none text-slate-900">
                    Login Email
                  </label>
                  <div className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 shadow-sm cursor-not-allowed">
                    {user?.email}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Email cannot be changed externally.
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <LinkIcon size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Public Links</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  External access links for staff and parents
                </p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium leading-none text-slate-900 mb-2 block">
                    Teacher Daily Log Submission
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Share this link with teachers to allow them to submit daily
                    logs without logging in.
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 truncate font-mono">
                      {schoolId
                        ? `${window.location.protocol}//${window.location.host}/submission/${schoolId}`
                        : "..."}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (schoolId) {
                          navigator.clipboard.writeText(
                            `${window.location.protocol}//${window.location.host}/submission/${schoolId}`
                          );
                          toast("Link copied to clipboard", "success");
                        }
                      }}
                      disabled={!schoolId}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="text-sm font-medium leading-none text-slate-900 mb-2 block">
                    AI Personal Tutor Access
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Share this link with students for 24/7 AI-powered academic
                    assistance.
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 truncate font-mono">
                      {schoolId
                        ? `${window.location.protocol}//${window.location.host}/ai-tutor/${schoolId}`
                        : "..."}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (schoolId) {
                          navigator.clipboard.writeText(
                            `${window.location.protocol}//${window.location.host}/ai-tutor/${schoolId}`
                          );
                          toast("Link copied to clipboard", "success");
                        }
                      }}
                      disabled={!schoolId}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="text-sm font-medium leading-none text-slate-900 mb-2 block">
                    Parent Portal Access
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Public link for parents to view student progress reports and
                    announcements.
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 truncate font-mono">
                      {schoolId
                        ? `${window.location.protocol}//${window.location.host}/portal/${schoolId}`
                        : "..."}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (schoolId) {
                          navigator.clipboard.writeText(
                            `${window.location.protocol}//${window.location.host}/portal/${schoolId}`
                          );
                          toast("Link copied to clipboard", "success");
                        }
                      }}
                      disabled={!schoolId}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
