"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFilePreview } from "@/hooks/useFilePreviewModal";
import { useQuery, useMutation } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { Cover } from "@/components/cover";
import { Toolbar } from "@/components/toolbar";
import { SubpagesList } from "@/components/subpages-list";
import { isDatabase } from "@/components/database/database-utils";
import { DatabaseView } from "@/components/database/DatabaseView";
import { ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  AArrowDown,
  Maximize2,
  MoreHorizontal,
  Settings,
  TableOfContents,
  Trash,
  History,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettingsModal";
import { useHistorySidebar } from "@/hooks/useHistorySidebar";
import { useWordCount } from "@/hooks/useWordCount";

export const FilePreviewModal = () => {
  const previewModal = useFilePreview();
  const router = useRouter();

  // Fetch document contents
  const document = useQuery(
    api.documents.getById,
    previewModal.documentId ? { documentId: previewModal.documentId } : "skip"
  );

  const update = useMutation(api.documents.update);
  const archive = useMutation(api.documents.archive);

  const settings = useSettings();
  const historySidebar = useHistorySidebar();
  const words = useWordCount();

  // Dynamically load the BlockNote editor
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  const onChange = (content: string) => {
    if (previewModal.documentId) {
      update({
        id: previewModal.documentId,
        content,
      });
    }
  };

  const isDb = document ? isDatabase(document.content) : false;

  const isFullWidth = document?.fullWidth ?? true;
  const toggleToc = document?.showToc ?? true;
  const isSmallText = !!document?.smallText;

  const onArchive = () => {
    if (!previewModal.documentId) return;
    const promise = archive({ id: previewModal.documentId });
    toast.promise(promise, {
      loading: "Moving to trash...",
      success: "Note moved to trash!",
      error: "Failed to archive note.",
    });
    previewModal.onClose();
  };

  const onFullWidthChange = (checked: boolean) => {
    if (!previewModal.documentId) return;
    update({
      id: previewModal.documentId,
      fullWidth: checked,
    });
  };

  const onSmallTextChange = (checked: boolean) => {
    if (!previewModal.documentId) return;
    update({
      id: previewModal.documentId,
      smallText: checked,
    });
  };

  const onTocChange = (checked: boolean) => {
    if (!previewModal.documentId) return;
    update({
      id: previewModal.documentId,
      showToc: checked,
    });
  };

  return (
    <Dialog open={previewModal.isOpen} onOpenChange={previewModal.onClose}>
      <DialogTitle hidden>
        {document?.title ? `Preview: ${document.title}` : "File Preview"}
      </DialogTitle>
      <DialogDescription className="sr-only">
        Full interactive editor view of the document.
      </DialogDescription>
      <DialogContent className="!right-0 !left-auto !top-0 !translate-x-0 !translate-y-0 !h-screen !max-h-screen !rounded-l-xl !rounded-r-none !border-y-0 !border-r-0 w-[550px] !max-w-[90vw] p-0 overflow-hidden dark:bg-dark flex flex-col duration-300">
        {document === undefined ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : document === null ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Document not found.
          </div>
        ) : (
          <>
            {/* Header controls: Menu / Page Settings */}
            <div className="absolute right-12 top-[8px] z-50 flex items-center gap-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  router.push(`/documents/${previewModal.documentId}`);
                  previewModal.onClose();
                }}
                className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
                title="Open in full page"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" aria-label="Page actions" className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-65 px-2" align="end" forceMount>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => onSmallTextChange(!isSmallText)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1">
                      <AArrowDown className="mr-2 h-4 w-4" />
                      Small text
                    </div>
                    <Switch size="sm" checked={isSmallText} onCheckedChange={onSmallTextChange} />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => onFullWidthChange(!isFullWidth)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1">
                      <Maximize2 className="mr-2 h-4 w-4 rotate-45" />
                      Full width
                    </div>
                    <Switch size="sm" checked={isFullWidth} onCheckedChange={onFullWidthChange} />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => onTocChange(!toggleToc)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1">
                      <TableOfContents className="mr-2 h-4 w-4" />
                      Show table of contents
                    </div>
                    <Switch size="sm" checked={toggleToc} onCheckedChange={onTocChange} />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-1.5" />
                  <DropdownMenuItem onClick={settings.onOpen}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => historySidebar.onOpen(previewModal.documentId!)}>
                    <History className="mr-2 h-4 w-4" />
                    Page History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onArchive}>
                    <Trash className="mr-2 h-4 w-4" />
                    Move to Trash
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-1.5" />
                  <div className="text-muted-foreground/70 space-y-0.5 p-2 text-[.6875rem]">
                    <p>
                      Word count: {words.wordCount}{" "}
                      {words.wordCount === 1 ? "word" : "words"}
                    </p>
                    <p>
                      Last edited on{" "}
                      {new Date(
                        document.updatedAt ?? document._creationTime
                      ).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Scrollable Preview Area */}
            <div className="flex-1 overflow-y-auto min-h-0 pt-10">
              <Cover url={document.coverImage} />
              <div className="px-6 md:px-10 pb-16">
                <Toolbar initialData={document} editorFont={document.editorFont || "default"} />
                {isDb ? (
                  <DatabaseView
                    documentId={previewModal.documentId!}
                    initialContent={document.content}
                  />
                ) : (
                  <Editor
                    documentId={previewModal.documentId!}
                    onChange={onChange}
                    initialContent={document.content}
                    smallText={document.smallText}
                    editorFont={document.editorFont || "default"}
                  />
                )}
                <SubpagesList documentId={previewModal.documentId!} />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
