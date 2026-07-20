"use client";

import { useQuery } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { File, FolderOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { isDatabase } from "@/components/database/database-utils";
import { DatabaseView } from "@/components/database/DatabaseView";

interface SubpagesListProps {
  documentId: string;
  preview?: boolean;
}

export const SubpagesList = ({ documentId, preview = false }: SubpagesListProps) => {
  const subpages = useQuery(api.documents.getSidebar, {
    parentDocument: documentId,
  });

  if (subpages === undefined) {
    return (
      <div className="flex items-center gap-x-2 text-xs text-muted-foreground mt-4">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading subpages...</span>
      </div>
    );
  }

  const visibleSubpages = preview
    ? (subpages || []).filter((sub) => sub.isPublished)
    : subpages;

  if (!visibleSubpages || visibleSubpages.length === 0) {
    return null;
  }

  const databaseSubpages = (visibleSubpages || []).filter((sub) => isDatabase(sub.content));
  const documentSubpages = (visibleSubpages || []).filter((sub) => !isDatabase(sub.content));

  return (
    <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-8">
      {/* Inline Database Views */}
      {databaseSubpages.map((subpage) => (
        <div key={subpage._id} className="space-y-3">
          <div className="flex items-center justify-between">
            <Link
              href={preview ? `/preview/${subpage._id}` : `/documents/${subpage._id}`}
              className="text-lg font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-x-2 w-fit"
            >
              {subpage.icon ? (
                <span className="text-xl leading-none shrink-0">{subpage.icon}</span>
              ) : (
                <FolderOpen className="h-5 w-5 shrink-0 text-muted-foreground" />
              )}
              <span>{subpage.title || "Untitled"}</span>
            </Link>
          </div>
          <DatabaseView
            documentId={subpage._id}
            initialContent={subpage.content}
            preview={preview}
          />
        </div>
      ))}

      {/* Document Subpages Grid Links */}
      {documentSubpages.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-900">
          <div className="flex items-center gap-x-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
            <File className="h-4 w-4" />
            <span>Subpages</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {documentSubpages.map((subpage) => {
              const href = preview
                ? `/preview/${subpage._id}`
                : `/documents/${subpage._id}`;

              return (
                <Link
                  key={subpage._id}
                  href={href}
                  className="flex items-center gap-x-2 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition group"
                >
                  {subpage.icon ? (
                    <span className="text-lg leading-none shrink-0">{subpage.icon}</span>
                  ) : (
                    <File className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition" />
                  )}
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition truncate">
                    {subpage.title || "Untitled"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
