import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavDrawer } from "@/hooks/useNavDrawer";
import { UserItem } from "./UserItem";
import { ActionTooltip } from "@/components/action-tooltip";
import {
  ChevronsRight,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash,
  ChevronDown,
  ChevronRight,
  Users,
  MoreHorizontal,
  Eye,
  EyeOff,
} from "lucide-react";
import { FavoritesList } from "./FavoritesList";
import { DocumentList } from "./DocumentList";
import { Item } from "./Item";
import { TrashBox } from "./TrashBox";
import { toast } from "sonner";
import { useMutation, useQuery } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { useRouter, useParams } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { useSettings } from "@/hooks/useSettingsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

type NavDrawerProps = {
  resetWidth: () => void;
  isMobile: boolean;
};

const NavDrawer = ({ resetWidth, isMobile }: NavDrawerProps) => {
  const router = useRouter();
  const params = useParams();

  const search = useSearch();
  const settings = useSettings();

  const [isEdgeHovered, setIsEdgeHovered] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const create = useMutation(api.documents.create);
  const updateDocument = useMutation(api.documents.update);
  const toggleFavorite = useMutation(api.documents.toggleFavorite);
  const rootDocuments = useQuery(api.documents.getSidebar, {});

  const [isTeamspaceExpanded, setIsTeamspaceExpanded] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("zotion-sidebar-expanded");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => {
      const next = {
        ...prevExpanded,
        [documentId]: !prevExpanded[documentId],
      };
      try {
        localStorage.setItem("zotion-sidebar-expanded", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const [teamspaceIds, setTeamspaceIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("teamspaceIds");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  const saveTeamspaces = (ids: string[]) => {
    setTeamspaceIds(ids);
    localStorage.setItem("teamspaceIds", JSON.stringify(ids));
  };

  const seedChildDatabases = async (parentSpaceId: string) => {
    // 1. Create Projects first
    const projId = await create({ title: "Projects", parentDocument: parentSpaceId });

    // 2. Create Docs with Project relation
    const docsId = await create({ title: "Docs", parentDocument: parentSpaceId });
    const docsConfig = {
      type: "database",
      viewType: "table",
      views: ["table", "board"],
      properties: [
        { id: "status", name: "Status", type: "select", options: ["Draft", "In Review", "Published"] },
        { id: "project", name: "Project", type: "relation", linkedDatabaseId: projId },
        { id: "tags", name: "Tags", type: "multiselect", options: ["Guide", "Spec", "API", "Marketing"] }
      ]
    };
    await updateDocument({
      id: docsId,
      icon: "📘",
      content: JSON.stringify(docsConfig, null, 2)
    });

    // 3. Create Meetings
    const mtgId = await create({ title: "Meetings", parentDocument: parentSpaceId });
    const mtgConfig = {
      type: "database",
      viewType: "table",
      views: ["table", "calendar"],
      properties: [
        { id: "date", name: "Date", type: "date" },
        { id: "attendees", name: "Attendees", type: "text" },
        { id: "type", name: "Type", type: "select", options: ["Weekly Sync", "1:1", "Retrospective", "Brainstorm"] }
      ]
    };
    await updateDocument({
      id: mtgId,
      icon: "📅",
      content: JSON.stringify(mtgConfig, null, 2)
    });

    // 4. Create Tasks
    const tasksId = await create({ title: "Tasks", parentDocument: parentSpaceId });
    const tasksConfig = {
      type: "database",
      viewType: "table",
      views: ["table", "board"],
      properties: [
        { id: "status", name: "Status", type: "select", options: ["To Do", "In Progress", "Done"] },
        { id: "priority", name: "Priority", type: "select", options: ["Low", "Medium", "High"] },
        { id: "assignee", name: "Assignee", type: "text" },
        { id: "due_date", name: "Due Date", type: "date" }
      ]
    };
    await updateDocument({
      id: tasksId,
      icon: "📋",
      content: JSON.stringify(tasksConfig, null, 2)
    });

    // 5. Create Brainstorming Session
    const bsId = await create({ title: "Brainstorming Session", parentDocument: parentSpaceId });
    const bsConfig = {
      type: "database",
      viewType: "table",
      views: ["table", "board"],
      properties: [
        { id: "status", name: "Status", type: "select", options: ["Idea", "Researching", "Approved", "Rejected"] },
        { id: "votes", name: "Votes", type: "number" },
        { id: "category", name: "Category", type: "select", options: ["Product", "Design", "Marketing", "Growth"] }
      ]
    };
    await updateDocument({
      id: bsId,
      icon: "💡",
      content: JSON.stringify(bsConfig, null, 2)
    });

    // 6. Create Goals with Project relation
    const goalsId = await create({ title: "Goals", parentDocument: parentSpaceId });
    const goalsConfig = {
      type: "database",
      viewType: "table",
      views: ["table"],
      properties: [
        { id: "status", name: "Status", type: "select", options: ["Not Started", "On Track", "Behind", "Achieved"] },
        { id: "project", name: "Project", type: "relation", linkedDatabaseId: projId },
        { id: "timeframe", name: "Timeframe", type: "select", options: ["Q1", "Q2", "Q3", "Q4", "H1", "H2", "Yearly"] },
        { id: "target_date", name: "Target Date", type: "date" }
      ]
    };
    await updateDocument({
      id: goalsId,
      icon: "🏁",
      content: JSON.stringify(goalsConfig, null, 2)
    });

    // Update Projects config with references to tasks, meetings, and docs
    const projConfig = {
      type: "database",
      viewType: "table",
      views: ["table", "board", "chart"],
      properties: [
        { id: "stage", name: "Stage", type: "select", options: ["Idea", "Planning", "In Progress", "Completed"] },
        { id: "timeline", name: "Timeline", type: "date" },
        { id: "lead", name: "Lead", type: "text" },
        { id: "tasks", name: "Tasks", type: "relation", linkedDatabaseId: tasksId },
        { id: "meetings", name: "Meetings", type: "relation", linkedDatabaseId: mtgId },
        { id: "docs", name: "Docs", type: "relation", linkedDatabaseId: docsId }
      ]
    };
    await updateDocument({
      id: projId,
      icon: "🎯",
      content: JSON.stringify(projConfig, null, 2)
    });
  };

  const handleCreateTeamspace = async () => {
    const name = window.prompt("Enter teamspace name:");
    if (!name || !name.trim()) return;

    const promise = create({ title: name.trim() }).then(async (newId) => {
      await seedChildDatabases(newId);
      saveTeamspaces([...teamspaceIds, newId]);
      router.push(`/documents/${newId}`);
    });

    toast.promise(promise, {
      loading: "Creating new teamspace...",
      success: "New teamspace created!",
      error: "Failed to create teamspace.",
    });
  };

  const [hiddenTeamspaces, setHiddenTeamspaces] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("hiddenTeamspaces") || "[]");
      } catch {
        return [];
      }
    }
    return [];
  });

  const toggleTeamspaceVisibility = (title: string) => {
    const next = hiddenTeamspaces.includes(title)
      ? hiddenTeamspaces.filter((t) => t !== title)
      : [...hiddenTeamspaces, title];
    setHiddenTeamspaces(next);
    localStorage.setItem("hiddenTeamspaces", JSON.stringify(next));
  };

  const isDefaultTeamspace = (doc: any) =>
    ["Projects", "Meetings", "Docs", "Tasks", "Brainstorming Session", "Goals"].includes(doc.title) && !doc.parentDocument;

  const teamspacePages = rootDocuments
    ? rootDocuments.filter((d) => isDefaultTeamspace(d) || teamspaceIds.includes(d._id))
    : [];

  const orderedTeamspaces = [...teamspacePages].sort((a, b) => {
    const aIdx = ["Projects", "Meetings", "Docs", "Tasks", "Brainstorming Session", "Goals"].indexOf(a.title);
    const bIdx = ["Projects", "Meetings", "Docs", "Tasks", "Brainstorming Session", "Goals"].indexOf(b.title);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return b._creationTime - a._creationTime;
  });

  const { isInnerPopoverOpen, setInnerPopoverOpen } = useNavDrawer();
  const open = isEdgeHovered || isDrawerOpen || isInnerPopoverOpen;

  const handleCreate = () => {
    const promise = create({ title: "Untitled" }).then((documentId) =>
      router.push(`/documents/${documentId}`),
    );

    toast.promise(promise, {
      loading: "Creating a new note....",
      success: "New note created.",
      error: "Failed to create a note.",
    });
  };

  return (
    <div>
      <Popover open={open}>
        <PopoverTrigger asChild>
          <span
            onMouseEnter={() => setIsEdgeHovered(true)}
            onMouseLeave={() => setTimeout(() => setIsEdgeHovered(false), 500)}
            className="absolute top-0 left-0 z-200 h-full w-3.5"
          ></span>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="center"
          sideOffset={-24}
          className="bg-secondary w-75 rounded-tl-none rounded-bl-none border border-gray-300 pt-2 pr-0 pb-3 pl-2"
          onMouseEnter={() => setIsDrawerOpen(true)}
          onMouseLeave={() => setIsDrawerOpen(false)}
        >
          <div className="relative flex items-center justify-between gap-4 px-2">
            <UserItem navDrawer />
            <ActionTooltip label="Lock sidebar open (Ctrl + \)">
              <div
                onClick={resetWidth}
                role="button"
                aria-label="Open full sidebar"
                className={cn(
                  "text-muted-foreground h-6 w-6 rounded-sm transition hover:bg-neutral-300 dark:hover:bg-neutral-600",
                )}
              >
                <ChevronsRight className="h-6 w-6" />
              </div>
            </ActionTooltip>
          </div>
          <div className="flex items-center justify-between gap-2 px-2 pb-2">
            <div className="flex items-center justify-center">
              <Item
                label="Search"
                icon={Search}
                onClick={search.onOpen}
                navDrawer
              />
              <Item
                label="New Page"
                icon={PlusCircle}
                onClick={handleCreate}
                navDrawer
              />
            </div>
            <ActionTooltip label="Settings">
              <div className="justify-end">
                <Item icon={Settings} onClick={settings.onOpen} navDrawer />
              </div>
            </ActionTooltip>
          </div>
          <div className="max-h-[65vh] overflow-y-auto pb-3">
            <FavoritesList navDrawer />
            
            {/* Teamspaces Section */}
            <div className="mb-4">
              <div
                className="flex items-center justify-between px-3 py-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md mx-2 select-none group"
              >
                <div
                  onClick={() => setIsTeamspaceExpanded(!isTeamspaceExpanded)}
                  role="button"
                  className="flex items-center gap-x-1 text-[11px] font-bold text-muted-foreground/60 cursor-pointer"
                >
                  {isTeamspaceExpanded ? (
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3 w-3 shrink-0" />
                  )}
                  <Users className="h-3.5 w-3.5 text-blue-500 mr-1 shrink-0" />
                  <span className="uppercase tracking-wider">Teamspaces</span>
                </div>
                <div className="flex items-center gap-x-1 opacity-0 group-hover:opacity-100 transition">
                  <ActionTooltip label="New Teamspace">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateTeamspace();
                      }}
                      className="p-1 rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-700 text-muted-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </ActionTooltip>

                  <DropdownMenu>
                    <ActionTooltip label="Teamspace Settings">
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-700 text-muted-foreground"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                    </ActionTooltip>
                    <DropdownMenuContent align="end" className="dark:bg-neutral-900 min-w-[180px] z-[9999]">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateTeamspace();
                        }}
                        className="text-xs cursor-pointer flex items-center gap-x-2"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create new teamspace</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px]">Show/Hide Sections</DropdownMenuLabel>
                      {orderedTeamspaces.map((page) => {
                        const isHidden = hiddenTeamspaces.includes(page.title);
                        return (
                          <DropdownMenuItem
                            key={page._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTeamspaceVisibility(page.title);
                            }}
                            className="text-xs cursor-pointer flex items-center justify-between"
                          >
                            <span>{page.title}</span>
                            {isHidden ? (
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <Eye className="h-3.5 w-3.5 text-blue-500" />
                            )}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {isTeamspaceExpanded && (
                <div className="mt-1 space-y-[1px]">
                  {orderedTeamspaces
                    .filter((page) => !hiddenTeamspaces.includes(page.title))
                    .map((page) => (
                      <div key={page._id}>
                        <Item
                          id={page._id}
                          onClick={() => router.push(`/documents/${page._id}`)}
                          label={page.title}
                          icon={Users}
                          documentIcon={page.icon}
                          active={params.documentId === page._id}
                          level={1}
                          isTeamspace={true}
                          isHidden={hiddenTeamspaces.includes(page.title)}
                          onToggleHide={() => toggleTeamspaceVisibility(page.title)}
                          expanded={!!expanded[page._id]}
                          onExpand={() => onExpand(page._id)}
                          navDrawer
                        />
                        {expanded[page._id] && (
                          <DocumentList
                            parentDocumentId={page._id}
                            level={2}
                            navDrawer
                          />
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-muted-foreground/60 px-3 py-1 text-xs font-medium">
                Notes
              </p>
              <DocumentList excludeIds={teamspaceIds} navDrawer />
            </div>
            <Item onClick={handleCreate} icon={Plus} label="Add a page" />
            <Popover onOpenChange={setInnerPopoverOpen}>
              <PopoverTrigger className="mt-3 w-full">
                <Item label="Trash" icon={Trash} />
              </PopoverTrigger>
              <PopoverContent
                side={isMobile ? "bottom" : "right"}
                className="w-72 p-0"
                collisionPadding={16}
              >
                <TrashBox />
              </PopoverContent>
            </Popover>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
export default NavDrawer;
