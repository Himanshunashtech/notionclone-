"use client";

import React from "react";
import { Doc } from "@/lib/supabase-db";
import { DatabaseConfig, PropertyType, parseDatabaseRow } from "./database-utils";
import { File, Plus, CalendarDays, Link as LinkIcon, Mail, Phone, Hash, Eye, Sparkles } from "lucide-react";
import Link from "next/link";

interface GalleryViewProps {
  documentId: string;
  config: DatabaseConfig;
  subpages: Doc<"documents">[];
  preview?: boolean;
  onAddRow?: () => void;
}

// ─── Color & Option helpers (consistent with Kanban & Table) ───────────────────

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

const GRADIENTS = [
  "from-violet-500 to-indigo-500",
  "from-blue-400 to-emerald-400",
  "from-pink-500 to-rose-400",
  "from-amber-400 to-orange-500",
  "from-cyan-500 to-blue-600",
];

function getDeterministicGradient(id: string): string {
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i);
  }
  return GRADIENTS[sum % GRADIENTS.length];
}

function renderGalleryValue(
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
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${SELECT_PALETTE[i % SELECT_PALETTE.length]}`}>
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-[10px] text-neutral-400">+{tags.length - 3}</span>
          )}
        </div>
      );
    }

    case "date":
      return (
        <span className="flex items-center gap-x-1 text-[10px] text-neutral-500 dark:text-neutral-400">
          <CalendarDays className="h-3 w-3 text-neutral-455" />
          {new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </span>
      );

    case "number":
      return (
        <span className="flex items-center gap-x-1 text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
          <Hash className="h-3 w-3 text-neutral-455" />
          {value}
        </span>
      );

    case "url":
      return (
        <span className="flex items-center gap-x-1 text-[10px] text-blue-600 dark:text-blue-400 truncate">
          <LinkIcon className="h-3 w-3 text-neutral-455 shrink-0" />
          <span className="truncate">{value}</span>
        </span>
      );

    case "email":
      return (
        <span className="flex items-center gap-x-1 text-[10px] text-blue-600 dark:text-blue-400 truncate">
          <Mail className="h-3 w-3 text-neutral-455 shrink-0" />
          <span className="truncate">{value}</span>
        </span>
      );

    case "phone":
      return (
        <span className="flex items-center gap-x-1 text-[10px] text-neutral-500 dark:text-neutral-400">
          <Phone className="h-3 w-3 text-neutral-455 shrink-0" />
          {value}
        </span>
      );

    case "select":
    default:
      return (
        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${getPillColor(propId, propName, options, value)}`}>
          {value}
        </span>
      );
  }
}

export const GalleryView = ({
  documentId,
  config,
  subpages,
  preview = false,
  onAddRow,
}: GalleryViewProps) => {
  // Show standard properties besides page name
  const visibleProps = config.properties.filter((p) => p.id !== "name");

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subpages.map((page) => {
          const rowData = parseDatabaseRow(page.content);
          const pageLink = `/documents/${page._id}`;
          const coverGradient = getDeterministicGradient(page._id);

          return (
            <div
              key={page._id}
              className="group/gallery-card relative bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800/80 overflow-hidden shadow-xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition duration-250 flex flex-col h-full"
            >
              {/* Cover area */}
              <Link href={pageLink} className="relative block h-28 w-full overflow-hidden border-b border-neutral-100 dark:border-neutral-800">
                {page.coverImage ? (
                  <img
                    src={page.coverImage}
                    alt="Page cover"
                    className="w-full h-full object-cover group-hover/gallery-card:scale-105 transition duration-500"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${coverGradient} opacity-85 group-hover/gallery-card:scale-105 transition duration-500`} />
                )}
                {/* Floating Preview button */}
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/gallery-card:opacity-100 flex items-center justify-center transition duration-200">
                  <div className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-lg bg-white/95 dark:bg-neutral-900/95 text-xs font-semibold text-neutral-850 dark:text-white shadow-md">
                    <Eye className="h-3.5 w-3.5" />
                    <span>Open page</span>
                  </div>
                </div>
              </Link>

              {/* Page Icon container overlapping cover */}
              {page.icon && (
                <div className="absolute top-[88px] left-4 z-10 w-9 h-9 rounded-lg bg-white dark:bg-neutral-850 shadow-md border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-lg select-none">
                  {page.icon}
                </div>
              )}

              {/* Card Body */}
              <div className={`p-4 flex-1 flex flex-col justify-between ${page.icon ? "pt-7" : "pt-4"}`}>
                <div className="space-y-1">
                  <Link
                    href={pageLink}
                    className="text-sm font-semibold text-neutral-850 dark:text-white hover:underline line-clamp-2 block leading-snug"
                  >
                    {page.title || "Untitled"}
                  </Link>

                  {/* Render other database properties on the card */}
                  {visibleProps.length > 0 && (
                    <div className="pt-2.5 space-y-2">
                      {visibleProps.map((prop) => {
                        const val = rowData.values[prop.id];
                        if (!val) return null;
                        return (
                          <div key={prop.id} className="flex items-center gap-x-2 text-xs">
                            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider w-16 shrink-0 truncate">
                              {prop.name}
                            </span>
                            <div className="min-w-0 flex-1 truncate">
                              {renderGalleryValue(prop.type, val, prop.id, prop.name, prop.options)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Create new page card */}
        {!preview && onAddRow && (
          <button
            onClick={onAddRow}
            className="group/new-card flex flex-col items-center justify-center min-h-[200px] h-full p-6 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 bg-neutral-25/30 hover:bg-neutral-50/50 dark:bg-neutral-900/10 dark:hover:bg-neutral-900/30 transition text-center cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center text-neutral-400 group-hover/new-card:text-blue-500 group-hover/new-card:bg-blue-50 dark:group-hover/new-card:bg-blue-950/30 transition mb-3">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 group-hover/new-card:text-neutral-800 dark:group-hover/new-card:text-white transition">
              Add new card
            </span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-[150px]">
              Create a new database page item
            </span>
          </button>
        )}
      </div>

      {/* Empty State when no subpages */}
      {subpages.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
          <Sparkles className="h-8 w-8 text-neutral-350 dark:text-neutral-600 mb-3" />
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">No records found</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            This database is currently empty. Click the card above or use the "New" button to add a page.
          </p>
        </div>
      )}
    </div>
  );
};
