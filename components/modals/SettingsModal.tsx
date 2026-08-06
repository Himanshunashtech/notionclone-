"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettingsModal";
import { ModeToggle } from "../mode-toggle";
import { EditorFont, useEditorFont } from "@/hooks/useEditorFont";
import { useFocusMode } from "@/hooks/useFocusMode";
import { fontFamilies } from "@/lib/editorFont";
import { useCustomLandingPage } from "@/hooks/useCustomLandingPage";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/components/providers/supabase-provider";
import {
  User,
  Sliders,
  Bell,
  Mail,
  Settings,
  Users,
  Download,
  Sparkles,
  Link2,
  Cpu,
  Globe,
  Smile,
  Layers,
  ShieldCheck,
  KeyRound,
  CreditCard,
  Check,
  Plus,
  Upload,
  X,
  Laptop,
  Moon,
  Sun,
  Type,
  Lock,
  ChevronRight
} from "lucide-react";

type SettingsTab =
  | "account"
  | "preferences"
  | "notifications"
  | "mail-calendar"
  | "general"
  | "people"
  | "import"
  | "ai"
  | "connections"
  | "mcp"
  | "public-pages"
  | "emoji"
  | "teamspaces"
  | "security"
  | "identity"
  | "billing";

const FONTS: { label: string; value: EditorFont }[] = [
  { label: "Default", value: "default" },
  { label: "Sans", value: "Lora" },
  { label: "Mono", value: "JetBrains Mono" },
];

export const SettingsModal = () => {
  const settings = useSettings();
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  
  const { editorFont, setEditorFont } = useEditorFont({
    enabled: settings.isOpen,
  });
  const { focusMode, setFocusMode } = useFocusMode({
    enabled: settings.isOpen,
  });
  const { customLandingPageId, enableCustomLandingPage, disableCustomLandingPage } = useCustomLandingPage();

  const [workspaceName, setWorkspaceName] = useState(
    user?.fullName ? `${user.fullName}'s Space` : "Sonu's Space"
  );
  const [showCalendarSidebar, setShowCalendarSidebar] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [activityDigest, setActivityDigest] = useState(true);
  const [aiModel, setAiModel] = useState("GPT-4o (Default)");

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">General</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Manage your workspace name, domains, and core preferences
              </p>
            </div>

            {/* Workspace settings */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Workspace settings
              </h3>

              {/* Workspace name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Workspace name
                </Label>
                <p className="text-[11px] text-neutral-400">
                  Your workspace name can be up to 65 characters
                </p>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full max-w-md text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Icon */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Icon
                </Label>
                <p className="text-[11px] text-neutral-400">
                  Upload an image or pick an emoji. This icon will appear in your sidebar and notifications
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-lg font-bold text-neutral-700 dark:text-neutral-300">
                    {workspaceName ? workspaceName.charAt(0).toUpperCase() : "Z"}
                  </div>
                  <button
                    onClick={() => toast.info("Icon upload updated")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    Change icon
                  </button>
                </div>
              </div>

              {/* Custom landing page */}
              <div className="flex items-center justify-between gap-4 py-2 border-t border-neutral-100 dark:border-neutral-800">
                <div>
                  <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Custom landing page
                  </Label>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    When a new member joins this workspace, this will be the first page they land on.
                  </p>
                </div>
                <Switch
                  checked={!!customLandingPageId}
                  onCheckedChange={async (checked) => {
                    if (checked) {
                      const promise = enableCustomLandingPage().then((id) => {
                        router.push(`/documents/${id}`);
                        settings.onClose();
                      });
                      toast.promise(promise, {
                        loading: "Enabling custom workspace landing page...",
                        success: "Custom landing page enabled!",
                        error: "Failed to enable custom landing page."
                      });
                    } else {
                      const promise = disableCustomLandingPage();
                      toast.promise(promise, {
                        loading: "Disabling custom workspace landing page...",
                        success: "Custom landing page disabled.",
                        error: "Failed to disable custom landing page."
                      });
                    }
                  }}
                />
              </div>

              {/* Sidebar Settings */}
              <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Sidebar</h4>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Show other Zotion apps in sidebar
                    </Label>
                    <p className="text-[11px] text-neutral-400">
                      Show Zotion Calendar in your sidebar
                    </p>
                  </div>
                  <Switch
                    checked={showCalendarSidebar}
                    onCheckedChange={setShowCalendarSidebar}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">My Account</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Manage your personal profile and account credentials
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850">
                <div className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold border border-blue-500/30 shrink-0">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {user?.fullName || "User Account"}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {user?.emailAddresses[0]?.emailAddress || "user@example.com"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Preferred Display Name</Label>
                  <input
                    type="text"
                    defaultValue={user?.fullName || ""}
                    className="w-full max-w-md text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850"
                  />
                </div>

                <div className="space-y-1 pt-2">
                  <Label className="text-xs font-semibold">Email Address</Label>
                  <input
                    type="email"
                    disabled
                    value={user?.emailAddresses[0]?.emailAddress || ""}
                    className="w-full max-w-md text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-200/50 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Preferences</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Customize look and feel, theme, font, and focus options
              </p>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col gap-y-1">
                  <Label className="text-xs font-semibold">Appearance Theme</Label>
                  <span className="text-[11px] text-neutral-400">
                    Customize how Zotion looks on your device.
                  </span>
                </div>
                <ModeToggle />
              </div>

              <div className="flex flex-col gap-y-3 pt-4">
                <div className="flex flex-col gap-y-1">
                  <Label className="text-xs font-semibold">Editor Font Family</Label>
                  <span className="text-[11px] text-neutral-400">
                    Choose the primary font used across the editor.
                  </span>
                </div>
                <div className="flex gap-2 max-w-md">
                  {FONTS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setEditorFont(option.value)}
                      className={cn(
                        "hover:bg-neutral-100 dark:hover:bg-neutral-800 flex flex-1 flex-col items-center gap-1 rounded-lg border p-2.5 text-sm transition",
                        editorFont === option.value && "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold",
                      )}
                    >
                      <span
                        className="text-lg font-medium"
                        style={{ fontFamily: fontFamilies[option.value] }}
                      >
                        Ag
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4">
                <div className="flex flex-col gap-y-1">
                  <Label className="text-xs font-semibold">Focus Mode</Label>
                  <span className="text-[11px] text-neutral-400">
                    Collapse sidebar and topbar for zero-distraction editing.
                  </span>
                </div>
                <Switch checked={focusMode} onCheckedChange={setFocusMode} />
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Notifications</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Configure email alerts, digests, and push updates
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <Label className="text-xs font-semibold">Email Digest Notifications</Label>
                  <p className="text-[11px] text-neutral-400">Receive daily summary of edits and comments</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <Label className="text-xs font-semibold">Teamspace Activity Alerts</Label>
                  <p className="text-[11px] text-neutral-400">Get notified when new pages or comments are added</p>
                </div>
                <Switch checked={activityDigest} onCheckedChange={setActivityDigest} />
              </div>
            </div>
          </div>
        );

      case "people":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">People & Members</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Manage workspace collaborators and access levels
                </p>
              </div>
              <button
                onClick={() => toast.success("Invite link copied to clipboard")}
                className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800">
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-850">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{user?.fullName || "Owner"}</span>
                    <span className="text-[10px] text-neutral-400">{user?.emailAddresses[0]?.emailAddress}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Workspace Owner
                </span>
              </div>
            </div>
          </div>
        );

      case "import":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Import Data</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Import documents from Word, Markdown, CSV, or HTML
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["Microsoft Word (.docx)", "Markdown (.md)", "CSV Data (.csv)", "HTML Web Page (.html)", "Trello Export"].map((format) => (
                <button
                  key={format}
                  onClick={() => toast.info(`Select a ${format} file to import`)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition text-left"
                >
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{format}</span>
                  <Upload className="h-4 w-4 text-neutral-400" />
                </button>
              ))}
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Zotion AI</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Configure AI assistant models and writing completions
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Default AI Model</Label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full max-w-xs text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850"
                >
                  <option>GPT-4o (Default)</option>
                  <option>Claude 3.5 Sonnet</option>
                  <option>Gemini 1.5 Pro</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white capitalize">
                {activeTab.replace("-", " ")}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Workspace configuration for {activeTab.replace("-", " ")}
              </p>
            </div>

            <div className="p-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
              <Settings className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {activeTab.toUpperCase()} Settings Panel
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                UI configured. Database connections ready for configuration.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={settings.isOpen} onOpenChange={settings.onClose}>
      <DialogTitle hidden>Settings & Members</DialogTitle>
      <DialogDescription className="sr-only">
        Manage workspace name, account preferences, members, connections, and features.
      </DialogDescription>

      <DialogContent className="max-w-[80vw] w-[80vw] sm:max-w-[80vw] h-[85vh] max-h-[85vh] p-0 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl flex flex-row">
        
        {/* Left Modal Sidebar */}
        <div className="w-[260px] border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850/70 flex flex-col p-4 overflow-y-auto shrink-0 select-none scrollbar-thin">
          
          {/* Account Category */}
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-1.5 block">
              Account
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveTab("account")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "account"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                  {user?.fullName?.charAt(0) || "U"}
                </div>
                <span className="truncate">{user?.fullName || "User Profile"}</span>
              </button>

              <button
                onClick={() => setActiveTab("preferences")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "preferences"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <Sliders className="h-4 w-4 text-neutral-455" />
                <span>Preferences</span>
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "notifications"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <Bell className="h-4 w-4 text-neutral-455" />
                <span>Notifications</span>
              </button>

              <button
                onClick={() => setActiveTab("mail-calendar")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "mail-calendar"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <Mail className="h-4 w-4 text-neutral-455" />
                <span>Mail & Calendar</span>
              </button>
            </div>
          </div>

          {/* Workspace Category */}
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-1.5 block">
              Workspace
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveTab("general")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "general"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <Settings className="h-4 w-4 text-neutral-455" />
                <span>General</span>
              </button>

              <button
                onClick={() => setActiveTab("people")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "people"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <Users className="h-4 w-4 text-neutral-455" />
                <span>People</span>
              </button>

              <button
                onClick={() => setActiveTab("import")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "import"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <Download className="h-4 w-4 text-neutral-455" />
                <span>Import</span>
              </button>
            </div>
          </div>

          {/* Features Category */}
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-1.5 block">
              Features
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveTab("ai")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "ai"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <Sparkles className="h-4 w-4 text-neutral-455" />
                <span>Zotion AI</span>
              </button>

              <button
                onClick={() => setActiveTab("connections")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "connections"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <Link2 className="h-4 w-4 text-neutral-455" />
                <span>Connections</span>
              </button>

              <button
                onClick={() => setActiveTab("mcp")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "mcp"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <Cpu className="h-4 w-4 text-neutral-455" />
                <span>Zotion MCP</span>
              </button>

              <button
                onClick={() => setActiveTab("public-pages")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "public-pages"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <Globe className="h-4 w-4 text-neutral-455" />
                <span>Public pages</span>
              </button>

              <button
                onClick={() => setActiveTab("emoji")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "emoji"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <Smile className="h-4 w-4 text-neutral-455" />
                <span>Emoji</span>
              </button>
            </div>
          </div>

          {/* Admin Category */}
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-1.5 block">
              Admin
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => setActiveTab("teamspaces")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "teamspaces"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <Layers className="h-4 w-4 text-neutral-455" />
                <span>Teamspaces</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "security"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <ShieldCheck className="h-4 w-4 text-neutral-455" />
                <span>Security</span>
              </button>

              <button
                onClick={() => setActiveTab("identity")}
                className={cn(
                  "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                  activeTab === "identity"
                    ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                )}
              >
                <KeyRound className="h-4 w-4 text-neutral-455" />
                <span>Identity</span>
              </button>
            </div>
          </div>

          {/* Access & Billing */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 mb-1.5 block">
              Access & billing
            </span>
            <button
              onClick={() => setActiveTab("billing")}
              className={cn(
                "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg text-xs font-medium transition text-left",
                activeTab === "billing"
                  ? "bg-neutral-200/80 dark:bg-neutral-750 text-neutral-900 dark:text-white font-bold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
              )}
            >
              <CreditCard className="h-4 w-4 text-neutral-455" />
              <span>Billing & Plans</span>
            </button>
          </div>

        </div>

        {/* Right Main Modal Content Panel */}
        <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-neutral-900 relative">
          {renderTabContent()}
        </div>

      </DialogContent>
    </Dialog>
  );
};

