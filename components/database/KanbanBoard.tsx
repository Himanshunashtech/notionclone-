"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { Doc, Id } from "@/lib/supabase-db";
import { DatabaseConfig, PropertyType, parseDatabaseRow } from "./database-utils";
import { File, Plus, ArrowRightLeft, CalendarDays, Link as LinkIcon, Mail, Phone, Hash, Paperclip, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanBoardProps {
  documentId: string;
  config: DatabaseConfig;
  subpages: Doc<"documents">[];
  preview?: boolean;
}

// ─── Color helpers ──────────────────────────────────────────────────────────

const SELECT_PALETTE = [
  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
];

const PRIORITY_COLOR: Record<string, string> = {
  high:   "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

function getPillColor(propId: string, propName: string, options: string[] | undefined, value: string): string {
  const lc = value.toLowerCase();
  if (propId === "priority" || propName.toLowerCase() === "priority") {
    return PRIORITY_COLOR[lc] ?? SELECT_PALETTE[0];
  }
  const idx = (options?.indexOf(value) ?? 0) % SELECT_PALETTE.length;
  return SELECT_PALETTE[Math.max(0, idx)];
}

const COLUMN_DOT: Record<string, string> = {
  "new":              "bg-neutral-400 dark:bg-neutral-500",
  "reviewed":         "bg-slate-400 dark:bg-slate-500",
  "planned":          "bg-amber-500 dark:bg-amber-400",
  "in development":   "bg-sky-500 dark:bg-sky-400",
  "in-development":   "bg-sky-500 dark:bg-sky-400",
  "fixed":            "bg-indigo-500 dark:bg-indigo-400",
  "in testing":       "bg-purple-500 dark:bg-purple-400",
  "testing complete": "bg-teal-500 dark:bg-teal-400",
  "deployed":         "bg-emerald-500 dark:bg-emerald-400",
  "closed":           "bg-emerald-600 dark:bg-emerald-500",
  "rejected":         "bg-rose-500 dark:bg-rose-400",
  "done":             "bg-emerald-500 dark:bg-emerald-400",
};

const COLUMN_BG: Record<string, string> = {
  "new":              "bg-neutral-100/60 dark:bg-neutral-900/40",
  "reviewed":         "bg-slate-100/60 dark:bg-slate-900/40",
  "planned":          "bg-amber-50/70 dark:bg-amber-950/25",
  "in development":   "bg-sky-50/70 dark:bg-sky-950/25",
  "in-development":   "bg-sky-50/70 dark:bg-sky-950/25",
  "fixed":            "bg-indigo-50/70 dark:bg-indigo-950/25",
  "in testing":       "bg-purple-50/70 dark:bg-purple-950/25",
  "testing complete": "bg-teal-50/70 dark:bg-teal-950/25",
  "deployed":         "bg-emerald-50/70 dark:bg-emerald-950/25",
  "closed":           "bg-emerald-100/50 dark:bg-emerald-950/30",
  "rejected":         "bg-rose-50/70 dark:bg-rose-950/25",
  "done":             "bg-emerald-50/70 dark:bg-emerald-950/25",
};

const COLUMN_TEXT: Record<string, string> = {
  "new":              "text-neutral-700 dark:text-neutral-300",
  "reviewed":         "text-slate-700 dark:text-slate-300",
  "planned":          "text-amber-800 dark:text-amber-300",
  "in development":   "text-sky-800 dark:text-sky-300",
  "in-development":   "text-sky-800 dark:text-sky-300",
  "fixed":            "text-indigo-800 dark:text-indigo-300",
  "in testing":       "text-purple-800 dark:text-purple-300",
  "testing complete": "text-teal-800 dark:text-teal-300",
  "deployed":         "text-emerald-800 dark:text-emerald-300",
  "closed":           "text-emerald-900 dark:text-emerald-200",
  "rejected":         "text-rose-800 dark:text-rose-300",
  "done":             "text-emerald-800 dark:text-emerald-300",
};

const COLUMN_HOVER_CARD: Record<string, string> = {
  "new":              "hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/70 dark:hover:bg-neutral-850",
  "reviewed":         "hover:border-slate-300 dark:hover:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-950/40",
  "planned":          "hover:border-amber-300 dark:hover:border-amber-800 hover:bg-amber-50/60 dark:hover:bg-amber-950/40",
  "in development":   "hover:border-sky-300 dark:hover:border-sky-800 hover:bg-sky-50/60 dark:hover:bg-sky-950/40",
  "in-development":   "hover:border-sky-300 dark:hover:border-sky-800 hover:bg-sky-50/60 dark:hover:bg-sky-950/40",
  "fixed":            "hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40",
  "in testing":       "hover:border-purple-300 dark:hover:border-purple-800 hover:bg-purple-50/60 dark:hover:bg-purple-950/40",
  "testing complete": "hover:border-teal-300 dark:hover:border-teal-800 hover:bg-teal-50/60 dark:hover:bg-teal-950/40",
  "deployed":         "hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40",
  "closed":           "hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40",
  "rejected":         "hover:border-rose-300 dark:hover:border-rose-800 hover:bg-rose-50/60 dark:hover:bg-rose-950/40",
  "done":             "hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40",
};

const COLUMN_HOVER_BTN: Record<string, string> = {
  "new":              "hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 hover:text-neutral-800 dark:hover:text-neutral-200",
  "reviewed":         "hover:bg-slate-100/80 dark:hover:bg-slate-900/50 hover:text-slate-700 dark:hover:text-slate-300",
  "planned":          "hover:bg-amber-100/80 dark:hover:bg-amber-900/50 hover:text-amber-800 dark:hover:text-amber-300",
  "in development":   "hover:bg-sky-100/80 dark:hover:bg-sky-900/50 hover:text-sky-800 dark:hover:text-sky-300",
  "in-development":   "hover:bg-sky-100/80 dark:hover:bg-sky-900/50 hover:text-sky-800 dark:hover:text-sky-300",
  "fixed":            "hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 hover:text-indigo-800 dark:hover:text-indigo-300",
  "in testing":       "hover:bg-purple-100/80 dark:hover:bg-purple-900/50 hover:text-purple-800 dark:hover:text-purple-300",
  "testing complete": "hover:bg-teal-100/80 dark:hover:bg-teal-900/50 hover:text-teal-800 dark:hover:text-teal-300",
  "deployed":         "hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 hover:text-emerald-800 dark:hover:text-emerald-300",
  "closed":           "hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 hover:text-emerald-900 dark:hover:text-emerald-200",
  "rejected":         "hover:bg-rose-100/80 dark:hover:bg-rose-900/50 hover:text-rose-800 dark:hover:text-rose-300",
  "done":             "hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 hover:text-emerald-800 dark:hover:text-emerald-300",
};

function getColStyle(colName: string) {
  const k = colName.toLowerCase();
  return {
    dot:  COLUMN_DOT[k] ?? "bg-neutral-400",
    bg:   COLUMN_BG[k]  ?? "bg-neutral-50 dark:bg-neutral-900/50",
    text: COLUMN_TEXT[k] ?? "text-neutral-700 dark:text-neutral-300",
    hoverCard: COLUMN_HOVER_CARD[k] ?? "hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/70 dark:hover:bg-neutral-850",
    hoverBtn: COLUMN_HOVER_BTN[k] ?? "hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 hover:text-neutral-800 dark:hover:text-neutral-200",
  };
}

// ─── Card badge renderer for extra properties ───────────────────────────────

function renderCardValue(
  type: PropertyType,
  value: string,
  propId: string,
  propName: string,
  options?: string[]
): React.ReactNode {
  if (!value) return null;

  switch (type) {
    case "checkbox":
      return (
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${value === "true" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"}`}>
          {propName}: {value === "true" ? "✓" : "✗"}
        </span>
      );

    case "multiselect": {
      const tags = value.split(",").map((s) => s.trim()).filter(Boolean);
      return (
        <>
          {tags.slice(0, 2).map((tag, i) => (
            <span key={i} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${SELECT_PALETTE[i % SELECT_PALETTE.length]}`}>
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="text-[10px] text-neutral-400">+{tags.length - 2}</span>
          )}
        </>
      );
    }

    case "date":
      return (
        <span className="flex items-center gap-x-1 text-[10px] text-neutral-500 dark:text-neutral-400">
          <CalendarDays className="h-2.5 w-2.5" />
          {new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      );

    case "number":
      return (
        <span className="flex items-center gap-x-1 text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
          <Hash className="h-2.5 w-2.5" />
          {value}
        </span>
      );

    case "url":
      return (
        <span className="flex items-center gap-x-1 text-[10px] text-blue-600 dark:text-blue-400 truncate max-w-[120px]">
          <LinkIcon className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{value}</span>
        </span>
      );

    case "email":
      return (
        <span className="flex items-center gap-x-1 text-[10px] text-blue-600 dark:text-blue-400 truncate">
          <Mail className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{value}</span>
        </span>
      );

    case "phone":
      return (
        <span className="flex items-center gap-x-1 text-[10px] text-neutral-500 dark:text-neutral-400">
          <Phone className="h-2.5 w-2.5 shrink-0" />
          {value}
        </span>
      );

    case "select":
    default:
      return (
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${getPillColor(propId, propName, options, value)}`}>
          {value}
        </span>
      );
  }
}

interface KanbanCardProps {
  card: Doc<"documents">;
  preview: boolean;
  columns: string[];
  groupProp: { id: string; name: string };
  extraProps: any[];
  hoverCard?: string;
  handleStatusChange: (cardId: string, cardContent: string | undefined, newStatus: string) => void;
  handleDragStart: (e: React.DragEvent, cardId: string, cardContent: string | undefined) => void;
}

const KanbanCard = ({
  card,
  preview,
  columns,
  groupProp,
  extraProps,
  hoverCard,
  handleStatusChange,
  handleDragStart,
}: KanbanCardProps) => {
  const rowData = parseDatabaseRow(card.content);
  const pageLink = `/documents/${card._id}`;

  // Query child documents (subpages) under this card
  const childSubpages = useQuery(api.documents.getSidebar, {
    parentDocument: card._id,
  });

  const hasSubpages = childSubpages && childSubpages.length > 0;

  // Let's find if there are status or type properties to show as a label
  const typeOrStatusProps = extraProps.filter(
    (p) => p.name.toLowerCase() === "type" || p.name.toLowerCase() === "status"
  );

  return (
    <div
      draggable={!preview}
      onDragStart={(e) => handleDragStart(e, card._id, card.content)}
      className={`group/card bg-white dark:bg-neutral-900 p-2.5 rounded-md border border-neutral-200/90 dark:border-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-md transition duration-150 cursor-grab active:cursor-grabbing space-y-1.5 ${hoverCard || "hover:border-neutral-300 dark:hover:border-neutral-700"}`}
    >
      {/* Labels / Type & Status tags at the very top */}
      {typeOrStatusProps.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {typeOrStatusProps.map((p) => {
            const val = rowData.values[p.id];
            if (!val) return null;
            return (
              <span
                key={p.id}
                className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              >
                {val}
              </span>
            );
          })}
        </div>
      )}

      {/* Title */}
      <div className="flex items-start justify-between gap-x-1.5">
        <Link
          href={pageLink}
          className="flex items-center gap-x-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:underline flex-1 min-w-0 leading-tight"
        >
          {card.icon ? (
            <span className="text-sm shrink-0 leading-none">{card.icon}</span>
          ) : (
            <File className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          )}
          <span className="truncate">{card.title || "Untitled"}</span>
        </Link>

        {!preview && (
          <DropdownMenu>
            <DropdownMenuTrigger className="opacity-0 group-hover/card:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded transition text-neutral-400 shrink-0">
              <ArrowRightLeft className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-neutral-900">
              {columns.map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onClick={() => handleStatusChange(card._id, card.content, opt)}
                  className="text-xs cursor-pointer"
                >
                  Move to {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Extra property badges (excluding type/status which are shown as labels above, and relation properties to hide raw IDs) */}
      {extraProps.filter(p => p.name.toLowerCase() !== "type" && p.name.toLowerCase() !== "status" && p.type !== "relation").length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {extraProps
            .filter(p => p.name.toLowerCase() !== "type" && p.name.toLowerCase() !== "status" && p.type !== "relation")
            .map((p) => {
              const val = rowData.values[p.id];
              if (!val) return null;
              const badge = renderCardValue(
                p.type as PropertyType,
                val,
                p.id,
                p.name,
                p.options
              );
              if (!badge) return null;
              return <span key={p.id}>{badge}</span>;
            })}
        </div>
      )}

      {/* Trello bottom section: clip icon for subpages */}
      {hasSubpages && (
        <div className="flex items-center gap-x-1.5 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
          <Paperclip className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
          <span>{childSubpages.length}</span>
        </div>
      )}
    </div>
  );
};

export const KanbanBoard = ({
  documentId: _documentId,
  config,
  subpages,
  preview = false,
}: KanbanBoardProps) => {
  const update = useMutation(api.documents.update);
  const [columnColors, setColumnColors] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(`kanban-colors-${_documentId}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const setColumnColor = (colName: string, theme: string) => {
    setColumnColors(prev => {
      const updated = { ...prev, [colName]: theme };
      try {
        localStorage.setItem(`kanban-colors-${_documentId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const LIST_THEMES: Record<string, { bg: string; text: string; dot: string; hoverCard: string; hoverBtn: string }> = {
    default: {
      bg: "bg-neutral-50 dark:bg-neutral-900/50",
      text: "text-neutral-700 dark:text-neutral-300",
      dot: "bg-neutral-400",
      hoverCard: "hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/70 dark:hover:bg-neutral-850",
      hoverBtn: "hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 hover:text-neutral-800 dark:hover:text-neutral-200",
    },
    blue: {
      bg: "bg-blue-50/60 dark:bg-blue-950/20",
      text: "text-blue-700 dark:text-blue-400",
      dot: "bg-blue-500",
      hoverCard: "hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50/60 dark:hover:bg-blue-950/40",
      hoverBtn: "hover:bg-blue-100/70 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300",
    },
    green: {
      bg: "bg-emerald-50/60 dark:bg-emerald-950/20",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
      hoverCard: "hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40",
      hoverBtn: "hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300",
    },
    orange: {
      bg: "bg-amber-50/60 dark:bg-amber-950/20",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
      hoverCard: "hover:border-amber-300 dark:hover:border-amber-800 hover:bg-amber-50/60 dark:hover:bg-amber-950/40",
      hoverBtn: "hover:bg-amber-100/70 dark:hover:bg-amber-900/40 hover:text-amber-700 dark:hover:text-amber-300",
    },
    red: {
      bg: "bg-rose-50/60 dark:bg-rose-950/20",
      text: "text-rose-700 dark:text-rose-400",
      dot: "bg-rose-500",
      hoverCard: "hover:border-rose-300 dark:hover:border-rose-800 hover:bg-rose-50/60 dark:hover:bg-rose-950/40",
      hoverBtn: "hover:bg-rose-100/70 dark:hover:bg-rose-900/40 hover:text-rose-700 dark:hover:text-rose-300",
    },
    purple: {
      bg: "bg-purple-50/60 dark:bg-purple-950/20",
      text: "text-purple-700 dark:text-purple-400",
      dot: "bg-purple-500",
      hoverCard: "hover:border-purple-300 dark:hover:border-purple-800 hover:bg-purple-50/60 dark:hover:bg-purple-950/40",
      hoverBtn: "hover:bg-purple-100/70 dark:hover:bg-purple-900/40 hover:text-purple-700 dark:hover:text-purple-300",
    },
    pink: {
      bg: "bg-pink-50/60 dark:bg-pink-950/20",
      text: "text-pink-700 dark:text-pink-400",
      dot: "bg-pink-500",
      hoverCard: "hover:border-pink-300 dark:hover:border-pink-800 hover:bg-pink-50/60 dark:hover:bg-pink-950/40",
      hoverBtn: "hover:bg-pink-100/70 dark:hover:bg-pink-900/40 hover:text-pink-700 dark:hover:text-pink-300",
    },
  };

  // Group by property named "status" / "Status" first, otherwise fallback to the first select property
  const groupProp =
    config.properties.find((p) => p.id === "status" || p.name.toLowerCase() === "status") ||
    config.properties.find((p) => p.type === "select") || {
      id: "status",
      name: "Status",
      type: "select" as const,
      options: ["To Do", "In Progress", "Done"],
    };

  const columns = groupProp.options || ["To Do", "In Progress", "Done"];
  const extraProps = config.properties.filter((p) => p.id !== groupProp.id);

  const handleStatusChange = async (
    cardId: string,
    cardContent: string | undefined,
    newStatus: string
  ) => {
    if (preview) return;
    const rowConfig = parseDatabaseRow(cardContent);
    const updatedRow = {
      ...rowConfig,
      values: { ...rowConfig.values, [groupProp.id]: newStatus },
    };
    try {
      await update({
        id: cardId as Id<"documents">,
        content: JSON.stringify(updatedRow, null, 2),
      });
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDragStart = (e: React.DragEvent, cardId: string, cardContent: string | undefined) => {
    if (preview) return;
    e.dataTransfer.setData("cardId", cardId);
    e.dataTransfer.setData("cardContent", cardContent || "");
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: string) => {
    if (preview) return;
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    const cardContent = e.dataTransfer.getData("cardContent");
    if (cardId) await handleStatusChange(cardId, cardContent, targetColumn);
  };

  return (
    <div className="flex items-start gap-x-4 overflow-x-auto pb-4 pt-1 w-full scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
      {columns.map((colName) => {
        const columnCards = subpages.filter((page) => {
          const rowData = parseDatabaseRow(page.content);
          const val = rowData.values[groupProp.id] || columns[0];
          return val.toLowerCase() === colName.toLowerCase();
        });

        const selectedTheme = columnColors[colName] || "default";
        const themeStyles = LIST_THEMES[selectedTheme] || LIST_THEMES.default;
        const { dot, bg, text, hoverCard, hoverBtn } = selectedTheme === "default" ? getColStyle(colName) : themeStyles;

        return (
          <div
            key={colName}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, colName)}
            className={`flex flex-col ${bg} p-2.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800/80 min-w-[220px] max-w-[240px] flex-shrink-0 transition-colors duration-200 h-fit`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-0.5 group/header w-full">
              <div className="flex items-center gap-x-2 min-w-0">
                <span className={`h-2.5 w-2.5 rounded-full ${dot} shrink-0`} />
                <span className={`text-sm font-semibold truncate ${text}`}>{colName}</span>
                <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 shrink-0">
                  {columnCards.length}
                </span>
              </div>

              {!preview && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="opacity-0 group-hover/header:opacity-100 hover:bg-neutral-100 dark:hover:bg-neutral-850 p-1 rounded transition text-neutral-400 shrink-0 outline-none">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="dark:bg-neutral-900 w-36">
                    <div className="px-2 py-1 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                      List Color
                    </div>
                    {Object.keys(LIST_THEMES).map((themeName) => (
                      <DropdownMenuItem
                        key={themeName}
                        onClick={() => setColumnColor(colName, themeName)}
                        className="text-xs cursor-pointer flex items-center gap-x-2 capitalize"
                      >
                        <span className={`h-2 w-2 rounded-full ${LIST_THEMES[themeName].dot}`} />
                        {themeName}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-y-2 overflow-y-auto max-h-[520px]">
              {columnCards.map((card) => (
                <KanbanCard
                  key={card._id}
                  card={card}
                  preview={preview}
                  columns={columns}
                  groupProp={groupProp}
                  extraProps={extraProps}
                  hoverCard={hoverCard}
                  handleStatusChange={handleStatusChange}
                  handleDragStart={handleDragStart}
                />
              ))}

              {columnCards.length === 0 && (
                <div className="flex items-center justify-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-3 min-h-[50px] text-[11px] text-muted-foreground">
                  Drop here
                </div>
              )}
            </div>

            {/* + New page */}
            {!preview && (
              <button className={`mt-2 flex items-center gap-x-1.5 text-[11px] font-medium text-neutral-400 transition-all duration-150 pt-1.5 pb-1 px-1.5 rounded-md border-t border-neutral-200/60 dark:border-neutral-800/60 ${hoverBtn}`}>
                <Plus className="h-3 w-3" />
                <span>New page</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
