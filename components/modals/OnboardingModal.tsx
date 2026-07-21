"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/hooks/useOnboardingModal";
import { useUser } from "@/components/providers/supabase-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Users, 
  Sparkles, 
  ArrowRight, 
  Camera, 
  Loader2, 
  User as UserIcon,
  ChevronRight,
  Sparkle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const OnboardingModal = () => {
  const onboarding = useOnboarding();
  const { user } = useUser();
  
  // Steps: "profile" | "teamspace"
  const [step, setStep] = useState<"profile" | "teamspace">("profile");
  
  // Step 1: Profile states
  const [fullName, setFullName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Teamspace states
  const [teamName, setTeamName] = useState("");
  const [isLoadingSpace, setIsLoadingSpace] = useState(false);

  // Sync state with logged in user metadata
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
    }
  }, [user, onboarding.isOpen]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to 'files' bucket
      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("files").getPublicUrl(filePath);

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        },
      });
      if (authError) throw authError;

      // Update public profile table
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
        })
        .eq("id", user.id);
      if (dbError) throw dbError;

      toast.success("Avatar uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName.trim()) return;

    try {
      setIsSaving(true);
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
        },
      });
      if (authError) throw authError;

      // Update public profile table
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
        })
        .eq("id", user.id);
      if (dbError) throw dbError;

      toast.success("Profile saved!");
      setStep("teamspace");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTeamspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = teamName.trim();
    if (!name) return;

    setIsLoadingSpace(true);
    try {
      await onboarding.onComplete(name);
    } finally {
      setIsLoadingSpace(false);
    }
  };

  return (
    <Dialog open={onboarding.isOpen} onOpenChange={() => { }}>
      <DialogTitle className="sr-only">Welcome Onboarding</DialogTitle>
      <DialogDescription className="sr-only">
        Set up your profile and your first teamspace.
      </DialogDescription>
      <DialogContent
        className="max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-850 text-white min-h-[480px] flex flex-col justify-between p-8">
          {step === "profile" ? (
            <div className="flex-1 flex flex-col justify-between">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-1">
                  <div className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Sparkle className="h-3 w-3 fill-indigo-400" />
                    Step 1 of 2: Create Profile
                  </div>
                </div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                  Let's set up your profile
                </h1>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                  Choose a public avatar and set your display name so your team knows who you are.
                </p>
              </div>

              {/* Avatar Upload */}
              <div className="flex flex-col items-center my-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="h-24 w-24 border-2 border-white/10 group-hover:border-indigo-500/50 transition-all duration-300 shadow-xl">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback className="text-2xl font-bold bg-indigo-950 text-indigo-300">
                      {fullName?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Upload Overlay */}
                  <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="h-5 w-5 text-white mb-1" />
                    <span className="text-[10px] text-white font-medium">Upload</span>
                  </div>

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/75 rounded-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                    </div>
                  )}
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading || isSaving}
                />
                
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition mt-3 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full border border-indigo-500/25"
                >
                  Upload Photo
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5 text-neutral-400" />
                    Your Full Name
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 h-11"
                    maxLength={50}
                    disabled={isSaving || isUploading}
                    required
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold border-0 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-x-2"
                  disabled={!fullName.trim() || isSaving || isUploading}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving profile...
                    </>
                  ) : (
                    <>
                      Continue to Next Step
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-1">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                    <Sparkles className="h-3 w-3 fill-emerald-400" />
                    Step 2 of 2: Create Space
                  </div>
                </div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                  Name your team space
                </h1>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                  This will be your workspace. Projects, Meetings, Docs, Tasks, and Goals will be set up automatically.
                </p>
              </div>

              {/* Features preview */}
              <div className="grid grid-cols-3 gap-2 my-5">
                {[
                  { icon: "🍻", label: "Projects" },
                  { icon: "📅", label: "Meetings" },
                  { icon: "📘", label: "Docs" },
                  { icon: "📋", label: "Tasks" },
                  { icon: "💡", label: "Brainstorm" },
                  { icon: "🏁", label: "Goals" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-xl py-2 px-1.5 text-center"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[9px] text-neutral-400 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Input area */}
              <form onSubmit={handleTeamspaceSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-neutral-400" />
                    Team Space Name
                  </label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. My Team, Acme Corp, Design Studio…"
                    className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 h-11"
                    autoFocus
                    maxLength={80}
                    disabled={isLoadingSpace}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("profile")}
                    className="flex-1 h-11 border border-white/10 rounded-md hover:bg-white/5 text-sm text-neutral-350 transition-all font-semibold"
                    disabled={isLoadingSpace}
                  >
                    Back
                  </button>
                  <Button
                    type="submit"
                    className="flex-[2] h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold border-0 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-x-2"
                    disabled={!teamName.trim() || isLoadingSpace}
                  >
                    {isLoadingSpace ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
