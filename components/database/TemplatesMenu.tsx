"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  FileText,
  KanbanSquare,
  Table,
  CheckSquare,
  Sparkles,
  Users,
  FolderOpen,
  Target,
  CalendarDays,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";

type TemplateCategory = "general" | "meeting" | "docs";

interface TemplatesMenuProps {
  documentId: string;
  onSelect: (type: "table" | "board" | "todo" | "document", content: string) => void;
}

// ─── Template configs ────────────────────────────────────────────────────────

const MEETING_TABLE_CONFIG = JSON.stringify({
  type: "database",
  viewType: "table",
  properties: [
    { id: "status",    name: "Status",    type: "select",  options: ["To Do", "In Progress", "Done", "Blocked"] },
    { id: "priority",  name: "Priority",  type: "select",  options: ["High", "Medium", "Low"] },
    { id: "owner",     name: "Owner",     type: "text" },
    { id: "due_date",  name: "Due Date",  type: "date" },
    { id: "meeting_type", name: "Meeting Type", type: "select", options: ["1:1", "Team Sync", "All Hands", "Retrospective", "Planning"] },
  ],
}, null, 2);

const MEETING_BOARD_CONFIG = JSON.stringify({
  type: "database",
  viewType: "board",
  properties: [
    { id: "status",   name: "Status",   type: "select", options: ["To Do", "In Progress", "Done", "Blocked"] },
    { id: "priority", name: "Priority", type: "select", options: ["High", "Medium", "Low"] },
    { id: "owner",    name: "Owner",    type: "text" },
    { id: "due_date", name: "Due Date", type: "date" },
  ],
}, null, 2);

const MEETING_LIST_CONFIG = JSON.stringify({
  type: "database",
  viewType: "todo",
  properties: [
    { id: "status",   name: "Status",   type: "select", options: ["To Do", "Done"] },
    { id: "priority", name: "Priority", type: "select", options: ["High", "Medium", "Low"] },
    { id: "owner",    name: "Owner",    type: "text" },
    { id: "due_date", name: "Due Date", type: "date" },
  ],
}, null, 2);

const GALLERY_CONFIG = JSON.stringify({
  type: "database",
  viewType: "gallery",
  properties: [
    { id: "status",   name: "Status",   type: "select", options: ["Active", "Draft", "Archived"] },
    { id: "tags",     name: "Tags",     type: "multiselect", options: ["Design", "Dev", "Marketing"] },
  ],
}, null, 2);

const getMeetingNotesContent = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const timeStr = `${hour12}:${minutes} ${ampm}`;
  const dateLabel = `@Today  ${timeStr}`;

  return JSON.stringify([
    {
      id: "heading-1",
      type: "heading",
      props: { level: 1, textColor: "default", backgroundColor: "default", textAlignment: "left" },
      content: [{ type: "text", text: "\uD83D\uDCC5 Meeting Notes", styles: { bold: true } }],
      children: [],
    },
    {
      id: "meta-date",
      type: "paragraph",
      props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
      content: [{ type: "text", text: `Date: ${dateLabel}`, styles: { italic: true } }],
      children: [],
    },
    {
      id: "meta-attendees",
      type: "paragraph",
      props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
      content: [{ type: "text", text: "Attendees: ", styles: {} }],
      children: [],
    },
    {
      id: "heading-agenda",
      type: "heading",
      props: { level: 3, textColor: "default", backgroundColor: "default", textAlignment: "left" },
      content: [{ type: "text", text: "Agenda", styles: { bold: true } }],
      children: [],
    },
    {
      id: "agenda-1",
      type: "bulletListItem",
      props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
      content: [{ type: "text", text: "Discuss current roadmap and release plan", styles: {} }],
      children: [],
    },
    {
      id: "agenda-2",
      type: "bulletListItem",
      props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
      content: [{ type: "text", text: "Review blockers and outstanding tasks", styles: {} }],
      children: [],
    },
    {
      id: "heading-decisions",
      type: "heading",
      props: { level: 3, textColor: "default", backgroundColor: "default", textAlignment: "left" },
      content: [{ type: "text", text: "Key Decisions", styles: { bold: true } }],
      children: [],
    },
    {
      id: "decision-1",
      type: "bulletListItem",
      props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
      content: [{ type: "text", text: "\u2014", styles: {} }],
      children: [],
    },
    {
      id: "heading-actions",
      type: "heading",
      props: { level: 3, textColor: "default", backgroundColor: "default", textAlignment: "left" },
      content: [{ type: "text", text: "Action Items", styles: { bold: true } }],
      children: [],
    },
    {
      id: "action-1",
      type: "checkListItem",
      props: { checked: false, textColor: "default", backgroundColor: "default", textAlignment: "left" },
      content: [{ type: "text", text: "Follow up on open items", styles: {} }],
      children: [],
    },
  ], null, 2);
};

const PROJECT_TABLE_CONFIG = JSON.stringify({
  type: "database",
  viewType: "table",
  properties: [
    { id: "status",    name: "Status",    type: "select",  options: ["To Do", "In Progress", "Done"] },
    { id: "priority",  name: "Priority",  type: "select",  options: ["High", "Medium", "Low"] },
    { id: "due_date",  name: "Due Date",  type: "date" },
    { id: "progress",  name: "Progress",  type: "select",  options: ["0%", "25%", "50%", "75%", "100%"] },
    { id: "tags",      name: "Tags",      type: "multiselect", options: ["Frontend", "Backend", "Design", "QA", "Docs"] },
  ],
}, null, 2);

const DOCUMENT_HUB_CONFIG = JSON.stringify({
  type: "database",
  viewType: "document",
  properties: [],
}, null, 2);

// ─── Template card definition ────────────────────────────────────────────────

interface TemplateCard {
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;        // hover/icon accent
  type: "table" | "board" | "todo" | "document";
  content: string;
  category: TemplateCategory;
}

const TEMPLATES: TemplateCard[] = [
  // ── General ──────────────────────────────────────────────────────────────
  {
    label: "Simple Note",
    desc: "A clean blank document for standard notes",
    icon: <FileText className="h-6 w-6" />,
    color: "sky",
    type: "document",
    content: "",
    category: "general",
  },
  {
    label: "Database Table",
    desc: "Track anything in a structured table",
    icon: <Table className="h-6 w-6" />,
    color: "emerald",
    type: "table",
    content: PROJECT_TABLE_CONFIG,
    category: "general",
  },
  {
    label: "Kanban Board",
    desc: "Visualize work across swim-lanes",
    icon: <KanbanSquare className="h-6 w-6" />,
    color: "amber",
    type: "board",
    content: MEETING_BOARD_CONFIG,
    category: "general",
  },
  {
    label: "Task List",
    desc: "Simple to-do list with checkboxes",
    icon: <CheckSquare className="h-6 w-6" />,
    color: "indigo",
    type: "todo",
    content: MEETING_LIST_CONFIG,
    category: "general",
  },
  {
    label: "Gallery View",
    desc: "Display visual cards with image previews",
    icon: <LayoutGrid className="h-6 w-6" />,
    color: "violet",
    type: "table",
    content: GALLERY_CONFIG,
    category: "general",
  },
  {
    label: "Document Hub",
    desc: "Auto-table of all sub-pages with type & status",
    icon: <FolderOpen className="h-6 w-6" />,
    color: "sky",
    type: "document",
    content: DOCUMENT_HUB_CONFIG,
    category: "docs",
  },
  // ── Meeting ───────────────────────────────────────────────────────────────
  {
    label: "Meeting Notes",
    desc: "Rich notes with agenda & action items",
    icon: <FileText className="h-6 w-6" />,
    color: "sky",
    type: "document",
    content: "",
    category: "meeting",
  },
  {
    label: "Meeting Action Table",
    desc: "Track action items in a table with owner & date",
    icon: <Target className="h-6 w-6" />,
    color: "emerald",
    type: "table",
    content: MEETING_TABLE_CONFIG,
    category: "meeting",
  },
  {
    label: "Meeting Board",
    desc: "Kanban of action items by status",
    icon: <KanbanSquare className="h-6 w-6" />,
    color: "amber",
    type: "board",
    content: MEETING_BOARD_CONFIG,
    category: "meeting",
  },
  {
    label: "Action Checklist",
    desc: "Simple checked list of action items",
    icon: <CheckSquare className="h-6 w-6" />,
    color: "indigo",
    type: "todo",
    content: MEETING_LIST_CONFIG,
    category: "meeting",
  },
  // ── Docs ──────────────────────────────────────────────────────────────────
  {
    label: "Team Wiki",
    desc: "Document hub for team knowledge base",
    icon: <Users className="h-6 w-6" />,
    color: "violet",
    type: "document",
    content: DOCUMENT_HUB_CONFIG,
    category: "docs",
  },
  {
    label: "Project Roadmap",
    desc: "Roadmap table with status, priority & tags",
    icon: <CalendarDays className="h-6 w-6" />,
    color: "rose",
    type: "table",
    content: PROJECT_TABLE_CONFIG,
    category: "docs",
  },
];

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  general: "General",
  meeting: "Meeting",
  docs:    "Docs & Wiki",
};

const COLOR_MAP: Record<string, { hover: string; text: string; bg: string }> = {
  emerald: { hover: "hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400", text: "text-emerald-500",   bg: "group-hover:text-emerald-500" },
  amber:   { hover: "hover:border-amber-400   hover:text-amber-600   dark:hover:text-amber-400",   text: "text-amber-500",     bg: "group-hover:text-amber-500" },
  indigo:  { hover: "hover:border-indigo-400  hover:text-indigo-600  dark:hover:text-indigo-400",  text: "text-indigo-500",    bg: "group-hover:text-indigo-500" },
  sky:     { hover: "hover:border-sky-400     hover:text-sky-600     dark:hover:text-sky-400",     text: "text-sky-500",       bg: "group-hover:text-sky-500" },
  violet:  { hover: "hover:border-violet-400  hover:text-violet-600  dark:hover:text-violet-400",  text: "text-violet-500",    bg: "group-hover:text-violet-500" },
  rose:    { hover: "hover:border-rose-400    hover:text-rose-600    dark:hover:text-rose-400",    text: "text-rose-500",      bg: "group-hover:text-rose-500" },
};

// ═══════════════════════════════════════════════════════════════════════════
// TemplatesMenu
// ═══════════════════════════════════════════════════════════════════════════

export const TemplatesMenu = ({ documentId: _documentId, onSelect }: TemplatesMenuProps) => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("general");

  const filtered = TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-3xl mx-auto my-6 bg-white dark:bg-neutral-950 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-x-2 px-6 pt-6 pb-4">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Start with a template
          </h2>
          <p className="text-xs text-muted-foreground">
            Pick a layout or template to kickstart this page.
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-x-0 border-b border-neutral-200 dark:border-neutral-800 px-6">
        {(Object.keys(CATEGORY_LABELS) as TemplateCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`relative px-3 py-2.5 text-xs font-semibold transition-colors select-none ${
              activeCategory === cat
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {CATEGORY_LABELS[cat]}
            {activeCategory === cat && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 gap-3 p-5">
        {filtered.map((tmpl) => {
          return (
            <Button
              key={tmpl.label}
              variant="outline"
              className="group h-auto flex flex-col items-start gap-y-1.5 p-4 border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/60 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-left transition"
              onClick={() => {
                const content = tmpl.label === "Meeting Notes" ? getMeetingNotesContent() : tmpl.content;
                onSelect(tmpl.type, content);
              }}
            >
              <div className="p-1.5 rounded-lg bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition">
                {tmpl.icon}
              </div>
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
                {tmpl.label}
              </span>
              <span className="text-[11px] text-muted-foreground font-normal leading-snug">
                {tmpl.desc}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
