"use client";

import dynamic from "next/dynamic";
import { useMemo, use } from "react";

import { Cover } from "@/components/cover";
import { Toolbar } from "@/components/toolbar";
import { Skeleton } from "@/components/ui/skeleton";

import { api } from "@/lib/supabase-db";
import { Id } from "@/lib/supabase-db";
import { useQuery, useMutation } from "@/hooks/use-supabase-db";
import { SubpagesList } from "@/components/subpages-list";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { isDatabase } from "@/components/database/database-utils";
import { DatabaseView } from "@/components/database/DatabaseView";

interface DocumentIdPageProps {
  params:
    | Promise<{
        documentId: Id<"documents">;
      }>
    | {
        documentId: Id<"documents">;
      };
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  const resolvedParams =
    params && typeof (params as any).then === "function"
      ? use(params as Promise<any>)
      : (params as any);
  const { documentId } = resolvedParams;

  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    [],
  );

  const document = useQuery(api.documents.getById, {
    documentId: documentId,
  });

  const update = useMutation(api.documents.update);

  const onChange = (content: string) => {
    update({
      id: documentId,
      content,
    });
  };

  if (document === undefined) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
          <div className="space-y-4 pt-4 pl-8">
            <Skeleton className="h-14 w-1/2" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </div>
    );
  }

  if (document === null || !document.isPublished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 space-y-6 text-center">
        <div className="h-16 w-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 animate-bounce">
          <EyeOff className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">This page is not published</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            The author has not made this sub-page public yet, or it may have been deleted.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/">
            Go to landing page
          </Link>
        </Button>
      </div>
    );
  }

  const isDb = isDatabase(document.content);

  return (
    <div className="pb-40">
      <Cover preview url={document.coverImage} />
      <div className="relative z-30 mx-auto md:max-w-3xl lg:max-w-4xl">
        <Toolbar
          preview
          initialData={document}
          editorFont={document.editorFont ?? "default"}
        />
        {isDb ? (
          <DatabaseView
            documentId={documentId}
            initialContent={document.content}
            preview
          />
        ) : (
          <Editor
            key={documentId}
            documentId={documentId}
            editable={false}
            onChange={onChange}
            initialContent={document.content}
            editorFont={document.editorFont ?? "default"}
          />
        )}
        <SubpagesList documentId={documentId} preview />
      </div>
    </div>
  );
};
export default DocumentIdPage;
