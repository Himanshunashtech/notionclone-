"use client";

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAccount } from "@/hooks/useAccountModal";
import { useUser } from "@/components/providers/supabase-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Upload, User, Settings } from "lucide-react";

export const AccountModal = () => {
  const accountModal = useAccount();
  const { user } = useUser();

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with logged in user metadata
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
    }
  }, [user, accountModal.isOpen]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      });
      if (authError) throw authError;

      // Update public profile table
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
        })
        .eq("id", user.id);
      if (dbError) throw dbError;

      toast.success("Profile details updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to 'files' bucket (created by default in migrations)
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

  const handleRemoveAvatar = async () => {
    if (!user) return;
    try {
      setIsSaving(true);

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          avatar_url: null,
        },
      });
      if (authError) throw authError;

      // Update public profile table
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          avatar_url: null,
        })
        .eq("id", user.id);
      if (dbError) throw dbError;

      toast.success("Avatar removed.");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove avatar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={accountModal.isOpen} onOpenChange={accountModal.onClose}>
      <DialogTitle hidden>Manage Account</DialogTitle>
      <DialogDescription className="sr-only">
        Update your personal profile and upload avatar images.
      </DialogDescription>
      <DialogContent className="max-w-xl dark:bg-dark p-0 overflow-hidden">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Account Management
          </h2>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[480px]">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Personal Profile</h3>
            <p className="text-sm text-muted-foreground">
              Manage your public avatar and display settings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg border bg-card/50">
            <div className="relative group">
              <Avatar className="h-20 w-20 border">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="text-lg uppercase">
                  {user?.fullName?.substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUploading || isSaving}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Photo
                </Button>
                {user?.imageUrl && user.imageUrl !== "/placeholder-avatar.png" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isUploading || isSaving}
                    onClick={handleRemoveAvatar}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or SVG. Max size 2MB.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.emailAddresses[0]?.emailAddress || ""}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Email address is tied to authentication and cannot be changed here.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                disabled={isSaving || isUploading}
              />
            </div>

            <Button
              onClick={handleUpdateProfile}
              disabled={isSaving || isUploading || !fullName.trim()}
              className="w-full sm:w-auto"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Profile Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
