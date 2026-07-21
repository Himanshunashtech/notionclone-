"use client";

import React, { ComponentRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useMutation, useQuery } from "@/hooks/use-supabase-db";
import { useParams, usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { api } from "@/lib/supabase-db";
import { DocumentList } from "./DocumentList";
import { Item } from "./Item";
import { UserItem } from "./UserItem";

import { toast } from "sonner";
import {
  ChevronsLeft,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash,
  Users,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Eye,
  EyeOff,
  MoreHorizontal,
  Library as LibraryIcon,
  Calendar,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TrashBox } from "./TrashBox";
import { useSearch } from "@/hooks/useSearch";
import { useSettings } from "@/hooks/useSettingsModal";
import { useTemplates } from "@/hooks/useTemplatesModal";
import { useOnboarding } from "@/hooks/useOnboardingModal";
import { Navbar } from "./Navbar";
import { ScrollableList } from "@/components/scrollable-list";
import { FavoritesList } from "./FavoritesList";
import { ActionTooltip } from "@/components/action-tooltip";
import { useFocusMode } from "@/hooks/useFocusMode";
import NavDrawer from "./NavDrawer";
import { CalendarHoverPanel } from "./CalendarHoverPanel";

const Navigation = () => {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isDesktop = useMediaQuery("(min-width: 1020px)");

  const search = useSearch();
  const settings = useSettings();
  const templatesModal = useTemplates();
  const onboarding = useOnboarding();

  const { focusMode, setFocusMode } = useFocusMode();
  const prevFocusMode = useRef(focusMode);

  const create = useMutation(api.documents.create);
  const updateDocument = useMutation(api.documents.update);
  const removeDocument = useMutation(api.documents.remove);
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

  const isSeedingRef = useRef(false);

  const seedTeamspace = async (teamName: string) => {
    isSeedingRef.current = true;
    try {
      // Create the parent teamspace container with the user's chosen name
      const parentId = await create({ title: teamName });
      saveTeamspaces([...teamspaceIds, parentId]);

      // Seed all child databases under the parent teamspace
      await seedChildDatabases(parentId);

      toast.success("Your team space is ready!");
    } catch (error) {
      console.error("Seeding error:", error);
      toast.error("Failed to set up team space.");
    } finally {
      isSeedingRef.current = false;
    }
  };

  const handleReseed = async () => {
    if (isSeedingRef.current) return;
    const ok = window.confirm("Are you sure you want to reseed the Teamspace? This will delete existing Projects, Meetings, Docs, Tasks, Brainstorming Session, and Goals pages.");
    if (!ok) return;

    const teamspaceTitles = ["Projects", "Meetings", "Docs", "Tasks", "Brainstorming Session", "Goals"];
    const toDelete = rootDocuments?.filter((d) => teamspaceTitles.includes(d.title)) || [];

    const promise = async () => {
      for (const doc of toDelete) {
        await removeDocument({ id: doc._id });
      }
      const teamName = window.prompt("Enter the team space name:", "My Team") || "My Team";
      await seedTeamspace(teamName);
    };

    toast.promise(promise(), {
      loading: "Reseeding Teamspace...",
      success: "Teamspace reseeded successfully!",
      error: "Failed to reseed Teamspace."
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

  useEffect(() => {
    if (rootDocuments === undefined || isSeedingRef.current) return;

    const alreadyOnboarded = localStorage.getItem("zotion-onboarding-done");
    if (alreadyOnboarded) return;

    // Only show onboarding for brand-new accounts with no pages at all
    if (rootDocuments.length === 0) {
      onboarding.onOpen(async (teamName: string) => {
        onboarding.onClose();
        localStorage.setItem("zotion-onboarding-done", "true");
        await seedTeamspace(teamName);
      });
    } else {
      // Has pages already — skip onboarding
      localStorage.setItem("zotion-onboarding-done", "true");
    }
  }, [rootDocuments]);

  const isDefaultTeamspace = (doc: any) =>
    ["Projects", "Meetings", "Docs", "Tasks", "Brainstorming Session", "Goals"].includes(doc.title);

  const teamspacePages = rootDocuments
    ? rootDocuments.filter((d) => isDefaultTeamspace(d) || teamspaceIds.includes(d._id))
    : [];

  const orderedTeamspaces = [...teamspacePages].sort((a, b) => {
    const order = ["Projects", "Meetings", "Docs", "Tasks", "Brainstorming Session", "Goals"];
    const idxA = order.indexOf(a.title);
    const idxB = order.indexOf(b.title);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.title.localeCompare(b.title);
  });

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ComponentRef<"aside">>(null);
  const navbarRef = useRef<ComponentRef<"div">>(null);

  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const [isNavbarHovered, setIsNavbarHovered] = useState(false);

  // sidebar effects
  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  // focus mode effects
  useEffect(() => {
    if (isMobile) return;

    if (focusMode && params.documentId) {
      collapse();
    } else if (!focusMode && prevFocusMode.current && params.documentId) {
      resetWidth();
    } else if (!isCollapsed) {
      resetWidth();
    }

    prevFocusMode.current = focusMode;
  }, [params.documentId, focusMode, isMobile, isCollapsed]);

  useEffect(() => {
    if (!navbarRef.current) return;

    if (
      focusMode &&
      params.documentId &&
      !isNavbarHovered &&
      isCollapsed &&
      !isMobile
    ) {
      setTimeout(
        () => navbarRef.current?.style.setProperty("opacity", "0"),
        400,
      );
    } else {
      navbarRef.current.style.removeProperty("opacity");
    }
  }, [focusMode, params.documentId, isMobile, isNavbarHovered, isCollapsed]);

  // key binds effects
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "\\") {
        e.preventDefault();
        isCollapsed ? resetWidth() : collapse();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        setFocusMode(!focusMode);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusMode]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = e.clientX;

    if (newWidth < 280) newWidth = 280;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`,
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);
      setTimeout(() => {
        if (sidebarRef.current && navbarRef.current) {
          sidebarRef.current.style.width = isMobile ? "100%" : "280px";
          navbarRef.current.style.removeProperty("width");
          navbarRef.current.style.setProperty(
            "width",
            isMobile ? "0" : "calc(100% - 280px)",
          );
          navbarRef.current.style.setProperty(
            "left",
            isMobile ? "100%" : "280px",
          );
        }
      }, 0);
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const handleCreate = () => {
    templatesModal.onOpen();
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar bg-secondary relative z-300 flex h-full w-[280px] flex-col overflow-hidden overflow-x-hidden pb-4",
          isResetting && "transition-all duration-300 ease-in-out",
          isMobile && "w-0",
        )}
      >
        <ActionTooltip label="Close sidebar (Ctrl + \)">
          <div
            onClick={collapse}
            role="button"
            aria-label="Close sidebar"
            className={cn(
              "text-muted-foreground absolute top-3 right-2 h-6 w-6 rounded-sm opacity-0 transition group-hover/sidebar:opacity-100 hover:bg-neutral-300 dark:hover:bg-neutral-600",
              isMobile && "opacity-100",
            )}
          >
            <ChevronsLeft className="h-6 w-6" />
          </div>
        </ActionTooltip>
        <div>
          <UserItem />
          <Item
            label="Search"
            icon={Search}
            onClick={search.onOpen}
            shortcut="Ctrl + K"
          />
          <Item label="Settings" icon={Settings} onClick={settings.onOpen} />
          <Item onClick={() => router.push("/library")} label="Library" icon={LibraryIcon} />
          <CalendarHoverPanel>
            <Item onClick={() => router.push("/calendar")} label="Calendar" icon={Calendar} />
          </CalendarHoverPanel>
          <Item onClick={handleCreate} label="New page" icon={PlusCircle} />
        </div>
        <div className="mt-4 flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 flex flex-col">
            <ScrollableList>
              <FavoritesList />
              
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
                            isFavorite={page.isFavorite}
                            onFavorite={() => {
                              toggleFavorite({ id: page._id });
                            }}
                            expanded={!!expanded[page._id]}
                            onExpand={() => onExpand(page._id)}
                          />
                          {expanded[page._id] && (
                            <DocumentList
                              parentDocumentId={page._id}
                              level={2}
                            />
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Wikis Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between px-3 py-1 group">
                  <p className="text-muted-foreground/60 text-xs font-medium uppercase tracking-wider">
                    Wikis
                  </p>
                  <button
                    onClick={async () => {
                      const newId = await create({ title: "Wiki" });
                      try {
                        const stored = localStorage.getItem("wikiPageIds");
                        let ids = stored ? JSON.parse(stored) : [];
                        ids.push(newId);
                        localStorage.setItem("wikiPageIds", JSON.stringify(ids));
                        window.dispatchEvent(new CustomEvent("wiki-status-changed"));
                      } catch {}
                      router.push(`/documents/${newId}`);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition p-0.5 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 text-muted-foreground cursor-pointer"
                    title="New wiki"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <DocumentList excludeIds={teamspaceIds} onlyWikis={true} />
              </div>

              <div>
                <div className="flex items-center justify-between px-3 py-1 group">
                  <p className="text-muted-foreground/60 text-xs font-medium uppercase tracking-wider">
                    Notes
                  </p>
                  <button
                    onClick={async () => {
                      const newId = await create({ title: "Untitled" });
                      router.push(`/documents/${newId}`);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition p-0.5 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 text-muted-foreground cursor-pointer"
                    title="New note"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <DocumentList excludeIds={teamspaceIds} />
              </div>
            </ScrollableList>
          </div>
          <Item onClick={handleCreate} icon={Plus} label="Add a page" />
          <Popover>
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
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="bg-primary/10 absolute top-0 right-0 h-full w-1 cursor-ew-resize opacity-0 transition group-hover/sidebar:opacity-100"
        ></div>
      </aside>
      {isCollapsed && isDesktop && !focusMode && (
        <NavDrawer resetWidth={resetWidth} isMobile={isMobile} />
      )}
      <div
        ref={navbarRef}
        onMouseEnter={() => setIsNavbarHovered(true)}
        onMouseLeave={() => setIsNavbarHovered(false)}
        className={cn(
          "absolute top-0 left-[280px] z-40 w-[calc(100%-280px)]",
          !isResizingRef.current && "transition-all duration-300 ease-in-out",
          isMobile && "left-0 w-full",
        )}
      >
        {!!params.documentId ? (
          (!isMobile || isCollapsed) && (
            <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} />
          )
        ) : (
          <nav
            className={cn(
              "w-full bg-transparent px-3 py-2",
              !isCollapsed && "p-0",
            )}
          >
            {isCollapsed && (
              <ActionTooltip label="Open sidebar (Ctrl + \)">
                <button onClick={resetWidth}>
                  <MenuIcon className="text-muted-foreground h-6 w-6" />
                </button>
              </ActionTooltip>
            )}
          </nav>
        )}
      </div>
    </>
  );
};
export default Navigation;
