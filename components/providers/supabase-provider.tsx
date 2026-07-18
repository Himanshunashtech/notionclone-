"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { toast } from "sonner";

type SupabaseContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabaseAuth must be used within a SupabaseProvider");
  }
  return {
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    signOut: context.signOut,
    userId: context.user?.id || null,
    openUserProfile: () => {
      toast.info("Account details are managed through your profile settings.");
    },
  };
};

export const useSupabaseUser = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabaseUser must be used within a SupabaseProvider");
  }

  const user = context.user;
  return {
    isSignedIn: !!user,
    user: user
      ? {
          id: user.id,
          fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User",
          imageUrl: user.user_metadata?.avatar_url || "/placeholder-avatar.png", // Fallback avatar image
          emailAddresses: [{ emailAddress: user.email || "" }],
        }
      : null,
    isLoading: context.isLoading,
  };
};

export const useConvexAuth = useSupabaseAuth;
export const useUser = useSupabaseUser;

