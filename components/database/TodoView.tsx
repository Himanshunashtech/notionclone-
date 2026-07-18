"use client";

import { useMutation } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { Doc, Id } from "@/lib/supabase-db";
import { DatabaseConfig, parseDatabaseRow } from "./database-utils";
import { File, Plus, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface TodoViewProps {
  documentId: string;
  config: DatabaseConfig;
  subpages: Doc<"documents">[];
  preview?: boolean;
}

export const TodoView = ({ documentId, config, subpages, preview = false }: TodoViewProps) => {
  const update = useMutation(api.documents.update);

  // Use Status property or fallback
  const statusProp = config.properties.find(p => p.id === "status") || {
    id: "status",
    name: "Status",
    type: "select" as const,
    options: ["To Do", "Done"]
  };

  const handleToggle = async (page: Doc<"documents">) => {
    if (preview) return;
    const rowConfig = parseDatabaseRow(page.content);
    const currentStatus = rowConfig.values[statusProp.id] || "To Do";
    const newStatus = currentStatus === "Done" ? "To Do" : "Done";

    const updatedRow = {
      ...rowConfig,
      values: {
        ...rowConfig.values,
        [statusProp.id]: newStatus
      }
    };

    try {
      await update({
        id: page._id as Id<"documents">,
        content: JSON.stringify(updatedRow, null, 2)
      });
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Calculate statistics
  const total = subpages.length;
  const completed = subpages.filter(page => {
    const rowData = parseDatabaseRow(page.content);
    const val = rowData.values[statusProp.id] || "To Do";
    return val.toLowerCase() === "done";
  }).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Progress Bar Header */}
      {total > 0 && (
        <div className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <span>Progress Tracker</span>
            <span>{completed} / {total} tasks ({pct}%)</span>
          </div>
          <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {subpages.map((page) => {
          const rowData = parseDatabaseRow(page.content);
          const isDone = (rowData.values[statusProp.id] || "To Do").toLowerCase() === "done";
          const pageLink = `/documents/${page._id}`;

          return (
            <div
              key={page._id}
              className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition group"
            >
              <div className="flex items-center gap-x-3 min-w-0">
                {/* Custom Checkbox */}
                <button
                  disabled={preview}
                  onClick={() => handleToggle(page)}
                  className={`h-5 w-5 rounded-md border flex items-center justify-center transition shrink-0 cursor-pointer ${
                    isDone
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-neutral-300 dark:border-neutral-700 hover:border-sky-500"
                  }`}
                >
                  {isDone && <Check className="h-3.5 w-3.5 stroke-[3px]" />}
                </button>

                {/* Task Title */}
                <Link
                  href={pageLink}
                  className={`text-sm font-semibold hover:underline truncate ${
                    isDone ? "line-through text-neutral-400 dark:text-neutral-500 font-normal" : "text-neutral-800 dark:text-neutral-200"
                  }`}
                >
                  {page.title || "Untitled"}
                </Link>
              </div>

              {/* View page link icon */}
              <Link href={pageLink} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition text-neutral-400">
                <File className="h-4 w-4" />
              </Link>
            </div>
          );
        })}

        {subpages.length === 0 && (
          <div className="p-8 text-center text-xs text-muted-foreground border-2 border-dashed rounded-xl border-neutral-200 dark:border-neutral-800">
            No items in your checklist. Click "Add page" above to add your first task.
          </div>
        )}
      </div>
    </div>
  );
};
