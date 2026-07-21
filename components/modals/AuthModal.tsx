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
import { useAuthModal } from "@/hooks/use-auth-modal";
import { supabase } from "@/lib/supabase";

export const AuthModal = () => {
  const authModal = useAuthModal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError(null);

    const isPlaceholder = 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-project") ||
      (supabase as any).supabaseUrl?.includes("your-supabase-project");

    if (isPlaceholder) {
      const msg = "Connection failed! Please configure your Supabase URL and Anon Key in .env.local.";
      setError(msg);
      setIsLoading(false);
      return;
    }

    try {
      const options: any = {
        redirectTo: `${window.location.origin}/documents`,
      };

      if (provider === "google") {
        options.queryParams = {
          access_type: "offline",
          prompt: "consent",
        };
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1077696862984-amk8qgv97ou6vdjgvuvia1jir7juv86u.apps.googleusercontent.com";
        if (clientId) {
          options.queryParams.client_id = clientId;
        }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });

      if (error) throw error;
    } catch (err: any) {
      console.error(`${provider} sign in error:`, err);
      setError(err.message || `Failed to sign in with ${provider}.`);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={authModal.isOpen} onOpenChange={authModal.onClose}>
      <DialogTitle hidden>Authentication</DialogTitle>
      <DialogContent className="sm:max-w-[420px] rounded-xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-xl">
        <DialogHeader className="space-y-2 mb-6">
          <div className="flex justify-center mb-2">
            <img
              src="/logo.svg"
              alt="App Logo"
              className="h-10 w-auto block dark:hidden"
            />
            <img
              src="/logo-dark.svg"
              alt="App Logo"
              className="h-10 w-auto hidden dark:block"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-center text-neutral-900 dark:text-neutral-50">
            Welcome to Zotion
          </h2>
          <DialogDescription className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
            Sign in or sign up to collaborate on your documents.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-lg p-3 text-center font-medium mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-y-3">
          <Button
            disabled={isLoading}
            onClick={() => handleOAuthSignIn("google")}
            variant="outline"
            className="w-full flex items-center justify-center gap-x-3 py-6 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition duration-200 font-medium"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continue with Google
          </Button>

          <Button
            disabled={isLoading}
            onClick={() => handleOAuthSignIn("github")}
            variant="outline"
            className="w-full flex items-center justify-center gap-x-3 py-6 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition duration-200 font-medium"
          >
            <svg className="h-5 w-5 fill-current text-neutral-900 dark:text-neutral-50" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </Button>
        </div>

        <div className="text-center text-xs text-neutral-400 dark:text-neutral-500 mt-6 border-t border-neutral-100 dark:border-neutral-800 pt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  );
};
