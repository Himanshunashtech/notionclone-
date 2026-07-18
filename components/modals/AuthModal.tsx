"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, X } from "lucide-react";

export const AuthModal = () => {
  const authModal = useAuthModal();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const isPlaceholder = 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-project") ||
      (supabase as any).supabaseUrl?.includes("your-supabase-project");

    if (isPlaceholder) {
      const msg = "Connection failed! Please configure your Supabase URL and Anon Key in .env.local.";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
      return;
    }

    try {
      if (authModal.view === "signup") {
        const hasMinLength = password.length >= 8;
        const hasCapital = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!hasMinLength || !hasCapital || !hasNumber || !hasSpecial) {
          const msg = "Password does not meet the requirements.";
          setError(msg);
          toast.error(msg);
          setIsLoading(false);
          return;
        }

        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success("Registration successful! Check your email (or log in directly if auto-confirmed).");
        authModal.onClose();
        router.refresh();
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Logged in successfully!");
        authModal.onClose();
        router.push("/documents");
        router.refresh();
      }
    } catch (err: any) {
      console.warn("Authentication failure:", err.message || err);
      const isFetchError = err instanceof TypeError || (err.message && err.message.includes("fetch"));
      const msg = isFetchError
        ? "Connection failed! Please configure your Supabase URL and Anon Key in .env.local."
        : err.message || "An error occurred during authentication.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={authModal.isOpen} onOpenChange={authModal.onClose}>
      <DialogTitle hidden>Authentication</DialogTitle>
      <DialogContent className="sm:max-w-[425px] dark:bg-dark p-6">
        <DialogHeader className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-center">
            {authModal.view === "signup" ? "Create an account" : "Welcome back"}
          </h2>
          <DialogDescription className="text-sm text-muted-foreground text-center">
            {authModal.view === "signup"
              ? "Enter your details to create your Zotion account"
              : "Enter your email and password to log in"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-md p-3 text-center font-medium leading-relaxed">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent border-primary/20 focus-visible:ring-primary/45"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoComplete={authModal.view === "signup" ? "new-password" : "current-password"}
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent border-primary/20 focus-visible:ring-primary/45 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {authModal.view === "signup" && password.length > 0 && (
            <div className="flex items-center justify-between mt-2 border border-primary/10 rounded-md p-3 bg-primary/5">
              <span className="text-xs font-semibold text-muted-foreground">Validation status:</span>
              <div className="flex items-center gap-x-3">
                {/* 1. At least 8 characters */}
                <span title="At least 8 characters">
                  {password.length >= 8 ? (
                    <Check className="h-4 w-4 text-emerald-500 stroke-[3px]" />
                  ) : (
                    <X className="h-4 w-4 text-rose-500 stroke-[3px]" />
                  )}
                </span>
                {/* 2. Capital letter */}
                <span title="A capital letter">
                  {/[A-Z]/.test(password) ? (
                    <Check className="h-4 w-4 text-emerald-500 stroke-[3px]" />
                  ) : (
                    <X className="h-4 w-4 text-rose-500 stroke-[3px]" />
                  )}
                </span>
                {/* 3. Number */}
                <span title="A number">
                  {/[0-9]/.test(password) ? (
                    <Check className="h-4 w-4 text-emerald-500 stroke-[3px]" />
                  ) : (
                    <X className="h-4 w-4 text-rose-500 stroke-[3px]" />
                  )}
                </span>
                {/* 4. Special character */}
                <span title="A special character">
                  {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? (
                    <Check className="h-4 w-4 text-emerald-500 stroke-[3px]" />
                  ) : (
                    <X className="h-4 w-4 text-rose-500 stroke-[3px]" />
                  )}
                </span>
              </div>
            </div>
          )}
          <Button disabled={isLoading} className="w-full mt-4" type="submit">
            {isLoading
              ? "Please wait..."
              : authModal.view === "signup"
                ? "Sign Up"
                : "Sign In"}
          </Button>
        </form>
        <div className="flex flex-col items-center gap-y-2 text-xs text-muted-foreground mt-2 border-t pt-4 border-primary/10">
          {authModal.view === "signup" ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => authModal.onOpen("login")}
                className="underline hover:text-primary font-medium"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => authModal.onOpen("signup")}
                className="underline hover:text-primary font-medium"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
