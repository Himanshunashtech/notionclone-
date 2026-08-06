"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMutation } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTemplates } from "@/hooks/useTemplatesModal";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

/* ─────────────────────────── configs ─────────────────────────── */

const MEETING_TABLE_CONFIG = JSON.stringify({
  type: "database",
  viewType: "table",
  properties: [
    { id: "status", name: "Status", type: "select", options: ["To Do", "In Progress", "Done", "Blocked"] },
    { id: "priority", name: "Priority", type: "select", options: ["High", "Medium", "Low"] },
    { id: "owner", name: "Owner", type: "text" },
    { id: "due_date", name: "Due Date", type: "date" },
    { id: "meeting_type", name: "Meeting Type", type: "select", options: ["1:1", "Team Sync", "All Hands", "Retrospective", "Planning"] },
  ],
}, null, 2);

const MEETING_BOARD_CONFIG = JSON.stringify({
  type: "database",
  viewType: "board",
  properties: [
    { id: "status", name: "Status", type: "select", options: ["To Do", "In Progress", "Done", "Blocked"] },
    { id: "priority", name: "Priority", type: "select", options: ["High", "Medium", "Low"] },
    { id: "owner", name: "Owner", type: "text" },
    { id: "due_date", name: "Due Date", type: "date" },
  ],
}, null, 2);

const MEETING_LIST_CONFIG = JSON.stringify({
  type: "database",
  viewType: "todo",
  properties: [
    { id: "status", name: "Status", type: "select", options: ["To Do", "Done"] },
    { id: "priority", name: "Priority", type: "select", options: ["High", "Medium", "Low"] },
    { id: "owner", name: "Owner", type: "text" },
    { id: "due_date", name: "Due Date", type: "date" },
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
    { id: "heading-1", type: "heading", props: { level: 1, textColor: "default", backgroundColor: "default", textAlignment: "left" }, content: [{ type: "text", text: "\uD83D\uDCC5 Meeting Notes", styles: { bold: true } }], children: [] },
    { id: "meta-date", type: "paragraph", props: { textColor: "default", backgroundColor: "default", textAlignment: "left" }, content: [{ type: "text", text: `Date: ${dateLabel}`, styles: { italic: true } }], children: [] },
    { id: "meta-attendees", type: "paragraph", props: { textColor: "default", backgroundColor: "default", textAlignment: "left" }, content: [{ type: "text", text: "Attendees: ", styles: {} }], children: [] },
    { id: "heading-agenda", type: "heading", props: { level: 3, textColor: "default", backgroundColor: "default", textAlignment: "left" }, content: [{ type: "text", text: "Agenda", styles: { bold: true } }], children: [] },
    { id: "agenda-1", type: "bulletListItem", props: { textColor: "default", backgroundColor: "default", textAlignment: "left" }, content: [{ type: "text", text: "Discuss current roadmap and release plan", styles: {} }], children: [] },
    { id: "agenda-2", type: "bulletListItem", props: { textColor: "default", backgroundColor: "default", textAlignment: "left" }, content: [{ type: "text", text: "Review blockers and outstanding tasks", styles: {} }], children: [] },
    { id: "heading-decisions", type: "heading", props: { level: 3, textColor: "default", backgroundColor: "default", textAlignment: "left" }, content: [{ type: "text", text: "Key Decisions", styles: { bold: true } }], children: [] },
    { id: "decision-1", type: "bulletListItem", props: { textColor: "default", backgroundColor: "default", textAlignment: "left" }, content: [{ type: "text", text: "\u2014", styles: {} }], children: [] },
    { id: "heading-actions", type: "heading", props: { level: 3, textColor: "default", backgroundColor: "default", textAlignment: "left" }, content: [{ type: "text", text: "Action Items", styles: { bold: true } }], children: [] },
    { id: "action-1", type: "checkListItem", props: { checked: false, textColor: "default", backgroundColor: "default", textAlignment: "left" }, content: [{ type: "text", text: "Follow up on open items", styles: {} }], children: [] },
  ], null, 2);
};

const PROJECT_TABLE_CONFIG = JSON.stringify({
  type: "database",
  viewType: "table",
  properties: [
    { id: "status", name: "Status", type: "select", options: ["To Do", "In Progress", "Done"] },
    { id: "priority", name: "Priority", type: "select", options: ["High", "Medium", "Low"] },
    { id: "due_date", name: "Due Date", type: "date" },
    { id: "progress", name: "Progress", type: "select", options: ["0%", "25%", "50%", "75%", "100%"] },
    { id: "tags", name: "Tags", type: "multiselect", options: ["Frontend", "Backend", "Design", "QA", "Docs"] },
  ],
}, null, 2);

const DOCUMENT_HUB_CONFIG = JSON.stringify({
  type: "database",
  viewType: "document",
  properties: [],
}, null, 2);

const GOALS_CONFIG = JSON.stringify({
  type: "database",
  viewType: "table",
  properties: [
    { id: "status", name: "Status", type: "select", options: ["Not Started", "On Track", "Behind", "Achieved"] },
    { id: "timeframe", name: "Timeframe", type: "select", options: ["Q1", "Q2", "Q3", "Q4", "H1", "H2", "Yearly"] },
    { id: "target_date", name: "Target Date", type: "date" },
  ],
}, null, 2);

const BRAINSTORM_CONFIG = JSON.stringify({
  type: "database",
  viewType: "board",
  properties: [
    { id: "status", name: "Status", type: "select", options: ["Idea", "Researching", "Approved", "Rejected"] },
    { id: "votes", name: "Votes", type: "number" },
    { id: "category", name: "Category", type: "select", options: ["Product", "Design", "Marketing", "Growth"] },
  ],
}, null, 2);

const GALLERY_CONFIG = JSON.stringify({
  type: "database",
  viewType: "gallery",
  properties: [
    { id: "status", name: "Status", type: "select", options: ["Active", "Draft", "Archived"] },
    { id: "tags", name: "Tags", type: "multiselect", options: ["Design", "Dev", "Marketing"] },
  ],
}, null, 2);

const FORM_CONFIG = JSON.stringify({
  type: "database",
  viewType: "form",
  properties: [
    { id: "name", name: "Name", type: "text" },
    { id: "email", name: "Email", type: "email" },
    { id: "feedback", name: "Feedback", type: "text" },
  ],
}, null, 2);

/* ─────────────────────────── types ─────────────────────────── */

type TemplateId =
  | "tasks"
  | "projects"
  | "document-hub"
  | "brainstorm"
  | "meeting-notes"
  | "goals"
  | "simple-note"
  | "kanban"
  | "action-table"
  | "team-wiki"
  | "roadmap"
  | "general"
  | "gallery"
  | "form";

interface TemplateCard {
  id: TemplateId;
  label: string;
  desc: string;
  emoji: string;
  accentColor: string;         // hex or tailwind value for the preview header
  bgFrom: string;              // tailwind gradient start
  bgTo: string;                // tailwind gradient end
  borderColor: string;
  previewType: "table" | "board" | "document" | "todo" | "gallery" | "form";
  previewCols: string[];
  previewBadges?: { label: string; color: string }[];
  content: string;
  type: "table" | "board" | "todo" | "document" | "form";
  icon?: string;
}

/* ─────────────────────────── preview components ─────────────────────────── */

const Bar = ({ w, opacity = "opacity-40" }: { w: string; opacity?: string; dark?: boolean }) => (
  <div className={`h-1.5 rounded-full bg-white ${opacity}`} style={{ width: w }} />
);

const LightBar = ({ w }: { w: string }) => (
  <div className="h-1.5 rounded-full bg-black/20" style={{ width: w }} />
);

const Avatar = ({ seed }: { seed: number }) => {
  const colors = ["bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500"];
  return (
    <div className={`w-4 h-4 rounded-full ${colors[seed % colors.length]} flex items-center justify-center text-[7px] text-white font-bold shrink-0`}>
      {["A", "B", "C", "D"][seed % 4]}
    </div>
  );
};

const StatusBadge = ({ label, color }: { label: string; color: string }) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-500/20 text-green-400 border border-green-500/30",
    blue: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    gray: "bg-white/10 text-white/50 border border-white/10",
    red: "bg-red-500/20 text-red-400 border border-red-500/30",
    amber: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    purple: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  };
  return (
    <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${colorMap[color] ?? colorMap.gray}`}>
      {label}
    </span>
  );
};

const LightStatusBadge = ({ label, color }: { label: string; color: string }) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-700 border border-green-200",
    blue: "bg-blue-100 text-blue-700 border border-blue-200",
    gray: "bg-gray-100 text-gray-500 border border-gray-200",
    red: "bg-red-100 text-red-600 border border-red-200",
    amber: "bg-amber-100 text-amber-700 border border-amber-200",
    purple: "bg-purple-100 text-purple-700 border border-purple-200",
  };
  return (
    <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${colorMap[color] ?? colorMap.gray}`}>
      {label}
    </span>
  );
};

/* Dark previews */
const TablePreview = ({
  emoji, label, accentColor, cols, badges, isDark,
}: {
  emoji: string; label: string; accentColor: string;
  cols: string[]; badges?: { label: string; color: string }[]; isDark: boolean;
}) => (
  <div
    className={isDark ? "rounded-md overflow-hidden border" : "rounded-md overflow-hidden border border-black/8 bg-white"}
    style={{ background: isDark ? accentColor : undefined }}
  >
    <div className={`flex items-center gap-1 px-2 py-1.5 border-b ${isDark ? "border-white/10" : "border-black/8"}`}>
      <span className="text-xs">{emoji}</span>
      <span className={`text-[10px] font-semibold truncate ${isDark ? "text-white" : "text-gray-800"}`}>{label}</span>
    </div>
    <div className={`grid px-2 py-1 border-b ${isDark ? "border-white/5" : "border-black/5"}`} style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
      {cols.map((c) => <span key={c} className={`text-[7px] font-medium truncate ${isDark ? "text-white/40" : "text-black/40"}`}>{c}</span>)}
    </div>
    {[0, 1, 2].map((row) => (
      <div key={row} className={`grid px-2 py-1 items-center border-b last:border-0 ${isDark ? "border-white/5" : "border-black/5"}`} style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
        {cols.map((c, ci) => {
          if (ci === 0) return isDark ? <Bar key={c} w={`${55 + row * 12}%`} /> : <LightBar key={c} w={`${55 + row * 12}%`} />;
          if (badges && ci === 1) {
            const b = badges[row % badges.length];
            return isDark ? <StatusBadge key={c} label={b.label} color={b.color} /> : <LightStatusBadge key={c} label={b.label} color={b.color} />;
          }
          if (ci === cols.length - 1 && cols.length > 2) return <Avatar key={c} seed={row + ci} />;
          return isDark ? <Bar key={c} w="65%" /> : <LightBar key={c} w="65%" />;
        })}
      </div>
    ))}
  </div>
);

const BoardPreview = ({
  emoji, label, accentColor, badges, isDark,
}: {
  emoji: string; label: string; accentColor: string;
  badges: { label: string; color: string }[]; isDark: boolean;
}) => (
  <div
    className={`rounded-md overflow-hidden border ${isDark ? "border-white/10" : "border-black/8 bg-white"}`}
    style={isDark ? { background: accentColor } : undefined}
  >
    <div className={`flex items-center gap-1 px-2 py-1.5 border-b ${isDark ? "border-white/10" : "border-black/8"}`}>
      <span className="text-xs">{emoji}</span>
      <span className={`text-[10px] font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{label}</span>
    </div>
    <div className="flex flex-wrap gap-1 px-2 py-1.5">
      {badges.map((b) => isDark
        ? <StatusBadge key={b.label} label={b.label} color={b.color} />
        : <LightStatusBadge key={b.label} label={b.label} color={b.color} />)}
    </div>
    <div className="px-2 pb-2 space-y-1">
      {[0, 1].map((i) => isDark
        ? <Bar key={i} w={`${60 + i * 10}%`} opacity="opacity-30" />
        : <LightBar key={i} w={`${60 + i * 10}%`} />)}
    </div>
  </div>
);

const DocumentPreview = ({
  emoji, label, accentColor, cols, isDark,
}: {
  emoji: string; label: string; accentColor: string; cols: string[]; isDark: boolean;
}) => (
  <div
    className={`rounded-md overflow-hidden border ${isDark ? "border-white/10" : "border-black/8 bg-white"}`}
    style={isDark ? { background: accentColor } : undefined}
  >
    <div className={`flex items-center gap-1 px-2 py-1.5 border-b ${isDark ? "border-white/10" : "border-black/8"}`}>
      <span className="text-xs">{emoji}</span>
      <span className={`text-[10px] font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{label}</span>
    </div>
    <div className={`grid px-2 py-1 border-b ${isDark ? "border-white/5" : "border-black/5"}`} style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
      {cols.map((c) => <span key={c} className={`text-[7px] font-medium truncate ${isDark ? "text-white/40" : "text-black/40"}`}>{c}</span>)}
    </div>
    {[0, 1, 2].map((row) => (
      <div key={row} className={`grid px-2 py-1 items-center border-b last:border-0 ${isDark ? "border-white/5" : "border-black/5"}`} style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
        {cols.map((c, ci) => {
          if (ci === 0) return isDark ? <Bar key={c} w={`${55 + row * 12}%`} /> : <LightBar key={c} w={`${55 + row * 12}%`} />;
          if (ci === 1) return <Avatar key={c} seed={row} />;
          return isDark ? <Bar key={c} w="65%" /> : <LightBar key={c} w="65%" />;
        })}
      </div>
    ))}
  </div>
);

const GalleryPreview = ({
  emoji, label, accentColor, isDark,
}: {
  emoji: string; label: string; accentColor: string; isDark: boolean;
}) => (
  <div
    className={`rounded-md overflow-hidden border ${isDark ? "border-white/10" : "border-black/8 bg-white"}`}
    style={isDark ? { background: accentColor } : undefined}
  >
    <div className={`flex items-center gap-1 px-2 py-1.5 border-b ${isDark ? "border-white/10" : "border-black/8"}`}>
      <span className="text-xs">{emoji}</span>
      <span className={`text-[10px] font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{label}</span>
    </div>
    <div className="grid grid-cols-2 gap-1.5 p-2">
      {[0, 1].map((i) => (
        <div key={i} className={`border rounded-md p-1 flex flex-col gap-1 ${isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-gray-50"}`}>
          <div className="h-6 w-full rounded bg-gradient-to-r from-blue-400/20 to-violet-400/20" />
          {isDark ? <Bar w="70%" /> : <LightBar w="70%" />}
        </div>
      ))}
    </div>
  </div>
);

const FormPreview = ({
  emoji, label, accentColor, isDark,
}: {
  emoji: string; label: string; accentColor: string; isDark: boolean;
}) => (
  <div
    className={`rounded-md overflow-hidden border ${isDark ? "border-white/10" : "border-black/8 bg-white"}`}
    style={isDark ? { background: accentColor } : undefined}
  >
    <div className={`flex items-center gap-1 px-2 py-1.5 border-b ${isDark ? "border-white/10" : "border-black/8"}`}>
      <span className="text-xs">{emoji}</span>
      <span className={`text-[10px] font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{label}</span>
    </div>
    <div className="p-2 space-y-1.5">
      <div className="space-y-0.5">
        <div className="h-1 w-6 rounded bg-white/40" />
        <div className={`h-3 w-full rounded border ${isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-gray-50"}`} />
      </div>
      <div className="space-y-0.5">
        <div className="h-1 w-8 rounded bg-white/40" />
        <div className={`h-3 w-full rounded border ${isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-gray-50"}`} />
      </div>
      <div className={`h-4 w-12 rounded bg-blue-500 mx-auto`} />
    </div>
  </div>
);

/* ─────────────────────────── template data ─────────────────────────── */

const TEMPLATES: TemplateCard[] = [
  {
    id: "general",
    label: "General Page",
    desc: "A blank page, start from scratch.",
    emoji: "📝",
    accentColor: "#252525",
    bgFrom: "from-[#1a1a1a]",
    bgTo: "to-[#222222]",
    borderColor: "border-neutral-700/60",
    previewType: "document",
    previewCols: ["Title", "Author", "Updated"],
    content: "",
    type: "document",
    icon: "📝",
  },
  {
    id: "tasks",
    label: "Tasks Tracker",
    desc: "Stay organized with tasks, your way.",
    emoji: "✅",
    accentColor: "#1a3a2a",
    bgFrom: "from-[#0f2419]",
    bgTo: "to-[#162e20]",
    borderColor: "border-green-900/60",
    previewType: "table",
    previewCols: ["Task name", "Status", "Assignee"],
    previewBadges: [
      { label: "started", color: "gray" },
      { label: "progress", color: "blue" },
      { label: "Done", color: "green" },
    ],
    content: MEETING_TABLE_CONFIG,
    type: "table",
    icon: "✅",
  },
  {
    id: "projects",
    label: "Projects",
    desc: "Manage projects start to finish.",
    emoji: "🎯",
    accentColor: "#162235",
    bgFrom: "from-[#0e1d2e]",
    bgTo: "to-[#142030]",
    borderColor: "border-blue-900/60",
    previewType: "board",
    previewCols: ["Name", "Stage", "Lead"],
    previewBadges: [
      { label: "Not started", color: "gray" },
      { label: "In progress", color: "blue" },
      { label: "Done", color: "green" },
    ],
    content: PROJECT_TABLE_CONFIG,
    type: "table",
    icon: "🎯",
  },
  {
    id: "document-hub",
    label: "Document Hub",
    desc: "Collaborate on docs in one hub.",
    emoji: "📄",
    accentColor: "#2a1a1a",
    bgFrom: "from-[#1e1010]",
    bgTo: "to-[#271616]",
    borderColor: "border-red-900/60",
    previewType: "document",
    previewCols: ["Doc name", "Created by", "Created time"],
    content: DOCUMENT_HUB_CONFIG,
    type: "document",
    icon: "📄",
  },
  {
    id: "brainstorm",
    label: "Brainstorm Session",
    desc: "Spark new ideas together.",
    emoji: "💡",
    accentColor: "#2a2010",
    bgFrom: "from-[#1e1800]",
    bgTo: "to-[#271e00]",
    borderColor: "border-yellow-900/60",
    previewType: "table",
    previewCols: ["Idea", "Created by", "Priority"],
    previewBadges: [
      { label: "High", color: "red" },
      { label: "Medium", color: "amber" },
      { label: "Low", color: "green" },
    ],
    content: BRAINSTORM_CONFIG,
    type: "board",
    icon: "💡",
  },
  {
    id: "meeting-notes",
    label: "Meeting Notes",
    desc: "Turn meetings into action.",
    emoji: "\uD83D\uDCC5",
    accentColor: "#1a2a20",
    bgFrom: "from-[#101e16]",
    bgTo: "to-[#16271c]",
    borderColor: "border-emerald-900/60",
    previewType: "document",
    previewCols: ["Topic", "Owner", "Date"],
    content: "",
    type: "document",
    icon: "\uD83D\uDCC5",
  },
  {
    id: "goals",
    label: "Goals Tracker",
    desc: "Set team goals, achieve together.",
    emoji: "🏁",
    accentColor: "#1a1a2a",
    bgFrom: "from-[#10101e]",
    bgTo: "to-[#161627]",
    borderColor: "border-indigo-900/60",
    previewType: "table",
    previewCols: ["Goal", "Status", "Timeframe"],
    previewBadges: [
      { label: "Track", color: "green" },
      { label: "Behind", color: "red" },
      { label: "Achieved", color: "blue" },
    ],
    content: GOALS_CONFIG,
    type: "table",
    icon: "🏁",
  },
  {
    id: "gallery",
    label: "Gallery Board",
    desc: "Display visual cards with image previews.",
    emoji: "🖼️",
    accentColor: "#2c1a35",
    bgFrom: "from-[#1d0e25]",
    bgTo: "to-[#271432]",
    borderColor: "border-purple-900/60",
    previewType: "gallery",
    previewCols: ["Name", "Status", "Tags"],
    content: GALLERY_CONFIG,
    type: "table",
    icon: "🖼️",
  },
  {
    id: "form",
    label: "Form",
    desc: "Collect responses with a clean public form.",
    emoji: "📋",
    accentColor: "#2a1f3d",
    bgFrom: "from-[#1a102e]",
    bgTo: "to-[#251b3a]",
    borderColor: "border-violet-900/60",
    previewType: "form",
    previewCols: ["Name", "Email", "Feedback"],
    content: FORM_CONFIG,
    type: "form",
    icon: "📋",
  },
];

/* ─────────────────────────── card component ─────────────────────────── */

const TemplateCardUI = ({
  tmpl,
  onClick,
  isDark,
}: {
  tmpl: TemplateCard;
  onClick: () => void;
  isDark: boolean;
}) => {
  const [hovered, setHovered] = useState(false);

  const preview = () => {
    if (tmpl.previewType === "board") {
      return (
        <BoardPreview
          emoji={tmpl.emoji}
          label={tmpl.label}
          accentColor={tmpl.accentColor}
          badges={tmpl.previewBadges ?? []}
          isDark={isDark}
        />
      );
    }
    if (tmpl.previewType === "document") {
      return (
        <DocumentPreview
          emoji={tmpl.emoji}
          label={tmpl.label}
          accentColor={tmpl.accentColor}
          cols={tmpl.previewCols}
          isDark={isDark}
        />
      );
    }
    if (tmpl.previewType === "gallery") {
      return (
        <GalleryPreview
          emoji={tmpl.emoji}
          label={tmpl.label}
          accentColor={tmpl.accentColor}
          isDark={isDark}
        />
      );
    }
    if (tmpl.previewType === "form") {
      return (
        <FormPreview
          emoji={tmpl.emoji}
          label={tmpl.label}
          accentColor={tmpl.accentColor}
          isDark={isDark}
        />
      );
    }
    return (
      <TablePreview
        emoji={tmpl.emoji}
        label={tmpl.label}
        accentColor={tmpl.accentColor}
        cols={tmpl.previewCols}
        badges={tmpl.previewBadges}
        isDark={isDark}
      />
    );
  };

  const LIGHT_GRADIENTS: Record<string, { from: string; to: string; border: string }> = {
    general: { from: "from-neutral-50", to: "to-neutral-100/70", border: "border-neutral-200" },
    tasks: { from: "from-emerald-50/50", to: "to-emerald-100/40", border: "border-emerald-200" },
    projects: { from: "from-blue-50/50", to: "to-blue-100/40", border: "border-blue-200" },
    "document-hub": { from: "from-rose-50/50", to: "to-rose-100/40", border: "border-rose-200" },
    brainstorm: { from: "from-amber-50/50", to: "to-amber-100/40", border: "border-amber-200" },
    "meeting-notes": { from: "from-teal-50/50", to: "to-teal-100/40", border: "border-teal-200" },
    goals: { from: "from-indigo-50/50", to: "to-indigo-100/40", border: "border-indigo-200" },
    gallery: { from: "from-purple-50/50", to: "to-purple-100/40", border: "border-purple-200" },
    form: { from: "from-violet-50/50", to: "to-violet-100/40", border: "border-violet-200" },
  };

  // Clean gray styling for all template cards
  const darkCard = `bg-neutral-900 border-neutral-800 hover:bg-neutral-850 hover:border-neutral-700 text-white`;
  const lightCard = `bg-neutral-100/90 border-neutral-200/90 hover:bg-neutral-200/70 text-gray-900`;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative group text-left rounded-xl border p-4 transition-all duration-200 flex gap-3 items-start h-[160px] w-full overflow-hidden
        ${isDark ? darkCard : lightCard}
        ${hovered ? "scale-[1.015] shadow-xl" : "scale-100"}
      `}
    >
      {/* Left: title + desc */}
      <div className="flex flex-col justify-start min-w-0 flex-shrink-0 w-[180px] sm:w-[220px] h-full overflow-y-auto scrollbar-none">
        <span className="text-lg mb-1 shrink-0 filter grayscale opacity-80">{tmpl.emoji}</span>
        <h3 className={`text-[12px] font-bold leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>{tmpl.label}</h3>
        <p className={`text-[10px] mt-1 leading-normal line-clamp-2 ${isDark ? "text-white/50" : "text-gray-400"}`}>{tmpl.desc}</p>
      </div>

      {/* Right: mini preview — fills remaining space */}
      <div className="pointer-events-none select-none flex-1 min-w-0 h-full overflow-hidden">
        {preview()}
      </div>
    </button>
  );
};

/* ─────────────────────────── modal ─────────────────────────── */

export const TemplatesModal = () => {
  const router = useRouter();
  const templatesModal = useTemplates();
  const create = useMutation(api.documents.create);
  const updateDocument = useMutation(api.documents.update);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const handleSelect = async (tmpl: TemplateCard) => {
    const parentId = templatesModal.parentId;

    // Avoid using exact default teamspace titles ("Projects", "Meetings", "Docs", "Tasks", "Brainstorming Session", "Goals")
    // so they are created under Notes rather than Teamspaces.
    let title = tmpl.id === "general" ? "Untitled" : tmpl.label;
    if (["Projects", "Meetings", "Docs", "Tasks", "Goals"].includes(title)) {
      title = `My ${title}`;
    } else if (title === "Brainstorming Session") {
      title = "My Brainstorm";
    }

    // For meeting notes, generate fresh content with current date/time.
    const content = tmpl.id === "meeting-notes" ? getMeetingNotesContent() : tmpl.content;

    const promise = create({
      title,
      parentDocument: parentId,
    }).then(async (newId) => {
      await updateDocument({
        id: newId,
        icon: tmpl.icon,
        ...(content ? { content } : {}),
      });
      templatesModal.onClose();
      router.push(`/documents/${newId}`);
    });

    toast.promise(promise, {
      loading: "Creating page from template...",
      success: "Page created!",
      error: "Failed to create page.",
    });
  };

  const modalBg = isDark ? "bg-[#1a1a1a]" : "bg-gray-50";
  const headerBorder = isDark ? "border-white/8" : "border-gray-200";
  const titleColor = isDark ? "text-white" : "text-gray-900";
  const subtitleColor = isDark ? "text-white/40" : "text-gray-500";
  const iconBg = isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200";
  const iconColor = isDark ? "text-white/60" : "text-gray-500";
  const toggleBg = isDark ? "bg-white/10 hover:bg-white/15" : "bg-gray-200 hover:bg-gray-300";
  const toggleColor = isDark ? "text-white/70" : "text-gray-600";

  return (
    <Dialog open={templatesModal.isOpen} onOpenChange={templatesModal.onClose}>
      <DialogTitle className="sr-only">Templates Picker</DialogTitle>
      <DialogDescription className="sr-only">
        Choose a template type to create your new page.
      </DialogDescription>
      <DialogContent className={`max-w-7xl w-[95vw] sm:max-w-[1200px] md:w-[1200px] h-[85vh] md:h-[700px] p-0 overflow-hidden border-0 shadow-2xl transition-colors duration-300 ${modalBg}`}>
        <div className={`flex flex-col h-full overflow-y-auto md:overflow-hidden ${modalBg} transition-colors duration-300`}>

          {/* Header */}
          <div className={`flex items-center justify-between px-4 md:px-6 pt-5 pb-4 border-b shrink-0 ${headerBorder}`}>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg border ${iconBg}`}>
                <Sparkles className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div>
                <h2 className={`text-sm font-semibold ${titleColor}`}>Templates</h2>
                <p className={`text-xs ${subtitleColor}`}>Pick a template to start your page</p>
              </div>
            </div>
          </div>

          {/* Grid — responsive columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar">
            {TEMPLATES.map((tmpl) => (
              <TemplateCardUI
                key={tmpl.id}
                tmpl={tmpl}
                onClick={() => handleSelect(tmpl)}
                isDark={isDark}
              />
            ))}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
