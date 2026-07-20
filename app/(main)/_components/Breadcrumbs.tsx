"use client";

import { useQuery } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { Id } from "@/lib/supabase-db";
import { Home, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DocumentIcon } from "@/components/document-icon";

interface BreadcrumbsProps {
  documentId: string;
}

export const Breadcrumbs = ({ documentId }: BreadcrumbsProps) => {
  const router = useRouter();

  const path = useQuery(api.documents.getAncestors, {
    documentId: documentId as Id<"documents">,
  });

  if (path === undefined) {
    return (
      <div className="flex items-center gap-x-2">
        <div className="h-6 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <span className="text-muted-foreground/40 font-normal">/</span>
        <div className="h-6 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    );
  }

  if (!path || path.length <= 1) {
    return null;
  }

  // We show all ancestors (excluding the current page itself, since the current title is handled by Title component)
  const ancestors = path.slice(0, -1);

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 overflow-hidden">
      {ancestors.map((doc, index) => {
        const isRoot = index === 0;

        return (
          <div key={doc._id} className="flex items-center gap-x-1.5">
            <Button
              onClick={() => router.push(`/documents/${doc._id}`)}
              variant="ghost"
              size="sm"
              className="h-7 px-1.5 text-sm font-normal text-muted-foreground hover:text-foreground flex items-center gap-x-1.5 max-w-[120px] md:max-w-[200px] truncate"
            >
              {doc.icon ? (
                <DocumentIcon icon={doc.icon} className="h-4.5 w-4.5 text-base" />
              ) : isRoot ? (
                <div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 shrink-0">
                  <Home className="h-3 w-3" />
                </div>
              ) : (
                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              <span className="truncate">{doc.title || "Untitled"}</span>
            </Button>
            <span className="text-muted-foreground/40 font-normal text-sm select-none">/</span>
          </div>
        );
      })}
    </div>
  );
};
