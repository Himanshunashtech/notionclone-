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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAccount } from "@/hooks/useAccountModal";
import { useUser } from "@/components/providers/supabase-provider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload, Folder, User, Settings, Globe, Lock } from "lucide-react";

export const AccountModal = () => {
  const accountModal = useAccount();
  const { user } = useUser();

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buckets State
  const [buckets, setBuckets] = useState<any[]>([]);
  const [newBucketName, setNewBucketName] = useState("");
  const [isBucketPublic, setIsBucketPublic] = useState(true);
  const [isLoadingBuckets, setIsLoadingBuckets] = useState(false);
  const [isCreatingBucket, setIsCreatingBucket] = useState(false);

  // Sync state with logged in user metadata
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
    }
  }, [user, accountModal.isOpen]);

  // Fetch buckets when modal opens or on Buckets tab selection
  const fetchBuckets = async () => {
    try {
      setIsLoadingBuckets(true);
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      setBuckets(data || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to load buckets");
    } finally {
      setIsLoadingBuckets(false);
    }
  };

  useEffect(() => {
    if (accountModal.isOpen) {
      fetchBuckets();
    }
  }, [accountModal.isOpen]);

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

  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName.trim()) return;

    try {
      setIsCreatingBucket(true);
      const name = newBucketName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
      
      const { error } = await supabase.storage.createBucket(name, {
        public: isBucketPublic,
        allowedMimeTypes: ["image/*", "application/pdf"], // optional restriction
      });

      if (error) throw error;

      toast.success(`Bucket "${name}" created successfully!`);
      setNewBucketName("");
      fetchBuckets();
    } catch (error: any) {
      toast.error(error.message || "Failed to create bucket");
    } finally {
      setIsCreatingBucket(false);
    }
  };

  const handleDeleteBucket = async (id: string) => {
    if (id === "files") {
      toast.error("The default 'files' bucket cannot be deleted.");
      return;
    }
    
    try {
      const { error } = await supabase.storage.deleteBucket(id);
      if (error) throw error;
      toast.success("Bucket deleted successfully!");
      fetchBuckets();
    } catch (error: any) {
      toast.error(
        error.message || "Failed to delete bucket. Note: The bucket must be completely empty first."
      );
    }
  };

  return (
    <Dialog open={accountModal.isOpen} onOpenChange={accountModal.onClose}>
      <DialogTitle hidden>Manage Account</DialogTitle>
      <DialogDescription className="sr-only">
        Update your personal profile, upload avatar images, and manage Supabase storage buckets.
      </DialogDescription>
      <DialogContent className="max-w-2xl dark:bg-dark p-0 overflow-hidden">
        <DialogHeader className="border-b px-6 pt-6 pb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Account Management
          </h2>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full flex flex-col md:flex-row h-[480px]">
          <TabsList className="flex md:flex-col justify-start items-stretch border-r border-b md:border-b-0 h-auto rounded-none bg-transparent p-2 gap-1 w-full md:w-48 shrink-0">
            <TabsTrigger
              value="profile"
              className="justify-start gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-md"
            >
              <User className="h-4 w-4" />
              Profile Details
            </TabsTrigger>
            <TabsTrigger
              value="storage"
              className="justify-start gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-md"
              onClick={fetchBuckets}
            >
              <Folder className="h-4 w-4" />
              Storage Buckets
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 p-6 overflow-y-auto">
            {/* Profile Tab */}
            <TabsContent value="profile" className="m-0 space-y-6">
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
            </TabsContent>

            {/* Storage Buckets Tab */}
            <TabsContent value="storage" className="m-0 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Supabase Storage Buckets</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage raw files storage buckets configured in Supabase.
                </p>
              </div>

              {/* Bucket Creator Form */}
              <form onSubmit={handleCreateBucket} className="p-4 rounded-lg border bg-card/50 space-y-4">
                <div className="font-medium text-sm">Create New Bucket</div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Bucket ID (e.g. user-assets)"
                      value={newBucketName}
                      onChange={(e) => setNewBucketName(e.target.value)}
                      disabled={isCreatingBucket}
                      className="h-9"
                    />
                  </div>
                  <div className="flex items-center gap-4 py-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="public-bucket" className="text-xs flex items-center gap-1 cursor-pointer">
                        {isBucketPublic ? <Globe className="h-3.5 w-3.5 text-muted-foreground" /> : <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                        Public Bucket
                      </Label>
                      <Switch
                        id="public-bucket"
                        checked={isBucketPublic}
                        onCheckedChange={setIsBucketPublic}
                        disabled={isCreatingBucket}
                      />
                    </div>
                    <Button type="submit" size="sm" disabled={isCreatingBucket || !newBucketName.trim()}>
                      {isCreatingBucket ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                      Create
                    </Button>
                  </div>
                </div>
              </form>

              {/* Buckets List */}
              <div className="space-y-3">
                <div className="font-medium text-sm flex items-center justify-between">
                  <span>Available Buckets ({buckets.length})</span>
                  {isLoadingBuckets && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                <div className="divide-y border rounded-lg overflow-hidden bg-background">
                  {buckets.length === 0 && !isLoadingBuckets ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No buckets found.
                    </div>
                  ) : (
                    buckets.map((bucket) => (
                      <div key={bucket.id} className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-primary/5 rounded-md flex items-center justify-center text-primary">
                            <Folder className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-1.5">
                              {bucket.name}
                              {bucket.public ? (
                                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Globe className="h-2.5 w-2.5" /> Public
                                </span>
                              ) : (
                                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Lock className="h-2.5 w-2.5" /> Private
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              Created: {new Date(bucket.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {bucket.id !== "files" ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteBucket(bucket.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Delete Bucket"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium px-2 py-1">
                            System
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
