"use client";

import { Doc } from "@/lib/supabase-db";
import { DatabaseConfig, parseDatabaseRow, isDatabase, isDatabaseRow } from "./database-utils";
import {
  File,
  FileText,
  Table,
  LayoutGrid,
  ListChecks,
  ExternalLink,
  FileCode,
  Link as LinkIcon,
  Calendar,
  Tag,
} from "lucide-react";
import Link from "next/link";

interface DocumentViewProps {
  documentId: string;
  config: DatabaseConfig;
  subpages: Doc<"documents">[];
  preview?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function detectDocType(doc: Doc<"documents">): {
  label: string;
  icon: React.ReactNode;
  color: string;
} {
  const content = doc.content ?? "";

  if (!content || content === "") {
    return {
      label: "Empty",
      icon: <File className="h-3.5 w-3.5" />,
      color: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
    };
  }

  if (isDatabase(content)) {
    try {
      const parsed = JSON.parse(content);
      switch (parsed.viewType) {
        case "board":
          return {
            label: "Board",
            icon: <LayoutGrid className="h-3.5 w-3.5" />,
            color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          };
        case "todo":
          return {
            label: "List",
            icon: <ListChecks className="h-3.5 w-3.5" />,
            color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
          };
        case "document":
          return {
            label: "Doc Hub",
            icon: <FileCode className="h-3.5 w-3.5" />,
            color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
          };
        default:
          return {
            label: "Table",
            icon: <Table className="h-3.5 w-3.5" />,
            color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
          };
      }
    } catch {}
  }

  if (isDatabaseRow(content)) {
    return {
      label: "Row",
      icon: <Tag className="h-3.5 w-3.5" />,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    };
  }

  // Attempt to detect if it's a normal editor doc (array)
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return {
        label: "Document",
        icon: <FileText className="h-3.5 w-3.5" />,
        color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
      };
    }
  } catch {}

  return {
    label: "Document",
    icon: <FileText className="h-3.5 w-3.5" />,
    color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  };
}

function formatDate(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(doc: Doc<"documents">) {
  const content = doc.content ?? "";
  if (!content || content === "") return null;

  if (isDatabaseRow(content)) {
    const row = parseDatabaseRow(content);
    const statusVal = row.values["status"];
    if (!statusVal) return null;

    const lc = statusVal.toLowerCase();
    let cls = "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
    let dot = "bg-neutral-400";
    if (lc.includes("done") || lc.includes("complet")) {
      cls = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      dot = "bg-emerald-500";
    } else if (lc.includes("progress")) {
      cls = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      dot = "bg-amber-500";
    } else if (lc.includes("qa") || lc.includes("review")) {
      cls = "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      dot = "bg-purple-500";
    }

    return (
      <span className={`inline-flex items-center gap-x-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${cls}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {statusVal}
      </span>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// DocumentView
// ═══════════════════════════════════════════════════════════════════════════

export const DocumentView = ({
  documentId: _documentId,
  config: _config,
  subpages,
  preview = false,
}: DocumentViewProps) => {
  if (subpages.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-y-3 text-center">
        <div className="p-4 rounded-full bg-neutral-100 dark:bg-neutral-800">
          <FileText className="h-8 w-8 text-neutral-400" />
        </div>
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
          No documents yet
        </p>
        <p className="text-xs text-muted-foreground max-w-[280px]">
          Click <strong>New</strong> in the toolbar to add sub-pages. They will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        {/* ── Header ─────────────────────────────────────── */}
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            {/* Name */}
            <th className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 min-w-[260px]">
              <div className="flex items-center gap-x-1.5">
                <span className="text-[10px] font-bold text-neutral-400">Aa</span>
                <span>Name</span>
              </div>
            </th>
            {/* Type */}
            <th className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 min-w-[120px]">
              <div className="flex items-center gap-x-1.5">
                <Tag className="h-3 w-3 text-neutral-400" />
                <span>Type</span>
              </div>
            </th>
            {/* Status */}
            <th className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 min-w-[130px]">
              <div className="flex items-center gap-x-1.5">
                <ListChecks className="h-3 w-3 text-neutral-400" />
                <span>Status</span>
              </div>
            </th>
            {/* Created */}
            <th className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 min-w-[140px]">
              <div className="flex items-center gap-x-1.5">
                <Calendar className="h-3 w-3 text-neutral-400" />
                <span>Created</span>
              </div>
            </th>
            {/* Link */}
            <th className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 min-w-[100px]">
              <div className="flex items-center gap-x-1.5">
                <LinkIcon className="h-3 w-3 text-neutral-400" />
                <span>Link</span>
              </div>
            </th>
          </tr>
        </thead>

        {/* ── Body ───────────────────────────────────────── */}
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {subpages.map((doc) => {
            const pageLink = `/documents/${doc._id}`;
            const { label, icon, color } = detectDocType(doc);
            const statusBadge = getStatusBadge(doc);

            return (
              <tr
                key={doc._id}
                className="group/row hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition"
              >
                {/* Name */}
                <td className="px-3 py-3">
                  <Link
                    href={pageLink}
                    className="flex items-center gap-x-2 hover:underline"
                  >
                    {doc.icon ? (
                      <span className="text-base shrink-0 leading-none">{doc.icon}</span>
                    ) : (
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[220px]">
                      {doc.title || "Untitled"}
                    </span>
                  </Link>
                </td>

                {/* Type badge */}
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center gap-x-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${color}`}>
                    {icon}
                    {label}
                  </span>
                </td>

                {/* Status */}
                <td className="px-3 py-3">
                  {statusBadge ?? (
                    <span className="text-xs text-neutral-300 dark:text-neutral-600">—</span>
                  )}
                </td>

                {/* Created */}
                <td className="px-3 py-3">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDate(doc._creationTime)}
                  </span>
                </td>

                {/* Link */}
                <td className="px-3 py-3">
                  <Link
                    href={pageLink}
                    className="inline-flex items-center gap-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline opacity-0 group-hover/row:opacity-100 transition"
                    target={preview ? "_blank" : undefined}
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Open</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
