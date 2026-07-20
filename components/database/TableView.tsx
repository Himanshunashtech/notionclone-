"use client";

import { useMutation, useQuery } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { Doc, Id } from "@/lib/supabase-db";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DatabaseConfig,
  DatabaseProperty,
  PropertyType,
  PROPERTY_TYPE_META,
  defaultValueForType,
  parseDatabaseRow,
} from "./database-utils";
import { toast } from "sonner";
import Link from "next/link";
import {
  File,
  Plus,
  Trash2,
  Type,
  Hash,
  CircleDot,
  Tags,
  CalendarDays,
  CheckSquare2,
  Link as LinkIcon,
  Mail,
  Phone,
  ChevronDown,
  X,
  ArrowUpRight,
  FileText,
  Image,
  Paperclip
} from "lucide-react";
import { useState, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface TableViewProps {
  documentId: string;
  config: DatabaseConfig;
  subpages: Doc<"documents">[];
  preview?: boolean;
  onAddRow?: () => void;
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
  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
];

const STATUS_DOT: Record<string, string> = {
  "done": "bg-emerald-500",
  "complete": "bg-emerald-500",
  "completed": "bg-emerald-500",
  "delivery": "bg-emerald-500",
  "in progress": "bg-amber-500",
  "in-progress": "bg-amber-500",
  "building": "bg-amber-500",
  "discovery": "bg-amber-500",
  "qa": "bg-purple-500",
  "in review": "bg-blue-500",
  "review": "bg-blue-500",
  "blocked": "bg-rose-500",
  "new idea": "bg-neutral-400",
  "to do": "bg-neutral-400",
  "todo": "bg-neutral-400",
  "planning": "bg-purple-400",
};

const PRIORITY_COLOR: Record<string, string> = {
  high:   "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

function getOptionColor(prop: DatabaseProperty, value: string): string {
  const lc = value.toLowerCase();
  // Priority shortcut
  if (prop.id === "priority" || prop.name.toLowerCase() === "priority") {
    return PRIORITY_COLOR[lc] ?? SELECT_PALETTE[0];
  }
  // Status shortcut - use dot-based style but a fallback color
  const statusDot = STATUS_DOT[lc];
  if (statusDot) {
    if (lc.includes("done") || lc.includes("complet") || lc.includes("deliver"))
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (lc.includes("progress") || lc.includes("build") || lc.includes("discovery"))
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    if (lc.includes("qa") || lc.includes("review"))
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    if (lc.includes("block"))
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
    return "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";
  }
  // Deterministic color from palette based on option index
  const idx = (prop.options?.indexOf(value) ?? 0) % SELECT_PALETTE.length;
  return SELECT_PALETTE[Math.max(0, idx)];
}

function getStatusDot(value: string): string {
  return STATUS_DOT[value.toLowerCase()] ?? "bg-neutral-400";
}

function isStatusProp(prop: DatabaseProperty): boolean {
  return prop.id === "status" || prop.name.toLowerCase().includes("status");
}

// ─── Column header icon ─────────────────────────────────────────────────────

const TYPE_ICONS: Record<PropertyType, React.ReactNode> = {
  text:        <Type className="h-3 w-3" />,
  number:      <Hash className="h-3 w-3" />,
  select:      <CircleDot className="h-3 w-3" />,
  multiselect: <Tags className="h-3 w-3" />,
  date:        <CalendarDays className="h-3 w-3" />,
  checkbox:    <CheckSquare2 className="h-3 w-3" />,
  url:         <LinkIcon className="h-3 w-3" />,
  email:       <Mail className="h-3 w-3" />,
  phone:       <Phone className="h-3 w-3" />,
  pdf:         <FileText className="h-3 w-3" />,
  image:       <Image className="h-3 w-3" />,
  file:        <Paperclip className="h-3 w-3" />,
  relation:    <ArrowUpRight className="h-3.5 w-3.5" />,
};

// ─── Number formatting ──────────────────────────────────────────────────────

function formatNumber(raw: string, fmt?: DatabaseProperty["numberFormat"]): string {
  const n = parseFloat(raw);
  if (isNaN(n)) return raw;
  switch (fmt) {
    case "dollar":  return `$${n.toLocaleString()}`;
    case "euro":    return `€${n.toLocaleString()}`;
    case "percent": return `${n}%`;
    default:        return n.toLocaleString();
  }
}

// ─── Multi-select helpers ───────────────────────────────────────────────────

function parseMulti(raw: string): string[] {
  return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
}
function encodeMulti(arr: string[]): string {
  return arr.join(",");
}

// ═══════════════════════════════════════════════════════════════════════════
// Cell renderers
// ═══════════════════════════════════════════════════════════════════════════

interface CellProps {
  prop: DatabaseProperty;
  value: string;
  preview: boolean;
  onChange: (val: string) => void;
}

function SelectCell({ prop, value, preview, onChange }: CellProps) {
  const showDot = isStatusProp(prop);
  const colorCls = value ? getOptionColor(prop, value) : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500";
  const dotCls   = value ? getStatusDot(value) : "bg-neutral-300";

  if (preview) {
    return (
      <span className={`inline-flex items-center gap-x-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold ${colorCls}`}>
        {showDot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotCls}`} />}
        {value || "—"}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`inline-flex items-center gap-x-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold cursor-pointer hover:opacity-80 transition ${colorCls}`}>
        {showDot && value && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotCls}`} />}
        <span>{value || "Select…"}</span>
        <ChevronDown className="h-2.5 w-2.5 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="dark:bg-neutral-900 min-w-[150px]">
        {(prop.options || []).map((opt) => (
          <DropdownMenuItem
            key={opt}
            onClick={() => onChange(opt)}
            className="text-xs cursor-pointer"
          >
            <span className={`inline-flex items-center gap-x-1.5 px-2 py-0.5 rounded-md font-semibold ${getOptionColor(prop, opt)}`}>
              {showDot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${getStatusDot(opt)}`} />}
              {opt}
            </span>
          </DropdownMenuItem>
        ))}
        {!value && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-muted-foreground cursor-pointer" onClick={() => onChange("")}>
              Clear
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MultiSelectCell({ prop, value, preview, onChange }: CellProps) {
  const selected = parseMulti(value);

  const toggle = (opt: string) => {
    const updated = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(encodeMulti(updated));
  };

  if (preview) {
    return (
      <div className="flex flex-wrap gap-1">
        {selected.length === 0
          ? <span className="text-xs text-neutral-300 dark:text-neutral-600">—</span>
          : selected.map((s, i) => (
              <span key={i} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${SELECT_PALETTE[i % SELECT_PALETTE.length]}`}>
                {s}
              </span>
            ))
        }
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {selected.map((s, i) => (
        <span key={i} className={`inline-flex items-center gap-x-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${SELECT_PALETTE[i % SELECT_PALETTE.length]}`}>
          {s}
          <button
            onClick={() => toggle(s)}
            className="ml-0.5 hover:opacity-70 transition"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition">
          <Plus className="h-3 w-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="dark:bg-neutral-900 min-w-[150px]">
          <DropdownMenuLabel className="text-[10px] text-muted-foreground">Pick options</DropdownMenuLabel>
          {(prop.options || []).map((opt) => (
            <DropdownMenuItem
              key={opt}
              onClick={() => toggle(opt)}
              className="text-xs cursor-pointer flex items-center gap-x-2"
            >
              <span className={`h-2 w-2 rounded-sm ${selected.includes(opt) ? "bg-blue-500" : "bg-neutral-200 dark:bg-neutral-700"}`} />
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function NumberCell({ prop, value, preview, onChange }: CellProps) {
  if (preview) {
    return (
      <span className="text-xs text-neutral-700 dark:text-neutral-300 font-mono">
        {value ? formatNumber(value, prop.numberFormat) : <span className="text-neutral-300 dark:text-neutral-600">—</span>}
      </span>
    );
  }
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0"
      className="bg-transparent focus:bg-white dark:focus:bg-neutral-800 border-none outline-hidden w-full px-1.5 py-1 text-xs font-mono text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 rounded-md transition"
    />
  );
}

function DateCell({ prop: _prop, value, preview, onChange }: CellProps) {
  const formatted = (() => {
    if (!value) return "";
    if (value.includes("/")) {
      const [start, end] = value.split("/");
      try {
        const fmtStart = new Date(start).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
        const fmtEnd = new Date(end).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
        return `${fmtStart} ➔ ${fmtEnd}`;
      } catch {
        return value;
      }
    }
    try {
      return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return value;
    }
  })();

  if (preview) {
    return (
      <span className="text-xs text-neutral-600 dark:text-neutral-400">
        {formatted || <span className="text-neutral-300 dark:text-neutral-600">—</span>}
      </span>
    );
  }

  return (
    <div className="relative group/date">
      <input
        type={value.includes("/") ? "text" : "date"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent w-full text-xs text-neutral-700 dark:text-neutral-300 border-none outline-hidden px-1.5 py-1 cursor-pointer rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
      />
    </div>
  );
}

function CheckboxCell({ prop: _prop, value, preview, onChange }: CellProps) {
  const checked = value === "true";

  return (
    <button
      disabled={preview}
      onClick={() => onChange(checked ? "false" : "true")}
      className={`h-4 w-4 rounded border flex items-center justify-center transition ${
        checked
          ? "bg-blue-600 border-blue-600 text-white"
          : "border-neutral-300 dark:border-neutral-600 hover:border-blue-400"
      } ${preview ? "cursor-default" : "cursor-pointer"}`}
    >
      {checked && (
        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}

function UrlCell({ prop: _prop, value, preview, onChange }: CellProps) {
  if (preview && value) {
    return (
      <a
        href={value.startsWith("http") ? value : `https://${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[160px]"
      >
        <LinkIcon className="h-3 w-3 shrink-0" />
        <span className="truncate">{value}</span>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-x-1 w-full">
      <LinkIcon className="h-3 w-3 text-neutral-400 shrink-0" />
      <input
        disabled={preview}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://…"
        className="bg-transparent focus:bg-white dark:focus:bg-neutral-800 border-none outline-hidden flex-1 text-xs text-blue-600 dark:text-blue-400 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 px-1 py-1 rounded-md transition"
      />
    </div>
  );
}

function EmailCell({ prop: _prop, value, preview, onChange }: CellProps) {
  if (preview && value) {
    return (
      <a
        href={`mailto:${value}`}
        className="inline-flex items-center gap-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Mail className="h-3 w-3 shrink-0" />
        <span className="truncate">{value}</span>
      </a>
    );
  }
  return (
    <div className="flex items-center gap-x-1 w-full">
      <Mail className="h-3 w-3 text-neutral-400 shrink-0" />
      <input
        disabled={preview}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="name@example.com"
        className="bg-transparent focus:bg-white dark:focus:bg-neutral-800 border-none outline-hidden flex-1 text-xs text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 px-1 py-1 rounded-md transition"
      />
    </div>
  );
}

function PhoneCell({ prop: _prop, value, preview, onChange }: CellProps) {
  if (preview && value) {
    return (
      <a
        href={`tel:${value}`}
        className="inline-flex items-center gap-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Phone className="h-3 w-3 shrink-0" />
        <span>{value}</span>
      </a>
    );
  }
  return (
    <div className="flex items-center gap-x-1 w-full">
      <Phone className="h-3 w-3 text-neutral-400 shrink-0" />
      <input
        disabled={preview}
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="+1 555 000 0000"
        className="bg-transparent focus:bg-white dark:focus:bg-neutral-800 border-none outline-hidden flex-1 text-xs text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 px-1 py-1 rounded-md transition"
      />
    </div>
  );
}

function TextCell({ prop: _prop, value, preview, onChange }: CellProps) {
  return (
    <input
      disabled={preview}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="—"
      className="bg-transparent focus:bg-white dark:focus:bg-neutral-800 border-none outline-hidden w-full px-1.5 py-1 text-xs text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 rounded-md transition"
    />
  );
}

function RelationCell({ prop, value, preview, onChange }: CellProps) {
  const selectedIds = value ? value.split(",").filter(Boolean) : [];

  // Query linked pages
  const linkedPages = useQuery(
    api.documents.getSidebar,
    prop.linkedDatabaseId ? { parentDocument: prop.linkedDatabaseId } : "skip"
  );

  // If no database id or skipped, render simple text
  if (!prop.linkedDatabaseId) {
    return <span className="text-xs text-muted-foreground">No linked DB</span>;
  }

  const selectedPages = (linkedPages || []).filter((p: any) => selectedIds.includes(p._id));
  const availablePages = (linkedPages || []).filter((p: any) => !selectedIds.includes(p._id));

  const togglePage = (id: string) => {
    const updated = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange(updated.join(","));
  };

  const [search, setSearch] = useState("");

  const filteredAvailable = availablePages.filter((p: any) =>
    (p.title || "").toLowerCase().includes(search.toLowerCase())
  );

  // Query target database to get its properties configuration
  const targetDatabase = useQuery(
    api.documents.getById,
    prop.linkedDatabaseId ? { documentId: prop.linkedDatabaseId as Id<"documents"> } : "skip"
  );

  const createNote = useMutation(api.documents.create);
  const updateNote = useMutation(api.documents.update);

  const handleCreateNew = async () => {
    if (!search.trim() || !prop.linkedDatabaseId) return;

    const title = search.trim();
    setSearch("");

    try {
      const defaultValues: Record<string, string> = {};
      if (targetDatabase?.content) {
        try {
          const config = JSON.parse(targetDatabase.content);
          if (config.type === "database" && Array.isArray(config.properties)) {
            config.properties.forEach((p: any) => {
              defaultValues[p.id] = defaultValueForType(p);
            });
          }
        } catch (e) {
          console.error(e);
        }
      }

      const initialRowContent = JSON.stringify(
        { type: "database_row", values: defaultValues },
        null,
        2
      );

      const newId = await createNote({
        title,
        parentDocument: prop.linkedDatabaseId,
      });

      await updateNote({
        id: newId,
        content: initialRowContent,
      });

      const updated = [...selectedIds, newId];
      onChange(updated.join(","));

      toast.success(`Created and linked "${title}"`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create and link page");
    }
  };

  if (preview) {
    return (
      <div className="flex flex-wrap gap-1">
        {selectedPages.length === 0 ? (
          <span className="text-xs text-neutral-300 dark:text-neutral-600">—</span>
        ) : (
          selectedPages.map((page: any) => (
            <span key={page._id} className="inline-flex items-center gap-x-1 px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-350 text-[10px] font-medium border border-neutral-200/50 dark:border-neutral-750">
              {page.icon ? <span>{page.icon}</span> : <File className="h-2.5 w-2.5 text-neutral-400" />}
              <span>{page.title || "Untitled"}</span>
            </span>
          ))
        )}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger className="w-full text-left truncate flex flex-wrap gap-1 px-1.5 py-1 min-h-[28px] rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-850 cursor-pointer">
        {selectedPages.length === 0 ? (
          <span className="text-xs text-neutral-300 dark:text-neutral-600">—</span>
        ) : (
          selectedPages.map((page: any) => (
            <span key={page._id} className="inline-flex items-center gap-x-1 px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-350 text-[10px] font-medium border border-neutral-200/50 dark:border-neutral-750 select-none">
              {page.icon ? <span>{page.icon}</span> : <File className="h-2.5 w-2.5 text-neutral-400" />}
              <span>{page.title || "Untitled"}</span>
            </span>
          ))
        )}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 dark:bg-neutral-905" align="start">
        {/* Header Search */}
        <div className="p-2 border-b border-neutral-200 dark:border-neutral-800">
          <input
            placeholder={`Link or create a page...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-7 px-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-md outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Selected List */}
        {selectedPages.length > 0 && (
          <div className="p-1 border-b border-neutral-200 dark:border-neutral-800">
            <div className="px-2 py-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
              {selectedPages.length} Selected
            </div>
            {selectedPages.map((page: any) => (
              <div
                key={page._id}
                className="flex items-center justify-between px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-md text-xs group"
              >
                <div className="flex items-center gap-x-1.5 truncate">
                  {page.icon ? <span>{page.icon}</span> : <File className="h-3 w-3 text-neutral-400" />}
                  <span className="truncate">{page.title || "Untitled"}</span>
                </div>
                <button
                  onClick={() => togglePage(page._id)}
                  className="text-neutral-400 hover:text-rose-500 p-0.5 rounded transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Available list */}
        <div className="max-h-[180px] overflow-y-auto p-1">
          <div className="px-2 py-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            Select More
          </div>
          {filteredAvailable.length === 0 ? (
            <div className="px-2 py-3 text-center text-xs text-muted-foreground">
              No matching pages
            </div>
          ) : (
            filteredAvailable.map((page: any) => (
              <div
                key={page._id}
                onClick={() => togglePage(page._id)}
                className="flex items-center gap-x-1.5 px-2 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-md text-xs cursor-pointer select-none"
              >
                {page.icon ? <span>{page.icon}</span> : <File className="h-3 w-3 text-neutral-400" />}
                <span className="truncate">{page.title || "Untitled"}</span>
              </div>
            ))
          )}
        </div>

        {/* Create new option */}
        {search.trim() && (
          <div className="p-1 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850/50">
            <button
              onClick={handleCreateNew}
              className="w-full flex items-center gap-x-1.5 px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md text-xs text-blue-500 font-medium cursor-pointer text-left"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Create "{search.trim()}"</span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Master cell router
function CellRenderer(props: CellProps) {
  switch (props.prop.type) {
    case "select":      return <SelectCell {...props} />;
    case "multiselect": return <MultiSelectCell {...props} />;
    case "number":      return <NumberCell {...props} />;
    case "date":        return <DateCell {...props} />;
    case "checkbox":    return <CheckboxCell {...props} />;
    case "url":         return <UrlCell {...props} />;
    case "email":       return <EmailCell {...props} />;
    case "phone":       return <PhoneCell {...props} />;
    case "relation":    return <RelationCell {...props} />;
    default:            return <TextCell {...props} />;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Add-column panel
// ═══════════════════════════════════════════════════════════════════════════

const ALL_TYPES: PropertyType[] = [
  "text", "number", "select", "multiselect",
  "date", "checkbox", "url", "email", "phone",
];

interface AddColumnPanelProps {
  onAdd: (name: string, type: PropertyType) => void;
}

function AddColumnPanel({ onAdd }: AddColumnPanelProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PropertyType>("text");
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), type);
    setName("");
    setType("text");
  };

  return (
    <th className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 min-w-[240px]">
      <div className="flex items-center gap-x-1.5">
        <Input
          ref={inputRef}
          placeholder="Column name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="h-6 text-xs px-2 w-28 border-neutral-200 dark:border-neutral-700"
        />

        {/* Type picker dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-6 px-2 rounded border border-neutral-200 dark:border-neutral-700 text-[10px] flex items-center gap-x-1 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition text-neutral-600 dark:text-neutral-300">
            {TYPE_ICONS[type]}
            <span>{PROPERTY_TYPE_META[type].label}</span>
            <ChevronDown className="h-2.5 w-2.5 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="dark:bg-neutral-900 min-w-[160px]">
            <DropdownMenuLabel className="text-[10px] text-muted-foreground">Property type</DropdownMenuLabel>
            {ALL_TYPES.map((t) => (
              <DropdownMenuItem
                key={t}
                onClick={() => setType(t)}
                className={`text-xs cursor-pointer flex items-center gap-x-2 ${t === type ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : ""}`}
              >
                <span className="text-neutral-400">{TYPE_ICONS[t]}</span>
                {PROPERTY_TYPE_META[t].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={commit}
          className="h-6 w-6 rounded border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-neutral-500"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </th>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TableView
// ═══════════════════════════════════════════════════════════════════════════

export const TableView = ({
  documentId,
  config,
  subpages,
  preview = false,
  onAddRow,
}: TableViewProps) => {
  const update = useMutation(api.documents.update);
  const [calculations, setCalculations] = useState<Record<string, "sum" | "avg" | "min" | "max" | "count" | "filled" | "empty">>({});

  const getColumnCalculation = (prop: DatabaseProperty) => {
    const calcType = calculations[prop.id] || (prop.type === "number" ? "sum" : "count");
    const values = subpages.map((p) => {
      const row = parseDatabaseRow(p.content);
      return row.values[prop.id] ?? "";
    });

    if (calcType === "count") {
      return `Count: ${values.length}`;
    }

    const filledCount = values.filter((v) => v !== "").length;
    if (calcType === "filled") {
      return `Filled: ${filledCount}`;
    }
    if (calcType === "empty") {
      return `Empty: ${values.length - filledCount}`;
    }

    if (prop.type === "number") {
      const numbers = values.map((v) => parseFloat(v)).filter((n) => !isNaN(n));
      if (numbers.length === 0) return "-";
      if (calcType === "sum") {
        const sum = numbers.reduce((a, b) => a + b, 0);
        return `Sum: ${sum}`;
      }
      if (calcType === "avg") {
        const sum = numbers.reduce((a, b) => a + b, 0);
        return `Avg: ${(sum / numbers.length).toFixed(2)}`;
      }
      if (calcType === "min") {
        return `Min: ${Math.min(...numbers)}`;
      }
      if (calcType === "max") {
        return `Max: ${Math.max(...numbers)}`;
      }
    }

    if (prop.type === "checkbox") {
      const checked = values.filter((v) => v === "true").length;
      return `Checked: ${checked}`;
    }

    return `Count: ${values.length}`;
  };

  const handleCellChange = async (
    rowId: string,
    rowContent: string | undefined,
    propId: string,
    value: string
  ) => {
    if (preview) return;
    const rowConfig = parseDatabaseRow(rowContent);
    const updatedRow = {
      ...rowConfig,
      values: { ...rowConfig.values, [propId]: value },
    };
    try {
      await update({
        id: rowId as Id<"documents">,
        content: JSON.stringify(updatedRow, null, 2),
      });
    } catch {
      toast.error("Failed to update cell");
    }
  };

  const handleAddColumn = async (name: string, type: PropertyType) => {
    if (preview) return;
    const propId = name.toLowerCase().replace(/\s+/g, "_");

    if (config.properties.some((p) => p.id === propId)) {
      toast.error("A column with that name already exists");
      return;
    }

    const newProp: DatabaseProperty = {
      id: propId,
      name,
      type,
      options: (() => {
        if (type !== "select" && type !== "multiselect") return undefined;
        const lc = name.toLowerCase();
        if (lc.includes("priority"))
          return ["High", "Medium", "Low"];
        if (lc.includes("status") || lc.includes("state") || lc.includes("stage"))
          return ["To Do", "In Progress", "Done"];
        if (lc.includes("difficulty") || lc.includes("effort"))
          return ["Easy", "Medium", "Hard"];
        if (lc.includes("size"))
          return ["Small", "Medium", "Large", "X-Large"];
        // Generic fallback
        return ["Option 1", "Option 2", "Option 3"];
      })(),
    };

    const newConfig = {
      ...config,
      properties: [...config.properties, newProp],
    };

    try {
      await update({
        id: documentId as Id<"documents">,
        content: JSON.stringify(newConfig, null, 2),
      });
      toast.success(`"${name}" column added`);
    } catch {
      toast.error("Failed to add column");
    }
  };

  const handleRemoveColumn = async (propId: string) => {
    if (preview) return;
    const newConfig = {
      ...config,
      properties: config.properties.filter((p) => p.id !== propId),
    };
    try {
      await update({
        id: documentId as Id<"documents">,
        content: JSON.stringify(newConfig, null, 2),
      });
    } catch {
      toast.error("Failed to remove column");
    }
  };

  return (
    <div className="overflow-x-auto min-h-[480px] border border-neutral-200/60 dark:border-neutral-800/80 rounded-xl shadow-sm bg-white dark:bg-neutral-900/40 p-3">
      <table className="w-full text-left border-collapse text-sm">
        {/* ── Header ─────────────────────────────────────── */}
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            {/* Name column */}
            <th className="px-3.5 py-3.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 min-w-[280px]">
              <div className="flex items-center gap-x-1.5">
                <span className="text-[10px] font-bold text-neutral-400">Aa</span>
                <span>Name</span>
              </div>
            </th>

            {config.properties.map((prop) => (
              <th
                key={prop.id}
                className="px-3.5 py-3.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 min-w-[180px]"
              >
                <div className="flex items-center justify-between group/header">
                  <div className="flex items-center gap-x-1.5 text-neutral-400">
                    {TYPE_ICONS[prop.type]}
                    <span className="text-neutral-500 dark:text-neutral-400">{prop.name}</span>
                  </div>
                  {!preview && (
                    <button
                      onClick={() => handleRemoveColumn(prop.id)}
                      className="opacity-0 group-hover/header:opacity-100 hover:text-rose-500 transition text-neutral-400 ml-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </th>
            ))}

            {!preview && <AddColumnPanel onAdd={handleAddColumn} />}
          </tr>
        </thead>

        {/* ── Body ───────────────────────────────────────── */}
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {subpages.map((page) => {
            const rowData = parseDatabaseRow(page.content);
            const pageLink = `/documents/${page._id}`;

            return (
              <tr
                key={page._id}
                className="group/row hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition"
              >
                {/* Name */}
                <td className="px-3.5 py-4 font-medium text-neutral-800 dark:text-neutral-200">
                  <Link
                    href={pageLink}
                    className="flex items-center gap-x-2 hover:underline"
                  >
                    {page.icon ? (
                      <span className="text-base shrink-0">{page.icon}</span>
                    ) : (
                      <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate text-sm">
                      {page.title || "Untitled"}
                    </span>
                  </Link>
                </td>

                {/* Property cells */}
                {config.properties.map((prop) => {
                  const val = rowData.values[prop.id] ?? "";
                  return (
                    <td key={prop.id} className="px-3.5 py-3">
                      <CellRenderer
                        prop={prop}
                        value={val}
                        preview={preview}
                        onChange={(v) =>
                          handleCellChange(page._id, page.content, prop.id, v)
                        }
                      />
                    </td>
                  );
                })}

                {!preview && <td className="px-3 py-2" />}
              </tr>
            );
          })}

          {/* Calculations row (Trello & AppFlowy style) */}
          <tr className="bg-neutral-50/40 dark:bg-neutral-900/10 border-t border-neutral-200 dark:border-neutral-800/80 font-medium text-xs text-neutral-500">
            <td className="px-3.5 py-3 font-semibold text-neutral-400">
              Count: {subpages.length}
            </td>

            {config.properties.map((prop) => (
              <td key={prop.id} className="px-3.5 py-3 align-middle">
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-[10px] font-bold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-250 transition-colors uppercase tracking-wider px-1.5 py-0.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 select-none">
                    {getColumnCalculation(prop)}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="dark:bg-neutral-900 min-w-[140px]">
                    <DropdownMenuLabel className="text-[9px] uppercase tracking-wider">Calculation Type</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setCalculations(prev => ({ ...prev, [prop.id]: "count" }))} className="text-xs cursor-pointer">Count all</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCalculations(prev => ({ ...prev, [prop.id]: "filled" }))} className="text-xs cursor-pointer">Count filled</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCalculations(prev => ({ ...prev, [prop.id]: "empty" }))} className="text-xs cursor-pointer">Count empty</DropdownMenuItem>
                    {prop.type === "number" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setCalculations(prev => ({ ...prev, [prop.id]: "sum" }))} className="text-xs cursor-pointer">Sum</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCalculations(prev => ({ ...prev, [prop.id]: "avg" }))} className="text-xs cursor-pointer">Average</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCalculations(prev => ({ ...prev, [prop.id]: "min" }))} className="text-xs cursor-pointer">Min</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCalculations(prev => ({ ...prev, [prop.id]: "max" }))} className="text-xs cursor-pointer">Max</DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            ))}

            {!preview && <td className="px-3.5 py-3" />}
          </tr>

          {/* Add row hint */}
          {!preview && (
            <tr>
              <td
                colSpan={config.properties.length + 2}
                className="px-3 py-2"
              >
                <button
                  onClick={onAddRow}
                  className="flex items-center gap-x-1.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New row</span>
                </button>
              </td>
            </tr>
          )}

          {subpages.length === 0 && (
            <tr>
              <td
                colSpan={config.properties.length + 2}
                className="px-3 py-12 text-center text-xs text-muted-foreground"
              >
                No items yet. Click <strong>New</strong> in the toolbar to add one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
