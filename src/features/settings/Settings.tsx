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
  School,
  Upload,
  Mail,
  Info,
  FileText,
  Bot,
  Users,
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

// Helper for Public Links
const LinkItem = ({
  title,
  description,
  url,
  icon: Icon,
}: {
  title: string;
  description: string;
  url: string;
  icon: any;
}) => {
  const { toast } = useToast();
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md">
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-start gap-4 flex-1">
          <div className="rounded-full bg-blue-50 p-2.5 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-900 truncate">{title}</h4>
            <p className="text-sm text-slate-500 mt-1 break-words line-clamp-2">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 min-w-0">
          <div className="flex-1 min-w-0 text-xs font-mono text-slate-500 truncate select-all">
            {url}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="hover:bg-blue-100 hover:text-blue-600 shrink-0 h-8 w-8 p-0"
            onClick={() => {
              navigator.clipboard.writeText(url);
              toast("Copied to clipboard!", "success");
            }}
          >
            <Copy size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Settings: React.FC = () => {
  const { toast } = useToast();
  const { user, updateDisplayProfile, schoolId } = useAuth();
  const { refreshSettings } = useSchoolSettings();

  // School Settings State
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

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

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "profile", label: "Profile", icon: UserIcon },
    { id: "integrations", label: "Integrations", icon: LinkIcon },
  ];

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
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-slate-400 font-medium animate-pulse">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          className="min-w-[140px] shadow-lg shadow-sky-500/20 bg-sky-600 hover:bg-sky-700"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save size={18} />
              Save Changes
            </span>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                ${
                  isActive
                    ? "border-sky-600 text-sky-600 bg-sky-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }
              `}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  School Details
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <Input
                    label="School Name"
                    value={settings.schoolName}
                    onChange={(e) =>
                      setSettings({ ...settings, schoolName: e.target.value })
                    }
                    placeholder="e.g. Springfield Public School"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        setSettings({ ...settings, phone: e.target.value })
                      }
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <Input
                    label="Website URL"
                    value={settings.website || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, website: e.target.value })
                    }
                    placeholder="https://www.yourschool.com"
                  />
                  <Textarea
                    label="Physical Address"
                    value={settings.address}
                    onChange={(e) =>
                      setSettings({ ...settings, address: e.target.value })
                    }
                    placeholder="Street address, City, ZIP Code"
                    className="min-h-[100px]"
                  />
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Branding
                </h3>
                <label className="text-sm font-medium text-slate-700 mb-3 block">
                  School Logo Upload
                </label>
                <div
                  className={`group relative flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                    uploadingLogo
                      ? "border-slate-200 bg-slate-50"
                      : "border-slate-300 hover:border-sky-400 hover:bg-sky-50/30"
                  }`}
                  onClick={() =>
                    !uploadingLogo && fileInputRef.current?.click()
                  }
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleFileChange}
                  />

                  {settings.logoUrl ? (
                    <div className="relative h-32 w-full flex items-center justify-center">
                      <img
                        src={settings.logoUrl}
                        alt="School Logo"
                        className="h-full w-full object-contain drop-shadow-sm"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <span className="text-white text-sm font-medium flex items-center gap-2">
                          <ImageIcon size={16} /> Change
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                        {uploadingLogo ? (
                          <div className="h-5 w-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload size={20} />
                        )}
                      </div>
                      <div className="text-center">
                        <h4 className="font-semibold text-slate-900 text-sm">
                          {uploadingLogo ? "Uploading..." : "Upload Logo"}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">Max 2MB</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ACADEMIC TAB */}
        {activeTab === "academic" && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="p-6 space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Academic Configuration
                  </h3>
                  <p className="text-sm text-slate-500">
                    Manage sessions and grading periods
                  </p>
                </div>
              </div>

              <div className="space-y-4">
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
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="mt-0.5 text-amber-600">
                    <Info size={16} />
                  </div>
                  <p className="text-xs leading-relaxed text-amber-800 font-medium">
                    Changing the academic year will archive current student
                    statuses. Please proceed with caution.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-semibold text-slate-900">
                    Evaluation Terms
                  </label>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    {settings.terms.length} Active
                  </span>
                </div>

                <div className="space-y-2">
                  {settings.terms.map((term, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-3 p-3 bg-slate-50 border border-transparent rounded-lg hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all"
                    >
                      <div className="h-6 w-6 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {index + 1}
                      </div>
                      <span className="flex-1 text-sm font-medium text-slate-700">
                        {term}
                      </span>
                      <button
                        className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => handleRemoveTerm(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  {isAddingTerm ? (
                    <div className="flex gap-2 items-center animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                      <input
                        autoFocus
                        className="flex-1 h-10 rounded-lg border border-sky-400 ring-2 ring-sky-100 px-3 text-sm focus:outline-none"
                        placeholder="Term Name (e.g. Mid-term)"
                        value={newTermName}
                        onChange={(e) => setNewTermName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTerm()}
                      />
                      <Button size="sm" onClick={handleAddTerm}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsAddingTerm(false)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingTerm(true)}
                      className="w-full py-2.5 flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-500 hover:text-sky-600 hover:border-sky-400 hover:bg-sky-50 transition-all mt-3"
                    >
                      <Plus size={16} />
                      Add Another Term
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                  <UserIcon size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {userName || "Admin User"}
                  </h3>
                  <p className="text-sm text-slate-500">School Administrator</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Display Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your full name"
                />
                <div>
                  <label className="text-sm font-medium leading-none text-slate-900 mb-2 block">
                    Login Email
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm cursor-not-allowed">
                    <Mail size={16} />
                    {user?.email}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                    Account email is managed by the system administrator.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* INTEGRATIONS TAB */}
        {activeTab === "integrations" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LinkItem
                title="Teacher Portal"
                description="Daily log submission interface."
                url={
                  schoolId
                    ? `${window.location.protocol}//${window.location.host}/submission/${schoolId}`
                    : "..."
                }
                icon={FileText}
              />
              <LinkItem
                title="AI Tutor"
                description="Student access for AI assistance."
                url={
                  schoolId
                    ? `${window.location.protocol}//${window.location.host}/ai-tutor/${schoolId}`
                    : "..."
                }
                icon={Bot}
              />
              <LinkItem
                title="Parent Portal"
                description="Progress reports and analytics."
                url={
                  schoolId
                    ? `${window.location.protocol}//${window.location.host}/portal/${schoolId}`
                    : "..."
                }
                icon={Users}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
