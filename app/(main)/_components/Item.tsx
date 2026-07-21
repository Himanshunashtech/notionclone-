"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/supabase-db";
import { Id } from "@/lib/supabase-db";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@/hooks/use-supabase-db";
import { toast } from "sonner";
import { DocumentIcon } from "@/components/document-icon";
import {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  LucideIcon,
  MoreHorizontal,
  Plus,
  Settings,
  Star,
  Trash,
  Eye,
  EyeOff,
  Link2,
  Copy,
  Edit3,
  ArrowRightLeft,
  BookOpen,
  ExternalLink,
  PanelLeftOpen,
} from "lucide-react";

import { ActionTooltip } from "@/components/action-tooltip";
import { useNavDrawer } from "@/hooks/useNavDrawer";
import { useFilePreview } from "@/hooks/useFilePreviewModal";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ItemProps {
  id?: Id<"documents">;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  level?: number;
  onExpand?: () => void;
  label?: string;
  onClick?: () => void;
  icon: LucideIcon;
  isFavorite?: boolean;
  onFavorite?: () => void;
  shortcut?: string;
  showDragHandle?: boolean;
  navDrawer?: boolean;
  isTeamspace?: boolean;
  isHidden?: boolean;
  onToggleHide?: () => void;
}

export const Item = ({
  id,
  label,
  onClick,
  icon: Icon,
  active,
  documentIcon,
  level = 0,
  onExpand,
  expanded,
  isFavorite,
  onFavorite,
  shortcut,
  showDragHandle = true,
  navDrawer,
  isTeamspace,
  isHidden,
  onToggleHide,
}: ItemProps) => {
  const router = useRouter();
  const params = useParams();

  const { setInnerPopoverOpen } = useNavDrawer();

  const create = useMutation(api.documents.create);
  const archive = useMutation(api.documents.archive);
  const restore = useMutation(api.documents.restore);
  const update = useMutation(api.documents.update);

  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const searchDocuments = useQuery(api.documents.getSearch);

  const [isWiki, setIsWiki] = useState(() => {
    if (!id) return false;
    try {
      const stored = localStorage.getItem("wikiPageIds");
      if (stored) {
        const ids = JSON.parse(stored);
        return ids.includes(id);
      }
    } catch {}
    return false;
  });

  const document = useQuery(
    api.documents.getById,
    id ? { documentId: id } : "skip",
  );

  const isCustomTeamspace = isTeamspace && id && (() => {
    try {
      const stored = localStorage.getItem("teamspaceIds");
      if (stored) {
        const ids = JSON.parse(stored);
        return ids.includes(id);
      }
    } catch {}
    return false;
  })();

  const onArchive = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;

    if (params.documentId === id) {
      router.push("/documents");
    }

    const promise = archive({ id });

    toast.promise(promise, {
      loading: "Moving to trash...",
      error: "Failed to archive note.",
    });

    promise.then(() => {
      toast("Note moved to trash", {
        action: {
          label: "Undo",
          onClick: () => restore({ id }),
        },
      });
    });
  };

  const onCopyLink = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (!id) return;
    const url = `${window.location.origin}/documents/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const onDuplicate = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (!id || !document) return;

    const promise = create({
      title: document.title + " (Copy)",
      parentDocument: document.parentDocument || undefined,
    }).then(async (newId) => {
      await update({
        id: newId,
        content: document.content,
        icon: document.icon,
        coverImage: document.coverImage,
        editorFont: document.editorFont,
        fullWidth: document.fullWidth,
        smallText: document.smallText,
        showToc: document.showToc,
      });
      router.push(`/documents/${newId}`);
    });

    toast.promise(promise, {
      loading: "Duplicating page...",
      success: "Page duplicated successfully!",
      error: "Failed to duplicate page.",
    });
  };

  const onRename = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (!id || !document) return;
    const newTitle = window.prompt("Rename page:", document.title);
    if (newTitle === null) return;
    const title = newTitle.trim();
    if (!title) return;

    const promise = update({ id, title });

    toast.promise(promise, {
      loading: "Renaming page...",
      success: "Page renamed successfully!",
      error: "Failed to rename page.",
    });
  };

  const onToggleWiki = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (!id) return;
    try {
      const stored = localStorage.getItem("wikiPageIds");
      let ids = stored ? JSON.parse(stored) : [];
      if (isWiki) {
        ids = ids.filter((wikiId: string) => wikiId !== id);
        toast.success("Page turned back to normal!");
      } else {
        ids.push(id);
        update({ id, title: "Wiki" });
        toast.success("Page turned into wiki!");
      }
      localStorage.setItem("wikiPageIds", JSON.stringify(ids));
      setIsWiki(!isWiki);
      window.dispatchEvent(new CustomEvent("wiki-status-changed"));
    } catch {
      toast.error("Failed to update wiki status.");
    }
  };

  const onOpenNewTab = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (!id) return;
    window.open(`/documents/${id}`, "_blank");
  };

  const onOpenSidePeek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (!id) return;
    previewModal.onOpen(id);
  };

  const onMove = async (parentDocumentId: string | null) => {
    if (!id) return;
    const promise = update({
      id,
      parentDocument: parentDocumentId || undefined,
    });

    toast.promise(promise, {
      loading: "Moving page...",
      success: "Page moved successfully!",
      error: "Failed to move page.",
    });

    setIsMoveOpen(false);
  };

  const onDeleteTeamspace = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;

    const ok = window.confirm("Are you sure you want to delete this teamspace and all its data? This action cannot be undone.");
    if (!ok) return;

    if (params.documentId === id) {
      router.push("/documents");
    }

    const promise = archive({ id }).then(() => {
      try {
        const stored = localStorage.getItem("teamspaceIds");
        if (stored) {
          const ids = JSON.parse(stored) as string[];
          const filtered = ids.filter((tId) => tId !== id);
          localStorage.setItem("teamspaceIds", JSON.stringify(filtered));
        }
      } catch (err) {
        console.error(err);
      }
      window.location.reload();
    });

    toast.promise(promise, {
      loading: "Deleting teamspace...",
      success: "Teamspace deleted successfully!",
      error: "Failed to delete teamspace.",
    });
  };

  const handleExpand = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    onExpand?.();
  };

  const onCreate = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;

    const promise = create({ title: "Untitled", parentDocument: id }).then(
      (documentId) => {
        if (!expanded) {
          onExpand?.();
        }
        router.push(`/documents/${documentId}`);
      },
    );

    toast.promise(promise, {
      loading: "Creating new note",
      success: "New note created.",
      error: "Failed to create note.",
    });
  };

  const onOpenChange = (open: boolean) => {
    if (!navDrawer) return;
    setInnerPopoverOpen(open);
  };

  const previewModal = useFilePreview();

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <>
      <div
        onClick={onClick}
        onDoubleClick={() => id && previewModal.onOpen(id)}
        role="button"
        style={{ paddingLeft: level ? `${level * 12 + 12}px` : "12px" }}
        className={cn(
          "group text-muted-foreground hover:bg-primary/5 relative flex min-h-6.75 w-full items-center py-1 pr-3 text-sm font-medium",
          active && "bg-primary/5 text-primary",
          navDrawer && !id ? "rounded-full" : "rounded-none",
        )}
      >
        <div className="group flex items-center justify-center truncate">
          {!!id && showDragHandle && (
            <GripVertical className="text-muted-foreground/50 absolute left-0.5 size-3 opacity-0 group-hover:opacity-100" />
          )}
          {!!id && (
            <div
              role="button"
              aria-label={expanded ? "Collapse page" : "Expand page"}
              aria-expanded={!!expanded}
              className="mr-1 h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
              onClick={handleExpand}
            >
              <ChevronIcon className="text-muted-foreground/50 h-4 w-4 shrink-0" />
            </div>
          )}
          {documentIcon ? (
            <DocumentIcon icon={documentIcon} className="mr-2.5 h-[22px] w-[22px] shrink-0 text-xl" />
          ) : isWiki ? (
            <BookOpen className="text-muted-foreground h-4.5 w-4.5 shrink-0 mr-2" />
          ) : (
            <Icon
              className={`text-muted-foreground h-4.5 w-4.5 shrink-0 ${navDrawer && Icon === Settings ? "mr-0" : "mr-2"}`}
            />
          )}
          {label && (
            <span className="truncate" title={label}>
              {label}
            </span>
          )}
        </div>
        {shortcut && (
          <kbd className="bg-muted text-muted-foreground pointer-events-none ml-auto hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[.625rem] font-medium opacity-100 select-none md:inline-flex dark:bg-neutral-700">
            {shortcut}
          </kbd>
        )}
        {!!id && (
          <div className="ml-auto flex items-center gap-x-2">
            <ActionTooltip label="Add sub-page">
              <div
                role="button"
                aria-label="Add sub-page"
                onClick={onCreate}
                className="ml-auto h-full rounded-sm opacity-100 transition hover:bg-neutral-300 md:opacity-0 md:group-hover:opacity-100 dark:hover:bg-neutral-600"
              >
                <Plus className="text-muted-foreground h-4 w-4" />
              </div>
            </ActionTooltip>
            <DropdownMenu onOpenChange={navDrawer ? onOpenChange : undefined}>
              <ActionTooltip label="More actions">
                <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
                  <div
                    role="button"
                    aria-label="More actions"
                    className="ml-auto h-full rounded-sm opacity-100 transition hover:bg-neutral-300 md:opacity-0 md:group-hover:opacity-100 dark:hover:bg-neutral-600"
                  >
                    <MoreHorizontal className="text-muted-foreground h-4 w-4" />
                  </div>
                </DropdownMenuTrigger>
              </ActionTooltip>
              <DropdownMenuContent
                className="w-65"
                align="start"
                side="right"
                forceMount
              >
                {!isTeamspace && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavorite?.();
                    }}
                  >
                    <Star
                      className={cn(
                        "mr-2 h-4 w-4",
                        isFavorite && "fill-yellow-400 text-yellow-400",
                      )}
                    />
                    {isFavorite ? "Remove from favorites" : "Add to favorites"}
                  </DropdownMenuItem>
                )}

                {/* Copy link */}
                {id && (
                  <DropdownMenuItem onClick={onCopyLink}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Copy link
                  </DropdownMenuItem>
                )}

                {/* Duplicate */}
                {id && !isTeamspace && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    <span className="flex-1">Duplicate</span>
                    <kbd className="ml-auto pointer-events-none hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60 md:inline-flex dark:bg-neutral-800">
                      Ctrl+D
                    </kbd>
                  </DropdownMenuItem>
                )}

                {/* Rename */}
                {id && !isTeamspace && (
                  <DropdownMenuItem onClick={onRename}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    <span className="flex-1">Rename</span>
                    <kbd className="ml-auto pointer-events-none hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60 md:inline-flex dark:bg-neutral-800">
                      Ctrl+Shift+R
                    </kbd>
                  </DropdownMenuItem>
                )}

                {/* Move to */}
                {id && !isTeamspace && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMoveOpen(true);
                    }}
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    <span className="flex-1">Move to</span>
                    <kbd className="ml-auto pointer-events-none hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60 md:inline-flex dark:bg-neutral-800">
                      Ctrl+Shift+P
                    </kbd>
                  </DropdownMenuItem>
                )}

                {isTeamspace ? (
                  <>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleHide?.();
                      }}
                    >
                      {isHidden ? (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Show in Teamspace
                        </>
                      ) : (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Hide from Teamspace
                        </>
                      )}
                    </DropdownMenuItem>
                    {isCustomTeamspace && (
                      <DropdownMenuItem onClick={onDeleteTeamspace}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Teamspace
                      </DropdownMenuItem>
                    )}
                  </>
                ) : (
                  <DropdownMenuItem onClick={onArchive}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}

                {/* Turn into wiki */}
                {id && !isTeamspace && (
                  <DropdownMenuItem onClick={onToggleWiki}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    {isWiki ? "Turn into normal page" : "Turn into wiki"}
                  </DropdownMenuItem>
                )}

                {/* Open in new tab */}
                {id && !isTeamspace && (
                  <DropdownMenuItem onClick={onOpenNewTab}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span className="flex-1">Open in new tab</span>
                    <kbd className="ml-auto pointer-events-none hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60 md:inline-flex dark:bg-neutral-800">
                      Ctrl+Shift+Enter
                    </kbd>
                  </DropdownMenuItem>
                )}

                {/* Open in side peek */}
                {id && !isTeamspace && (
                  <DropdownMenuItem onClick={onOpenSidePeek}>
                    <PanelLeftOpen className="mr-2 h-4 w-4" />
                    <span className="flex-1">Open in side peek</span>
                    <kbd className="ml-auto pointer-events-none hidden h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60 md:inline-flex dark:bg-neutral-800">
                      Alt+Click
                    </kbd>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <div className="space-y-0.5 p-2 text-[.6875rem]">
                  <p className="text-muted-foreground/70">
                    Last edited on{" "}
                    {document
                      ? new Date(
                          document.updatedAt ?? document._creationTime,
                        ).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "..."}
                  </p>
                  <p className="text-muted-foreground/70">
                    Created on{" "}
                    {document
                      ? new Date(document._creationTime).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "..."}
                  </p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Move Dialog */}
      <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <DialogTitle className="sr-only">Move Page</DialogTitle>
        <DialogContent className="p-6 dark:bg-dark">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Move page to...</h3>
            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1">
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-sm"
                onClick={() => onMove(null)}
              >
                No parent (Move to Root)
              </Button>
              {searchDocuments
                ?.filter((doc) => doc._id !== id)
                ?.map((doc) => (
                  <Button
                    key={doc._id}
                    variant="ghost"
                    className="w-full justify-start text-left text-sm"
                    onClick={() => onMove(doc._id)}
                  >
                    {doc.icon && (
                      <DocumentIcon icon={doc.icon} className="mr-2.5 h-5 w-5 shrink-0 text-lg" />
                    )}
                    {doc.title || "Untitled"}
                  </Button>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      style={{ paddingLeft: level ? `${level * 12 + 25}px` : "12px" }}
      className="flex gap-x-2 py-0.75"
    >
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-[30%]" />
    </div>
  );
};
