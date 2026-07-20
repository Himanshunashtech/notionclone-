"use client";

import Image from "next/image";
import { useUser } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { useMutation } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCustomLandingPage } from "@/hooks/useCustomLandingPage";
import { useEffect } from "react";

const DocumentsPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const create = useMutation(api.documents.create);
  const { customLandingPageId, isLoading } = useCustomLandingPage();

  useEffect(() => {
    if (!isLoading && customLandingPageId) {
      router.push(`/documents/${customLandingPageId}`);
    }
  }, [customLandingPageId, isLoading, router]);

  const onCreate = () => {
    const promise = create({ title: "Untitled" }).then((documentId) =>
      router.push(`/documents/${documentId}`),
    );

    toast.promise(promise, {
      loading: "Creating a new note....",
      success: "New note created!",
      error: "Failed to create a new note.",
    });
  };

  if (isLoading || customLandingPageId) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.svg"
        alt="empty"
        height={760}
        width={1036}
        priority
        className="size-75 dark:hidden"
      />
      <Image
        src="/empty-dark.svg"
        alt="empty"
        height={760}
        width={1036}
        priority
        className="hidden size-75 dark:block"
      />
      <h2 className="text-lg font-medium">
        Welcome to {user?.firstName}&apos;s Zotion
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create a note
      </Button>
    </div>
  );
};
export default DocumentsPage;
