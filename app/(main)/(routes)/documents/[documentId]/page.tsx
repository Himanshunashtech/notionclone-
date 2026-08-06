"use client";

import dynamic from "next/dynamic";
import React, { useMemo, use, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { Cover } from "@/components/cover";
import { Toolbar } from "@/components/toolbar";
import { Skeleton } from "@/components/ui/skeleton";

import { api } from "@/lib/supabase-db";
import { Id } from "@/lib/supabase-db";
import { useQuery, useMutation } from "@/hooks/use-supabase-db";
import { BlockNoteEditor } from "@blocknote/core";
import { TableOfContents } from "@/components/table-of-contents";
import { useEditorFont } from "@/hooks/useEditorFont";
import { SubpagesList } from "@/components/subpages-list";
import { isDatabase, isDatabaseRow, parseDatabaseConfig, parseDatabaseRow } from "@/components/database/database-utils";
import { DatabaseView } from "@/components/database/DatabaseView";
import { TableView } from "@/components/database/TableView";
import { KanbanBoard } from "@/components/database/KanbanBoard";
import { GalleryView } from "@/components/database/GalleryView";
import { TodoView } from "@/components/database/TodoView";
import { TemplatesMenu } from "@/components/database/TemplatesMenu";
import { HistorySidebar } from "@/components/modals/HistorySidebar";
import { MeetingTranscription } from "@/components/meeting-transcription";
import { useRef } from "react";
import {
  FileText,
  CheckSquare2,
  CalendarDays,
  BookOpen,
  Calendar,
  ArrowUpRight,
  ListFilter,
  User,
  MessageSquare,
  Plus,
  Type,
  Hash,
  CircleDot,
  Tags,
  Paperclip,
  Link as LinkIcon,
  Mail,
  Phone,
  Sigma,
  Search,
  Clock,
  UserCircle,
  Play,
  MapPin,
  HelpCircle,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Edit,
  SlidersHorizontal,
  ChevronDown,
  Table,
  LayoutGrid,
  ListChecks,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/providers/supabase-provider";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

const PROPERTY_TYPES_LIST = [
  { label: "Text", type: "text", icon: Type },
  { label: "Number", type: "number", icon: Hash },
  { label: "Select", type: "select", icon: CircleDot },
  { label: "Multi-select", type: "multiselect", icon: Tags },
  { label: "Status", type: "select", icon: ListFilter, options: ["To Do", "In Progress", "Done"] },
  { label: "Date", type: "date", icon: CalendarDays },
  { label: "Person", type: "text", icon: User },
  { label: "Files & media", type: "text", icon: Paperclip },
  { label: "Checkbox", type: "checkbox", icon: CheckSquare2 },
  { label: "URL", type: "url", icon: LinkIcon },
  { label: "Email", type: "email", icon: Mail },
  { label: "Phone", type: "phone", icon: Phone },
  { label: "Formula", type: "text", icon: Sigma },
  { label: "Relation", type: "relation", icon: ArrowUpRight },
  { label: "Rollup", type: "text", icon: Search },
  { label: "Created time", type: "text", icon: Clock },
  { label: "Created by", type: "text", icon: UserCircle },
  { label: "Last edited time", type: "text", icon: Clock },
  { label: "Last edited by", type: "text", icon: UserCircle },
  { label: "Button", type: "text", icon: Play },
  { label: "Place", type: "text", icon: MapPin },
  { label: "ID", type: "text", icon: Hash }
];

const PROPERTY_ICONS: Record<string, any> = {
  text: Type,
  number: Hash,
  select: CircleDot,
  multiselect: Tags,
  status: ListFilter,
  date: CalendarDays,
  person: User,
  "files & media": Paperclip,
  checkbox: CheckSquare2,
  url: LinkIcon,
  email: Mail,
  phone: Phone,
  formula: Sigma,
  relation: ArrowUpRight,
  rollup: Search,
  "created time": Clock,
  "created by": UserCircle,
  "last edited time": Clock,
  "last edited by": UserCircle,
  button: Play,
  place: MapPin,
  id: Hash,
};

import { MetaHead } from "@/components/seo/meta-head";

interface DocumentIdPageProps {
  params:
    | Promise<{
        documentId: Id<"documents">;
      }>
    | {
        documentId: Id<"documents">;
      };
}

const DocumentIdPage = ({ params }: DocumentIdPageProps) => {
  const resolvedParams =
    params && typeof (params as any).then === "function"
      ? use(params as Promise<any>)
      : (params as any);
  const { documentId } = resolvedParams;
  const router = useRouter();
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  const [projectTab, setProjectTab] = useState<"content" | "tasks" | "meetings" | "docs" | any>("content");
  const [showHiddenProperties, setShowHiddenProperties] = useState(false);
  const { resolvedTheme } = useTheme();
  const { user } = useUser();
  
  const lastSavedRef = useRef<number>(Date.now());

  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    [],
  );

  const doc = useQuery(api.documents.getById, {
    documentId: documentId,
  });

  const parentDoc = useQuery(
    api.documents.getById,
    doc?.parentDocument ? { documentId: doc.parentDocument } : "skip"
  );
  const grandparentDoc = useQuery(
    api.documents.getById,
    parentDoc?.parentDocument ? { documentId: parentDoc.parentDocument } : "skip"
  );
  const isProjectPage = parentDoc?.title === "Projects";
  const isTaskPage = parentDoc?.title === "Tasks";
  const isMeetingPage = parentDoc?.title === "Meetings";
  const isDocPage = parentDoc?.title === "Docs";
  const isGoalPage = parentDoc?.title === "Goals";

  const rootDocs = useQuery(api.documents.getSidebar, {});
  const teamspaceId = parentDoc?.parentDocument;
  const teamspaceDocs = useQuery(
    api.documents.getSidebar,
    teamspaceId ? { parentDocument: teamspaceId } : "skip"
  );

  const tasksDb = teamspaceId
    ? teamspaceDocs?.find((d) => d.title === "Tasks")
    : rootDocs?.find((d) => d.title === "Tasks");
  const meetingsDb = teamspaceId
    ? teamspaceDocs?.find((d) => d.title === "Meetings")
    : rootDocs?.find((d) => d.title === "Meetings");
  const docsDb = teamspaceId
    ? teamspaceDocs?.find((d) => d.title === "Docs")
    : rootDocs?.find((d) => d.title === "Docs");

  const allTasks = useQuery(
    api.documents.getSidebar,
    tasksDb?._id ? { parentDocument: tasksDb._id } : "skip"
  );
  const allMeetings = useQuery(
    api.documents.getSidebar,
    meetingsDb?._id ? { parentDocument: meetingsDb._id } : "skip"
  );
  const allDocs = useQuery(
    api.documents.getSidebar,
    docsDb?._id ? { parentDocument: docsDb._id } : "skip"
  );

  const projectsDb = teamspaceId
    ? teamspaceDocs?.find((d) => d.title === "Projects")
    : rootDocs?.find((d) => d.title === "Projects");
  
  const allProjects = useQuery(
    api.documents.getSidebar,
    projectsDb?._id ? { parentDocument: projectsDb._id } : "skip"
  );

  const { editorFont, isFontLoading } = useEditorFont({ enabled: true });

  const [teamspaceIds, setTeamspaceIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("teamspaceIds");
      if (stored) {
        setTeamspaceIds(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const TEAMSPACE_TITLES = ["Projects", "Meetings", "Docs", "Tasks", "Brainstorming Session", "Goals"];

  const isTeamspacePage = 
    teamspaceIds.includes(documentId) || 
    TEAMSPACE_TITLES.includes(doc?.title || "") ||
    !!(parentDoc && (teamspaceIds.includes(parentDoc._id) || TEAMSPACE_TITLES.includes(parentDoc.title || ""))) ||
    !!(grandparentDoc && (teamspaceIds.includes(grandparentDoc._id) || TEAMSPACE_TITLES.includes(grandparentDoc.title || "")));

  const update = useMutation(api.documents.update);

  useEffect(() => {
    if (!doc) return;

    const defaultFavicon =
      resolvedTheme === "dark" ? "/logo-dark.svg" : "/logo.svg";

    window.document.title = `${doc.title || "Untitled"} | Zotion`;

    const link = window.document.querySelector(
      "link[rel~='icon']",
    ) as HTMLLinkElement;
    if (link) {
      if (doc.icon) {
        if (doc.icon.startsWith("ri:") || doc.icon.startsWith("lucide:")) {
          const parts = doc.icon.split(":");
          const iconColor = parts[2] || "#3b82f6";
          link.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='${encodeURIComponent(iconColor)}'/></svg>`;
        } else {
          link.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' font-size='100'>${doc.icon}</text></svg>`;
        }
      } else {
        link.href = defaultFavicon;
      }
    }

    return () => {
      window.document.title = "Zotion";
      if (link) link.href = defaultFavicon;
    };
  }, [doc?.title, doc?.icon, resolvedTheme, documentId]);

  useEffect(() => {
    if (!doc) return;
    if (doc.editorFont === editorFont) return;

    update({
      id: documentId,
      editorFont,
    });
  }, [doc, editorFont, documentId, update]);

  const activeFont = doc?.editorFont ?? editorFont;
  const isFullWidth = doc?.fullWidth ?? true;
  const isSmallText = doc?.smallText ?? false;
  const showToc = doc?.showToc ?? true;

  const [isWiki, setIsWiki] = useState(false);

  useEffect(() => {
    const checkWiki = () => {
      try {
        const stored = localStorage.getItem("wikiPageIds");
        if (stored) {
          setIsWiki(JSON.parse(stored).includes(documentId));
        } else {
          setIsWiki(false);
        }
      } catch {
        setIsWiki(false);
      }
    };
    checkWiki();
    window.addEventListener("wiki-status-changed", checkWiki);
    window.addEventListener("storage", checkWiki);
    return () => {
      window.removeEventListener("wiki-status-changed", checkWiki);
      window.removeEventListener("storage", checkWiki);
    };
  }, [documentId]);

  const subpages = useQuery(api.documents.getSidebar, {
    parentDocument: documentId,
  });

  const createSubpage = useMutation(api.documents.create);

  const [wikiConfig, setWikiConfig] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`wiki_config_${documentId}`);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return {
      type: "database",
      viewType: "gallery",
      views: ["gallery"],
      properties: [
        {
          id: "status",
          name: "Status",
          type: "select" as const,
          options: ["To Do", "In Progress", "Done"],
        }
      ]
    };
  });

  const handleUpdateWikiConfig = (newConfig: any) => {
    setWikiConfig(newConfig);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`wiki_config_${documentId}`, JSON.stringify(newConfig));
      } catch {}
    }
  };

  const handleCreateWikiSubpage = async (category: "team" | "policy" | "new") => {
    let title = "New Page";
    if (category === "team") {
      title = "New Team Page";
    } else if (category === "policy") {
      title = "New Policy Page";
    }

    const defaultDbContent = JSON.stringify({
      type: "database",
      viewType: "gallery",
      views: ["gallery"],
      properties: [
        {
          id: "status",
          name: "Status",
          type: "select",
          options: ["To Do", "In Progress", "Done"]
        }
      ]
    }, null, 2);

    const promise = createSubpage({
      title,
      parentDocument: documentId,
      content: "",
    }).then((newDocId) => {
      router.push(`/documents/${newDocId}`);
    });

    toast.promise(promise, {
      loading: `Creating new ${category} page...`,
      success: `New ${category} page created!`,
      error: `Failed to create ${category} page.`,
    });
  };

  const createVersion = useMutation(api.documents.createVersion);

  const [overrideContent, setOverrideContent] = useState<string | null>(null);

  useEffect(() => {
    setOverrideContent(null);
  }, [doc?.content]);

  const onChange = (newEditorContent: string) => {
    let finalContent = newEditorContent;
    if (doc && isDatabaseRow(doc.content)) {
      const rowData = parseDatabaseRow(doc.content);
      finalContent = JSON.stringify({
        ...rowData,
        editorContent: newEditorContent,
      }, null, 2);
    }

    update({
      id: documentId,
      content: finalContent,
    });

    const now = Date.now();
    if (now - lastSavedRef.current > 5 * 60 * 1000 && doc) {
      lastSavedRef.current = now;
      createVersion({
        documentId,
        title: doc.title,
        content: finalContent,
        label: "Auto-save",
      }).catch((err) => console.error("Failed to auto-save page history:", err));
    }
  };

  if (doc === undefined || isFontLoading) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
          <div className="space-y-4 pt-4 pl-8">
            <Skeleton className="h-14 w-1/2" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </div>
    );
  }

  if (doc === null) {
    return <div>Not found</div>;
  }

  const handleSelectTemplate = (type: "table" | "board" | "todo" | "document", content: string) => {
    setOverrideContent(content);
    update({
      id: documentId,
      content,
    });
  };

  const currentContent = overrideContent !== null ? overrideContent : doc.content;
  const isDb = isDatabase(currentContent);
  const isEmpty = !currentContent || currentContent === "";

  const rowData = parseDatabaseRow(currentContent);
  const linkedTaskIds = rowData.values["tasks"] ? rowData.values["tasks"].split(",").filter(Boolean) : [];
  const linkedMeetingIds = rowData.values["meetings"] ? rowData.values["meetings"].split(",").filter(Boolean) : [];
  const linkedDocIds = rowData.values["docs"] ? rowData.values["docs"].split(",").filter(Boolean) : [];

  const projectTasks = (allTasks || []).filter((t) => linkedTaskIds.includes(t._id));
  const projectMeetings = (allMeetings || []).filter((m) => linkedMeetingIds.includes(m._id));
  const projectDocs = (allDocs || []).filter((d) => linkedDocIds.includes(d._id));

  const handleUpdateProperty = async (propId: string, val: string) => {
    const updatedValues = {
      ...rowData.values,
      [propId]: val,
    };
    const newContent = JSON.stringify({
      ...rowData,
      values: updatedValues,
    }, null, 2);

    await update({
      id: documentId,
      content: newContent,
    });
  };

  const handleAddPageProperty = async (propName: string, propType: string, options?: string[]) => {
    if (!parentDoc) return;
    const propId = propName.toLowerCase().replace(/\s+/g, "_").trim();
    if (!propId) return;
    const parentConfig = parseDatabaseConfig(parentDoc.content);

    if (parentConfig.properties.some((p) => p.id === propId)) {
      toast.error("A property with that name already exists");
      return;
    }

    const newProp = {
      id: propId,
      name: propName,
      type: propType as any,
      options: options,
      displayType: propType === "select" && options?.length === 3 && options.includes("To Do") ? "Status" : undefined
    };

    const newConfig = {
      ...parentConfig,
      properties: [...parentConfig.properties, newProp]
    };

    const promise = update({
      id: parentDoc._id,
      content: JSON.stringify(newConfig, null, 2),
    });

    toast.promise(promise, {
      loading: `Adding "${propName}" property...`,
      success: `Property "${propName}" added!`,
      error: "Failed to add property.",
    });
  };

  const handleRenamePageProperty = async (propId: string, newName: string) => {
    if (!parentDoc) return;
    const parentConfig = parseDatabaseConfig(parentDoc.content);
    const updatedProps = parentConfig.properties.map((p) => {
      if (p.id === propId) {
        return { ...p, name: newName };
      }
      return p;
    });

    const promise = update({
      id: parentDoc._id,
      content: JSON.stringify({ ...parentConfig, properties: updatedProps }, null, 2),
    });

    toast.promise(promise, {
      loading: "Renaming property...",
      success: "Property renamed successfully!",
      error: "Failed to rename property."
    });
  };

  const handleEditPageProperty = async (propId: string, newType: string, options?: string[]) => {
    if (!parentDoc) return;
    const parentConfig = parseDatabaseConfig(parentDoc.content);
    const updatedProps = parentConfig.properties.map((p) => {
      if (p.id === propId) {
        return {
          ...p,
          type: newType as any,
          options: options,
          displayType: newType === "select" && options?.length === 3 && options.includes("To Do") ? "Status" : undefined
        };
      }
      return p;
    });

    const promise = update({
      id: parentDoc._id,
      content: JSON.stringify({ ...parentConfig, properties: updatedProps }, null, 2),
    });

    toast.promise(promise, {
      loading: "Updating property type...",
      success: "Property type updated!",
      error: "Failed to update property."
    });
  };

  const handleDuplicatePageProperty = async (propId: string) => {
    if (!parentDoc) return;
    const parentConfig = parseDatabaseConfig(parentDoc.content);
    const original = parentConfig.properties.find((p) => p.id === propId);
    if (!original) return;

    const newId = `${original.id}_copy_${Math.random().toString(36).substring(2, 6)}`;
    const newProp = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`
    };

    const promise = update({
      id: parentDoc._id,
      content: JSON.stringify({
        ...parentConfig,
        properties: [...parentConfig.properties, newProp]
      }, null, 2),
    });

    toast.promise(promise, {
      loading: "Duplicating property...",
      success: "Property duplicated!",
      error: "Failed to duplicate property."
    });
  };

  const handleDeletePageProperty = async (propId: string) => {
    if (!parentDoc) return;
    const ok = window.confirm("Are you sure you want to delete this property from all pages in this database?");
    if (!ok) return;

    const parentConfig = parseDatabaseConfig(parentDoc.content);
    const updatedProps = parentConfig.properties.filter((p) => p.id !== propId);

    const promise = update({
      id: parentDoc._id,
      content: JSON.stringify({ ...parentConfig, properties: updatedProps }, null, 2),
    });

    toast.promise(promise, {
      loading: "Deleting property...",
      success: "Property deleted!",
      error: "Failed to delete property."
    });
  };

  const handleSetPagePropertyVisibility = async (propId: string, visibility: "always-show" | "hide-empty" | "always-hide") => {
    if (!parentDoc) return;
    const parentConfig = parseDatabaseConfig(parentDoc.content);
    const updatedProps = parentConfig.properties.map((p) => {
      if (p.id === propId) {
        return { ...p, visibility } as any;
      }
      return p;
    });

    const promise = update({
      id: parentDoc._id,
      content: JSON.stringify({ ...parentConfig, properties: updatedProps }, null, 2),
    });

    toast.promise(promise, {
      loading: "Updating property visibility...",
      success: "Property visibility updated!",
      error: "Failed to update visibility."
    });
  };

  const comments = rowData.comments || [];

  const handleAddComment = async (text: string) => {
    if (!text.trim()) return;

    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      author: user?.fullName || user?.emailAddresses?.[0]?.emailAddress || "Anonymous",
      avatar: user?.imageUrl || "",
      content: text,
      createdAt: Date.now(),
    };

    const newContent = JSON.stringify({
      ...rowData,
      comments: [...comments, newComment],
    }, null, 2);

    await update({
      id: documentId,
      content: newContent,
    });
  };

  const editorInitialContent = doc && isDatabaseRow(doc.content)
    ? (parseDatabaseRow(doc.content).editorContent || "")
    : (doc?.content || "");

  const isDatabaseRowPage = !!parentDoc && (
    isDatabase(parentDoc.content) ||
    isTaskPage ||
    isMeetingPage ||
    isDocPage ||
    isGoalPage ||
    isProjectPage
  );

  return (
    <div className="pb-35">
      <MetaHead 
        title={`${doc.title || "Untitled"} - Zotion Workspace`}
        description={`View and edit ${doc.title || "document"} in Zotion connected workspace.`}
      />
      <Cover url={doc.coverImage} />
      <div
        className={`relative mx-auto px-4 md:px-8 w-full ${
          !isFullWidth && !isDatabase ? "max-w-4xl" : "w-full"
        }`}
      >
        <Toolbar initialData={doc} editorFont={activeFont} />
        {isDatabaseRowPage && parentDoc && (() => {
          // Find if any project links this document
          let parentProjectName = "";
          let parentProjectId = "";
          if (allProjects) {
            for (const p of allProjects) {
              const pRow = parseDatabaseRow(p.content);
              const tasks = pRow.values["tasks"] ? pRow.values["tasks"].split(",").filter(Boolean) : [];
              const meetings = pRow.values["meetings"] ? pRow.values["meetings"].split(",").filter(Boolean) : [];
              const docs = pRow.values["docs"] ? pRow.values["docs"].split(",").filter(Boolean) : [];
              
              if (tasks.includes(documentId) || meetings.includes(documentId) || docs.includes(documentId)) {
                parentProjectName = p.title;
                parentProjectId = p._id;
                break;
              }
            }
          }

          return (
            <div className="space-y-8 max-w-2xl mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-8">
              {parentProjectName && (
                <div className="flex items-center gap-x-2 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-850 px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-750">
                  <span className="font-semibold select-none">Project:</span>
                  <a href={`/documents/${parentProjectId}`} className="text-blue-500 hover:underline font-medium flex items-center gap-x-1">
                    <span>🎯</span>
                    <span>{parentProjectName}</span>
                  </a>
                </div>
              )}
              {/* Properties list */}
              <div className="space-y-5">
                {(() => {
                  const allProps = parseDatabaseConfig(parentDoc.content).properties;
                  const visibleProps = allProps.filter((p) => {
                    const val = rowData.values[p.id] || "";
                    const visibility = (p as any).visibility;
                    if (showHiddenProperties) return true;
                    if (visibility === "always-hide") return false;
                    if (visibility === "hide-empty" && !val) return false;
                    return true;
                  });
                  const hiddenCount = allProps.length - visibleProps.length;

                  return (
                    <>
                      {visibleProps.map((p) => {
                        const val = rowData.values[p.id] || "";
                        let PropIcon = Calendar;
                        const displayType = (p as any).displayType || p.type || "";
                        if (PROPERTY_ICONS[displayType.toLowerCase()]) {
                           PropIcon = PROPERTY_ICONS[displayType.toLowerCase()];
                        } else if (p.id === "status" || p.name.toLowerCase() === "status") {
                          PropIcon = ListFilter;
                        } else if (p.type === "relation") {
                          PropIcon = ArrowUpRight;
                        } else if (p.id === "assignee" || p.name.toLowerCase() === "assignee" || p.id === "attendees" || p.name.toLowerCase() === "attendees") {
                          PropIcon = User;
                        }

                        return (
                          <div key={p.id} className="grid grid-cols-3 gap-x-6 items-center text-sm md:text-base py-1.5">
                            <div className="flex items-center gap-x-2 text-muted-foreground select-none">
                              <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-x-2 text-muted-foreground select-none hover:bg-neutral-100 dark:hover:bg-neutral-800/60 px-2 py-1 rounded-md transition cursor-pointer text-left w-full outline-hidden font-semibold">
                                  <PropIcon className="h-4.5 w-4.5 shrink-0 text-neutral-500" />
                                  <span className="truncate">{p.name}</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const newName = window.prompt("Rename property:", p.name);
                                      if (newName && newName.trim()) {
                                        handleRenamePageProperty(p.id, newName);
                                      }
                                    }}
                                    className="flex items-center gap-x-2 text-xs cursor-pointer"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                    <span>Rename</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="flex items-center gap-x-2 text-xs cursor-pointer">
                                      <SlidersHorizontal className="h-3.5 w-3.5" />
                                      <span>Edit property</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuSubContent className="w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 max-h-56 overflow-y-auto custom-scrollbar">
                                        {PROPERTY_TYPES_LIST.map((item) => (
                                          <DropdownMenuItem
                                            key={item.label}
                                            onClick={() => handleEditPageProperty(p.id, item.type, item.options)}
                                            className="flex items-center gap-x-2 text-xs cursor-pointer"
                                          >
                                            {React.createElement(item.icon, { className: "h-3.5 w-3.5 text-neutral-400 shrink-0" })}
                                            <span>{item.label}</span>
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenuSub>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="flex items-center gap-x-2 text-xs cursor-pointer">
                                      <Eye className="h-3.5 w-3.5" />
                                      <span>Property visibility</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuSubContent className="w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">
                                        <DropdownMenuItem
                                          onClick={() => handleSetPagePropertyVisibility(p.id, "always-show")}
                                          className="flex items-center justify-between text-xs cursor-pointer"
                                        >
                                          <span>Always show</span>
                                          {(p as any).visibility === "always-show" || !(p as any).visibility ? <span className="text-xs text-blue-500">✓</span> : null}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleSetPagePropertyVisibility(p.id, "hide-empty")}
                                          className="flex items-center justify-between text-xs cursor-pointer"
                                        >
                                          <span>Hide when empty</span>
                                          {(p as any).visibility === "hide-empty" ? <span className="text-xs text-blue-500">✓</span> : null}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleSetPagePropertyVisibility(p.id, "always-hide")}
                                          className="flex items-center justify-between text-xs cursor-pointer"
                                        >
                                          <span>Always hide</span>
                                          {(p as any).visibility === "always-hide" ? <span className="text-xs text-blue-500">✓</span> : null}
                                        </DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenuSub>

                                  <DropdownMenuItem
                                    onClick={() => handleDuplicatePageProperty(p.id)}
                                    className="flex items-center gap-x-2 text-xs cursor-pointer"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Duplicate property</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => handleDeletePageProperty(p.id)}
                                    className="flex items-center gap-x-2 text-xs cursor-pointer text-rose-500 hover:text-rose-500 dark:hover:text-rose-400! focus:bg-rose-500/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                    <span>Delete property</span>
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => toast.info(`Layout configuration for "${p.name}"`)}
                                    className="flex items-center gap-x-2 text-xs cursor-pointer"
                                  >
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    <span>Customize layout</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="col-span-2">
                              {p.type === "select" ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger className="px-3 py-1.5 rounded-md text-sm font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:opacity-85 transition">
                                    {val || "Empty"}
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="start" className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">
                                    {(p.options || []).map((opt) => (
                                      <DropdownMenuItem
                                        key={opt}
                                        onClick={() => handleUpdateProperty(p.id, opt)}
                                        className="text-xs cursor-pointer"
                                      >
                                        {opt}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : p.type === "date" ? (
                                <input
                                  type="date"
                                  value={val}
                                  onChange={(e) => handleUpdateProperty(p.id, e.target.value)}
                                  className="px-3 py-1.5 text-sm rounded-md bg-transparent border border-neutral-205 dark:border-neutral-750 focus:ring-1 focus:ring-blue-500 outline-hidden dark:text-neutral-200"
                                />
                              ) : p.type === "relation" ? (
                                <div className="text-sm text-neutral-700 dark:text-neutral-300">
                                  {val ? (
                                    <span className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-850 font-medium">
                                      {rootDocs?.find((d) => d._id === val)?.title || val}
                                    </span>
                                  ) : (
                                    <span className="text-neutral-400">Empty</span>
                                  )}
                                </div>
                              ) : p.type === "checkbox" ? (
                                <input
                                  type="checkbox"
                                  checked={val === "true"}
                                  onChange={(e) => handleUpdateProperty(p.id, e.target.checked ? "true" : "false")}
                                  className="h-5 w-5 rounded-sm border border-neutral-205 dark:border-neutral-750 text-blue-600 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                />
                              ) : (
                                <input
                                  key={p.id + "-" + val}
                                  type="text"
                                  defaultValue={val}
                                  onBlur={(e) => {
                                    if (e.target.value !== val) {
                                      handleUpdateProperty(p.id, e.target.value);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  placeholder="Empty"
                                  className="w-full px-3 py-1.5 text-sm rounded-md bg-transparent border border-transparent hover:border-neutral-200 dark:hover:border-neutral-750 focus:border-neutral-200 dark:focus:border-neutral-750 focus:ring-1 focus:ring-blue-500 outline-hidden dark:text-neutral-200"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {hiddenCount > 0 && (
                        <div className="pt-1">
                          <button
                            onClick={() => setShowHiddenProperties(!showHiddenProperties)}
                            className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition py-1 font-medium flex items-center gap-x-1 cursor-pointer"
                          >
                            {showHiddenProperties ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            <span>{showHiddenProperties ? "Hide extra properties" : `Show ${hiddenCount} more properties`}</span>
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* Add Property Button & Dropdown */}
                <div className="pt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-x-2 px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-md transition font-medium w-fit cursor-pointer">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add property</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 max-h-60 overflow-y-auto custom-scrollbar">
                      {PROPERTY_TYPES_LIST.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <DropdownMenuItem
                            key={item.label}
                            onClick={() => {
                              const name = window.prompt(`Enter name for the new ${item.label} property:`);
                              if (name && name.trim()) {
                                handleAddPageProperty(name, item.type, item.options);
                              }
                            }}
                            className="flex items-center gap-x-2 text-xs py-1.5 cursor-pointer"
                          >
                            <ItemIcon className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <span>{item.label}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

            {/* Comments List */}
            <div className="pt-8 mt-8 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
              <div className="text-base md:text-lg font-bold text-neutral-800 dark:text-neutral-200">
                Comments
              </div>
              <div className="space-y-3">
                {comments.map((c: any) => (
                  <div key={c.id} className="flex items-start gap-x-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center select-none text-xs shrink-0">
                      {c.author.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-x-2">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-250">{c.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-x-3 pt-4">
                <div className="h-8 w-8 rounded-full bg-neutral-300 dark:bg-neutral-700 font-bold flex items-center justify-center select-none text-xs text-neutral-600 dark:text-neutral-400 shrink-0">
                  {user?.fullName?.substring(0, 1).toUpperCase() || "M"}
                </div>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddComment((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-neutral-50 dark:bg-neutral-850 border border-neutral-205 dark:border-neutral-750 rounded-md outline-hidden focus:ring-1 focus:ring-blue-500 text-neutral-700 dark:text-neutral-300"
                />
              </div>
            </div>
            {isMeetingPage && (
              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <MeetingTranscription meetingTitle={doc.title || "Untitled"} documentId={documentId} />
              </div>
            )}
          </div>
        );
      })()}
        {isProjectPage ? (
          <div className="space-y-6 w-full overflow-hidden">
            {/* Project Tabs Bar */}
            <div className="flex items-center gap-x-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-6 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setProjectTab("content")}
                className={cn(
                  "flex items-center gap-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition shrink-0",
                  projectTab === "content"
                    ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
                )}
              >
                <FileText className="h-4 w-4" />
                <span>Content</span>
              </button>
              <button
                onClick={() => setProjectTab("tasks")}
                className={cn(
                  "flex items-center gap-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition shrink-0",
                  projectTab === "tasks"
                    ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
                )}
              >
                <CheckSquare2 className="h-4 w-4" />
                <span>Tasks</span>
              </button>
              <button
                onClick={() => setProjectTab("meetings")}
                className={cn(
                  "flex items-center gap-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition shrink-0",
                  projectTab === "meetings"
                    ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
                )}
              >
                <CalendarDays className="h-4 w-4" />
                <span>Meetings</span>
              </button>
              <button
                onClick={() => setProjectTab("docs")}
                className={cn(
                  "flex items-center gap-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition shrink-0",
                  projectTab === "docs"
                    ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
                )}
              >
                <BookOpen className="h-4 w-4" />
                <span>Docs</span>
              </button>
            </div>

            {/* Active Tab View */}
            {projectTab === "content" && (
              <>
                <Editor
                  key={documentId}
                  documentId={documentId}
                  onChange={onChange}
                  initialContent={editorInitialContent}
                  smallText={isSmallText}
                  onEditorReady={setEditor}
                  editorFont={activeFont}
                />
                {showToc && <TableOfContents editor={editor} />}
              </>
            )}

            {projectTab === "tasks" && (
              <div className="space-y-4 w-full overflow-hidden">
                {tasksDb ? (
                  <KanbanBoard
                    documentId={tasksDb._id}
                    config={parseDatabaseConfig(tasksDb.content)}
                    subpages={projectTasks}
                    preview={false}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">Tasks database not found</div>
                )}
              </div>
            )}

            {projectTab === "meetings" && (
              <div className="space-y-4 w-full overflow-hidden">
                {meetingsDb ? (
                  <TableView
                    documentId={meetingsDb._id}
                    config={parseDatabaseConfig(meetingsDb.content)}
                    subpages={projectMeetings}
                    preview={false}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">Meetings database not found</div>
                )}
              </div>
            )}

            {projectTab === "docs" && (
              <div className="space-y-4 w-full overflow-hidden">
                {docsDb ? (
                  <TableView
                    documentId={docsDb._id}
                    config={parseDatabaseConfig(docsDb.content)}
                    subpages={projectDocs}
                    preview={false}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">Docs database not found</div>
                )}
              </div>
            )}
          </div>
        ) : isWiki ? (
          <div className="space-y-6 w-full">
            {/* Sub-header Bar */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-4 text-xs">
              <button className="flex items-center gap-x-1 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer select-none">
                <span>🏠</span>
                <span>Home</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <button className="flex items-center gap-x-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-250 cursor-pointer">
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
              </button>
            </div>

            {/* Description/Tip Box */}
            <div className="text-xs text-muted-foreground leading-relaxed">
              Convert all those scattered pages into a Zotion database with one click — while keeping the easy-to-read page format.
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 mb-6 text-xs text-neutral-600 dark:text-neutral-455 flex items-start gap-x-3">
              <span className="text-base select-none shrink-0">💡</span>
              <div>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">Zotion Tip: </span>
                Use this template to organize important information for your team. Add owners, verification, and tags to pages to keep them up to date. Just replace this sample content with your own.
              </div>
            </div>

            {/* Wiki Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column: Subpage Categories */}
              <div className="md:col-span-4 space-y-6 border-r border-neutral-100 dark:border-neutral-900/60 pr-4">
                {(() => {
                  const subs = subpages || [];
                  const teamSubs = subs.filter((s) =>
                    /started|mission|vision|values|travel|press|about|guide|team|meet|corporate/i.test(s.title || "")
                  );
                  const policySubs = subs.filter((s) =>
                    /policy|policies|vacation|morale|benefit|benefits|rule|rules|hr|conduct/i.test(s.title || "")
                  );
                  const newPageSubs = subs.filter(
                    (s) => !teamSubs.includes(s) && !policySubs.includes(s)
                  );

                  return (
                    <>
                      {/* Team Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-neutral-850 dark:text-neutral-200 tracking-tight">Team</h4>
                          <button
                            onClick={() => handleCreateWikiSubpage("team")}
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-250 cursor-pointer"
                            title="Add team page"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          {teamSubs.map((s) => (
                            <a
                              key={s._id}
                              href={`/documents/${s._id}`}
                              className="flex items-center gap-x-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline py-1"
                            >
                              {s.icon ? <span>{s.icon}</span> : <span>📄</span>}
                              <span>{s.title || "Untitled"}</span>
                            </a>
                          ))}
                          {teamSubs.length === 0 && <span className="text-[11px] text-muted-foreground italic">No team pages yet.</span>}
                        </div>
                      </div>

                      {/* Policies Section */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-neutral-855 dark:text-neutral-200 tracking-tight">Policies</h4>
                          <button
                            onClick={() => handleCreateWikiSubpage("policy")}
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-250 cursor-pointer"
                            title="Add policy page"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          {policySubs.map((s) => (
                            <a
                              key={s._id}
                              href={`/documents/${s._id}`}
                              className="flex items-center gap-x-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline py-1"
                            >
                              {s.icon ? <span>{s.icon}</span> : <span>📄</span>}
                              <span>{s.title || "Untitled"}</span>
                            </a>
                          ))}
                          {policySubs.length === 0 && <span className="text-[11px] text-muted-foreground italic">No policy pages yet.</span>}
                        </div>
                      </div>

                      {/* New Pages Section */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-neutral-855 dark:text-neutral-200 tracking-tight">New Pages</h4>
                          <button
                            onClick={() => handleCreateWikiSubpage("new")}
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-250 cursor-pointer"
                            title="Add new page"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          {newPageSubs.map((s) => (
                            <a
                              key={s._id}
                              href={`/documents/${s._id}`}
                              className="flex items-center gap-x-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline py-1"
                            >
                              {s.icon ? <span>{s.icon}</span> : <span>📄</span>}
                              <span>{s.title || "Untitled"}</span>
                            </a>
                          ))}
                          {newPageSubs.length === 0 && <span className="text-[11px] text-muted-foreground italic">No subpages yet.</span>}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Right Column: Dynamic View of Subpages */}
              <div className="md:col-span-8 overflow-hidden w-full">
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-3.5 bg-white dark:bg-neutral-900/40">
                  
                  {/* View Switcher Tabs Header */}
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-2 mb-4">
                    <div className="flex items-center gap-x-1">
                      {[
                        { key: "gallery", label: "Gallery", Icon: ImageIcon },
                        { key: "board", label: "Board", Icon: LayoutGrid },
                        { key: "table", label: "Table", Icon: Table },
                        { key: "todo", label: "List", Icon: ListChecks },
                      ]
                        .filter((t) => (wikiConfig.views || ["gallery"]).includes(t.key))
                        .map((t) => {
                          const Icon = t.Icon;
                          const isActive = wikiConfig.viewType === t.key;
                          return (
                            <button
                              key={t.key}
                              onClick={() => handleUpdateWikiConfig({ ...wikiConfig, viewType: t.key })}
                              className={cn(
                                "flex items-center gap-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-colors cursor-pointer",
                                isActive
                                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold"
                                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-450 dark:hover:text-neutral-250"
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span>{t.label} View</span>
                            </button>
                          );
                        })}

                      {/* Add View Dropdown */}
                      {[
                        { key: "gallery", label: "Gallery", Icon: ImageIcon },
                        { key: "board", label: "Board", Icon: LayoutGrid },
                        { key: "table", label: "Table", Icon: Table },
                        { key: "todo", label: "List", Icon: ListChecks },
                      ].filter((t) => !(wikiConfig.views || ["gallery"]).includes(t.key)).length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex items-center gap-x-1 px-2 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition outline-hidden cursor-pointer">
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add View</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="dark:bg-neutral-900">
                            <DropdownMenuLabel className="text-[10px]">Add View Type</DropdownMenuLabel>
                            {[
                              { key: "gallery", label: "Gallery", Icon: ImageIcon },
                              { key: "board", label: "Board", Icon: LayoutGrid },
                              { key: "table", label: "Table", Icon: Table },
                              { key: "todo", label: "List", Icon: ListChecks },
                            ]
                              .filter((t) => !(wikiConfig.views || ["gallery"]).includes(t.key))
                              .map((t) => {
                                const Icon = t.Icon;
                                return (
                                  <DropdownMenuItem
                                    key={t.key}
                                    onClick={() => handleUpdateWikiConfig({
                                      ...wikiConfig,
                                      viewType: t.key,
                                      views: [...(wikiConfig.views || ["gallery"]), t.key],
                                    })}
                                    className="text-xs cursor-pointer flex items-center gap-x-2"
                                  >
                                    <Icon className="h-3.5 w-3.5 mr-2" />
                                    <span>{t.label} View</span>
                                  </DropdownMenuItem>
                                );
                              })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {/* Render active view */}
                  {wikiConfig.viewType === "gallery" && (
                    <GalleryView
                      documentId={documentId}
                      config={wikiConfig}
                      subpages={subpages || []}
                      preview={false}
                      onAddRow={() => handleCreateWikiSubpage("new")}
                    />
                  )}
                  {wikiConfig.viewType === "board" && (
                    <KanbanBoard
                      documentId={documentId}
                      config={wikiConfig}
                      subpages={subpages || []}
                      preview={false}
                    />
                  )}
                  {wikiConfig.viewType === "table" && (
                    <TableView
                      documentId={documentId}
                      config={wikiConfig}
                      subpages={subpages || []}
                      preview={false}
                    />
                  )}
                  {wikiConfig.viewType === "todo" && (
                    <TodoView
                      documentId={documentId}
                      config={wikiConfig}
                      subpages={subpages || []}
                      preview={false}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Editor Area Below */}
            <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
              <div className="text-muted-foreground text-xs mb-3 italic">Press 'space' for AI or '/' for commands</div>
              <Editor
                key={documentId}
                documentId={documentId}
                onChange={onChange}
                initialContent={editorInitialContent}
                smallText={isSmallText}
                onEditorReady={setEditor}
                editorFont={activeFont}
              />
            </div>
          </div>
        ) : (
          isDb ? (
            <DatabaseView
              documentId={documentId}
              initialContent={currentContent}
            />
          ) : (
            <>
              <Editor
                key={documentId}
                onChange={onChange}
                initialContent={editorInitialContent}
                smallText={isSmallText}
                onEditorReady={setEditor}
                editorFont={activeFont}
              />
              {showToc && <TableOfContents editor={editor} />}
            </>
          )
        )}
        {!isWiki && <SubpagesList documentId={documentId} />}
      </div>
      <HistorySidebar />
    </div>
  );
};
export default DocumentIdPage;
