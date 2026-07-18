"use client";

import React, { useState } from "react";
import { X, History, RotateCcw, Plus, Tag, Calendar, User, Eye, ArrowLeft } from "lucide-react";
import { useQuery, useMutation } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { useHistorySidebar } from "@/hooks/useHistorySidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const HistorySidebar = () => {
  const historySidebar = useHistorySidebar();
  const documentId = historySidebar.documentId;
  const isPreview = typeof window !== "undefined" && window.location.pathname.includes("/preview");

  const versions = useQuery(
    api.documents.getVersions,
    documentId ? { documentId } : "skip"
  );

  const document = useQuery(
    api.documents.getById,
    documentId ? { documentId } : "skip"
  );

  const createVersion = useMutation(api.documents.createVersion);
  const restoreVersion = useMutation(api.documents.restoreVersion);

  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [newLabel, setNewLabel] = useState("");
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [customLabel, setCustomLabel] = useState("");

  if (!historySidebar.isOpen || !documentId) return null;

  const handleRestore = async (version: any) => {
    const promise = restoreVersion({
      documentId,
      title: version.title,
      content: version.content,
    });

    toast.promise(promise, {
      loading: "Restoring version...",
      success: "Document restored successfully!",
      error: "Failed to restore document.",
    });

    try {
      await promise;
      historySidebar.onClose();
      setSelectedVersion(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    setIsCreatingSnapshot(true);
    const promise = createVersion({
      documentId,
      title: document.title,
      content: document.content || "",
      label: customLabel.trim() || undefined,
    });

    toast.promise(promise, {
      loading: "Saving snapshot...",
      success: "Page version snapshot saved!",
      error: "Failed to save version.",
    });

    try {
      await promise;
      setCustomLabel("");
      setIsCreatingSnapshot(false);
    } catch (e) {
      setIsCreatingSnapshot(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[450px] bg-white/85 dark:bg-neutral-900/90 backdrop-blur-md border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col transition-all duration-300 transform translate-x-0">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-x-2">
          <History className="h-5 w-5 text-blue-500" />
          <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">Page History</h3>
        </div>
        <button
          onClick={() => {
            historySidebar.onClose();
            setSelectedVersion(null);
          }}
          className="p-1 rounded-md hover:bg-neutral-150 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {selectedVersion ? (
        /* Preview Panel */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-blue-50/20 dark:bg-blue-900/5 flex items-center justify-between gap-x-4">
            <button
              onClick={() => setSelectedVersion(null)}
              className="flex items-center gap-x-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to history list</span>
            </button>
            <Button
              size="sm"
              onClick={() => handleRestore(selectedVersion)}
              className="h-8 flex items-center gap-x-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Restore this version</span>
            </Button>
          </div>

          {/* Preview Content Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-extrabold flex items-center gap-x-1">
                <Eye className="h-3 w-3" />
                Version Preview (Read-Only)
              </span>
              <h1 className="text-2xl font-black text-neutral-850 dark:text-white break-words">
                {selectedVersion.title || "Untitled"}
              </h1>
              {selectedVersion.label && (
                <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {selectedVersion.label}
                </span>
              )}
            </div>
            
            <div className="border-t border-neutral-100 dark:border-neutral-850 pt-4 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap font-sans break-words bg-neutral-50/50 dark:bg-neutral-850/30 p-4 rounded-xl">
              {(() => {
                if (!selectedVersion.content) return <span className="italic text-muted-foreground">Empty document</span>;
                // If it is a database_row config, we parse it nicely
                try {
                  const parsed = JSON.parse(selectedVersion.content);
                  if (parsed.type === "database") {
                    return `[Database View: ${parsed.viewType || "table"}] with ${parsed.properties?.length || 0} properties`;
                  }
                  if (parsed.type === "database_row") {
                    return Object.entries(parsed.values || {})
                      .map(([k, v]) => `• ${k}: ${v}`)
                      .join("\n");
                  }
                } catch {}
                
                // If it is simple HTML or string editor blocks, we clean it slightly for preview
                return selectedVersion.content
                  .replace(/<[^>]*>/g, "\n")
                  .trim() || <span className="italic text-muted-foreground">Empty document</span>;
              })()}
            </div>
          </div>
        </div>
      ) : (
        /* Timeline List Panel */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Manual Snapshot Form */}
          {!isPreview && (
            <form onSubmit={handleManualSnapshot} className="p-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-b border-neutral-200/60 dark:border-neutral-800/80 flex gap-x-2">
              <Input
                placeholder="Checkpoint label (e.g. Draft 1)..."
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                disabled={isCreatingSnapshot}
                className="h-8 text-xs bg-white dark:bg-neutral-800 dark:border-neutral-700"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isCreatingSnapshot}
                className="h-8 flex items-center gap-x-1.5 px-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-850 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Save</span>
              </Button>
            </form>
          )}

          {/* Versions Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {versions === undefined ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-y-2">
                <History className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
                <p className="text-xs font-medium">No saved versions yet</p>
                <p className="text-[10px]">Edits will be automatically saved or you can create manual checkpoints above.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-neutral-100 dark:border-neutral-800 pl-4 ml-2 space-y-5">
                {versions.map((ver: any) => {
                  const dateStr = new Date(ver.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div key={ver.id} className="relative group/version">
                      {/* Timeline dot */}
                      <span className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-300 dark:bg-neutral-700 group-hover/version:bg-blue-500 transition-colors" />

                      <div className="bg-neutral-50/50 hover:bg-neutral-50 dark:bg-neutral-850/40 dark:hover:bg-neutral-850/80 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800/80 transition flex items-start justify-between gap-x-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-x-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-x-1">
                              <Calendar className="h-3 w-3" />
                              {dateStr}
                            </span>
                            {ver.label && (
                              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-[8px] font-bold px-1.5 py-0.25 rounded flex items-center gap-x-0.5 uppercase tracking-wider">
                                <Tag className="h-2 w-2" />
                                {ver.label}
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                            {ver.title || "Untitled"}
                          </h4>
                        </div>

                        <div className="flex items-center gap-x-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedVersion(ver)}
                            title="Preview Version"
                            className="p-1.5 h-7 w-7 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRestore(ver)}
                            title="Restore Version"
                            className="p-1.5 h-7 w-7 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
