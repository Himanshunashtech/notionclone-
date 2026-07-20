"use client";

import { useEffect } from "react";
import { Spinner } from "@/components/spinner";
import { useConvexAuth } from "@/components/providers/supabase-provider";
import { useRouter, usePathname } from "next/navigation";
import Navigation from "./_components/Navigation";
import { SearchCommand } from "@/components/search-command";

import { MentionModalProvider } from "@/hooks/useMentionModal";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    import("@/components/editor");
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="dark:bg-dark flex h-full items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  const isCalendar = pathname === "/calendar";

  return (
    <MentionModalProvider>
      <div className="dark:bg-dark flex h-full">
        {!isCalendar && <Navigation />}
        <main className="h-full flex-1 overflow-y-auto">
          <SearchCommand />
          {children}
        </main>
      </div>
    </MentionModalProvider>
  );
};
export default MainLayout;
