"use client";

import { useMutation, useQuery } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { Id } from "@/lib/supabase-db";
import React, { useState } from "react";
import {
  Table,
  LayoutGrid,
  ListChecks,
  Plus,
  Loader2,
  ArrowUpDown,
  ListFilter,
  Zap,
  Search,
  SlidersHorizontal,
  ChevronDown,
  FolderOpen,
  X,
  Sparkles,
  Image,
} from "lucide-react";
import { parseDatabaseConfig, defaultValueForType, parseDatabaseRow } from "./database-utils";
import { TableView } from "@/components/database/TableView";
import { KanbanBoard } from "@/components/database/KanbanBoard";
import { TodoView } from "@/components/database/TodoView";
import { DocumentView } from "@/components/database/DocumentView";
import { CalendarView } from "@/components/database/CalendarView";
import { TimelineView } from "@/components/database/TimelineView";
import { ChartView } from "@/components/database/ChartView";
import { GalleryView } from "@/components/database/GalleryView";
import { FormView } from "@/components/database/FormView";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface DatabaseViewProps {
  documentId: string;
  initialContent?: string;
  preview?: boolean;
}

type ViewType = "table" | "board" | "todo" | "document" | "calendar" | "timeline" | "chart" | "gallery" | "form";

export const DatabaseView = ({
  documentId,
  initialContent,
  preview = false,
}: DatabaseViewProps) => {
  const config = parseDatabaseConfig(initialContent);
  const update = useMutation(api.documents.update);
  const createNote = useMutation(api.documents.create);

  const subpages = useQuery(api.documents.getSidebar, {
    parentDocument: documentId,
  });

  const [activeTab, setActiveTab] = useState<ViewType>(config.viewType);

  // --- Search, Sort, & Filter States ---
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showSort, setShowSort] = useState(false);
  const [sortProp, setSortProp] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [showFilter, setShowFilter] = useState(false);
  const [filterProp, setFilterProp] = useState<string | null>(null);
  const [filterOperator, setFilterOperator] = useState<string>("contains");
  const [filterVal, setFilterVal] = useState<string>("");

  const handleViewChange = async (viewType: ViewType) => {
    setActiveTab(viewType);
    if (preview) return;
    const currentViews = config.views || ["table", "board", "chart"];
    const newConfig = {
      ...config,
      viewType,
      views: currentViews.includes(viewType) ? currentViews : [...currentViews, viewType]
    };
    try {
      await update({
        id: documentId as Id<"documents">,
        content: JSON.stringify(newConfig, null, 2),
      });
    } catch {
      toast.error("Failed to update database view settings");
    }
  };

  const handleAddView = async (viewType: ViewType) => {
    if (preview) return;
    const currentViews = config.views || ["table", "board", "chart"];
    if (!currentViews.includes(viewType)) {
      const newViews = [...currentViews, viewType];
      setActiveTab(viewType);
      const newConfig = { ...config, viewType, views: newViews };
      try {
        await update({
          id: documentId as Id<"documents">,
          content: JSON.stringify(newConfig, null, 2),
        });
        toast.success(`Added ${viewType} view`);
      } catch {
        toast.error("Failed to add view");
      }
    } else {
      handleViewChange(viewType);
    }
  };

  const handleAddRow = async () => {
    if (preview) return;

    const isWiki = config.viewType === "document";

    const defaultValues: Record<string, string> = {};
    config.properties.forEach((prop) => {
      defaultValues[prop.id] = defaultValueForType(prop);
    });

    const initialRowContent = JSON.stringify(
      { type: "database_row", values: defaultValues },
      null,
      2
    );

    const promise = createNote({
      title: "Untitled",
      parentDocument: documentId,
    }).then(async (newId) => {
      if (!isWiki) {
        await update({
          id: newId as Id<"documents">,
          content: initialRowContent,
        });
      }
    });

    toast.promise(promise, {
      loading: isWiki ? "Adding new page..." : "Adding new row...",
      success: isWiki ? "New page added!" : "New row added!",
      error: isWiki ? "Failed to add page." : "Failed to add row.",
    });
  };

  // --- Zotion AI Autofill Feature ---
  const handleAIFill = async () => {
    if (preview || !subpages) return;

    let updatedCount = 0;
    const promises = subpages.map(async (page) => {
      const rowData = parseDatabaseRow(page.content);
      const title = (page.title || "").toLowerCase();
      let changed = false;
      const updatedValues = { ...rowData.values };

      config.properties.forEach((prop) => {
        const currentVal = updatedValues[prop.id] || "";
        if (!currentVal.trim()) {
          // Find a smart default based on title keywords
          if (prop.id === "priority" && prop.options) {
            if (title.includes("fix") || title.includes("bug") || title.includes("urgent") || title.includes("critical")) {
              updatedValues[prop.id] = "High";
              changed = true;
            } else if (title.includes("design") || title.includes("update") || title.includes("page")) {
              updatedValues[prop.id] = "Medium";
              changed = true;
            } else {
              updatedValues[prop.id] = "Low";
              changed = true;
            }
          } else if (prop.id === "status" && prop.options) {
            if (title.includes("done") || title.includes("complete") || title.includes("finish")) {
              updatedValues[prop.id] = "Done";
              changed = true;
            } else if (title.includes("build") || title.includes("create") || title.includes("implement") || title.includes("working")) {
              updatedValues[prop.id] = "In Progress";
              changed = true;
            } else {
              updatedValues[prop.id] = "To Do";
              changed = true;
            }
          } else if (prop.type === "checkbox") {
            if (title.includes("done") || title.includes("complete")) {
              updatedValues[prop.id] = "true";
              changed = true;
            }
          }
        }
      });

      if (changed) {
        updatedCount++;
        await update({
          id: page._id as Id<"documents">,
          content: JSON.stringify({ ...rowData, values: updatedValues }, null, 2),
        });
      }
    });

    const runPromise = Promise.all(promises);
    toast.promise(runPromise, {
      loading: "Zotion AI analyzing database rows...",
      success: () => `Zotion AI successfully updated ${updatedCount} row(s)!`,
      error: "AI autofill failed.",
    });
  };

  // --- Real-time sorting and filtering logic ---
  const processedSubpages = React.useMemo(() => {
    let result = [...(subpages || [])];

    // 1. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => (p.title || "").toLowerCase().includes(q));
    }

    // 2. Filtering
    if (filterProp) {
      result = result.filter((page) => {
        const rowData = parseDatabaseRow(page.content);
        const cellValue = (filterProp === "name" ? page.title : rowData.values[filterProp]) || "";

        if (filterOperator === "equals") {
          return cellValue.toLowerCase() === filterVal.toLowerCase();
        }
        if (filterOperator === "contains") {
          return cellValue.toLowerCase().includes(filterVal.toLowerCase());
        }
        if (filterOperator === "is empty") {
          return !cellValue.trim();
        }
        if (filterOperator === "is checked") {
          return cellValue === "true";
        }
        return true;
      });
    }

    // 3. Sorting
    if (sortProp) {
      result.sort((a, b) => {
        const rowA = parseDatabaseRow(a.content);
        const rowB = parseDatabaseRow(b.content);

        let valA = (sortProp === "name" ? a.title : rowA.values[sortProp]) || "";
        let valB = (sortProp === "name" ? b.title : rowB.values[sortProp]) || "";

        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDir === "asc" ? numA - numB : numB - numA;
        }

        return sortDir === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    return result;
  }, [subpages, searchQuery, filterProp, filterOperator, filterVal, sortProp, sortDir]);

  if (subpages === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading database...</span>
      </div>
    );
  }

  const tabs = [
    { key: "table" as const, label: "Table", Icon: Table },
    { key: "board" as const, label: "Board", Icon: LayoutGrid },
    { key: "todo" as const, label: "List", Icon: ListChecks },
    { key: "document" as const, label: "Documents", Icon: FolderOpen },
    { key: "calendar" as const, label: "Calendar", Icon: Table },
    { key: "timeline" as const, label: "Timeline", Icon: LayoutGrid },
    { key: "chart" as const, label: "Chart", Icon: ListChecks },
    { key: "gallery" as const, label: "Gallery", Icon: Image },
  ];

  // Dynamically show tabs based on configured views
  const enabledViews = config.views || ["table", "board", "chart"];
  const visibleTabs = tabs.filter((t) => enabledViews.includes(t.key));

  return (
    <div className="space-y-0">
      {/* ── Notion-style Tab Header ── */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 dark:border-neutral-800 gap-y-2 pb-2 md:pb-0">
        {/* Left: view tabs */}
        <div className="flex items-center gap-x-0">
          {/* Mobile view dropdown selector */}
          <div className="flex md:hidden items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-x-1.5 px-3 py-2 text-xs font-semibold text-neutral-900 dark:text-white outline-hidden">
                {(() => {
                  const activeTabItem = visibleTabs.find((t) => t.key === activeTab);
                  if (activeTabItem) {
                    const ActiveIcon = activeTabItem.Icon;
                    return (
                      <>
                        <ActiveIcon className="h-3.5 w-3.5" />
                        <span>{activeTabItem.label}</span>
                      </>
                    );
                  }
                  return <span>Views</span>;
                })()}
                <ChevronDown className="h-3 w-3 text-neutral-450 ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="dark:bg-neutral-900">
                <DropdownMenuLabel className="text-[10px]">Select View</DropdownMenuLabel>
                {visibleTabs.map(({ key, label, Icon }) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => handleViewChange(key)}
                    className={`text-xs cursor-pointer flex items-center gap-x-2 ${activeTab === key ? "bg-neutral-150 dark:bg-neutral-800 font-bold" : ""}`}
                  >
                    <Icon className="h-3.5 w-3.5 text-neutral-500" />
                    <span>{label}</span>
                  </DropdownMenuItem>
                ))}
                {!preview && tabs.filter((tab) => !enabledViews.includes(tab.key)).length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px]">Add View</DropdownMenuLabel>
                    {tabs
                      .filter((tab) => !enabledViews.includes(tab.key))
                      .map((tab) => (
                        <DropdownMenuItem
                          key={tab.key}
                          onClick={() => handleAddView(tab.key)}
                          className="text-xs cursor-pointer flex items-center gap-x-2"
                        >
                          <tab.Icon className="h-3.5 w-3.5 text-neutral-450" />
                          <span>{tab.label} View</span>
                        </DropdownMenuItem>
                      ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop view tabs */}
          <div className="hidden md:flex items-center gap-x-0">
            {visibleTabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => handleViewChange(key)}
                className={`relative flex items-center gap-x-1.5 px-3 py-2.5 text-xs font-semibold transition-colors select-none
                  ${activeTab === key
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
                {activeTab === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-t-full" />
                )}
              </button>
            ))}

            {!preview && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-x-1 px-2 py-2.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition">
                  <Plus className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="dark:bg-neutral-900">
                  <DropdownMenuLabel className="text-[10px]">Add database view</DropdownMenuLabel>
                  {tabs
                    .filter((tab) => !enabledViews.includes(tab.key))
                    .map((tab) => (
                      <DropdownMenuItem
                        key={tab.key}
                        onClick={() => handleAddView(tab.key)}
                        className="text-xs cursor-pointer"
                      >
                        <tab.Icon className="h-3.5 w-3.5 mr-2" />
                        <span>{tab.label} View</span>
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Right: action icons + New button */}
        <div className="flex items-center gap-x-1 pb-1">
          {/* Sort Button */}
          <button
            onClick={() => {
              setShowSort(!showSort);
              setShowFilter(false);
              setShowSearch(false);
            }}
            title="Sort"
            className={`p-1.5 rounded-md transition ${showSort ? "bg-neutral-200 dark:bg-neutral-800 text-foreground" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>

          {/* Filter Button */}
          <button
            onClick={() => {
              setShowFilter(!showFilter);
              setShowSort(false);
              setShowSearch(false);
            }}
            title="Filter"
            className={`p-1.5 rounded-md transition ${showFilter ? "bg-neutral-200 dark:bg-neutral-800 text-foreground" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
          >
            <ListFilter className="h-3.5 w-3.5" />
          </button>

          {/* AI Autofill Button */}
          {!preview && (
            <button
              onClick={handleAIFill}
              title="Zotion AI Autofill"
              className="p-1.5 text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-neutral-800 rounded-md transition"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            </button>
          )}

          {/* Search Button */}
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              setShowSort(false);
              setShowFilter(false);
            }}
            title="Search"
            className={`p-1.5 rounded-md transition ${showSearch ? "bg-neutral-200 dark:bg-neutral-800 text-foreground" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          {/* Settings Button */}
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="dark:bg-neutral-900 min-w-[180px]">
              <DropdownMenuLabel className="text-[10px]">Database settings</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewChange("table")} className="text-xs cursor-pointer">
                Switch to Table view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewChange("board")} className="text-xs cursor-pointer">
                Switch to Board view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewChange("todo")} className="text-xs cursor-pointer">
                Switch to List view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewChange("calendar")} className="text-xs cursor-pointer">
                Switch to Calendar view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewChange("timeline")} className="text-xs cursor-pointer">
                Switch to Timeline view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewChange("chart")} className="text-xs cursor-pointer">
                Switch to Chart view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewChange("gallery")} className="text-xs cursor-pointer">
                Switch to Gallery view
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewChange("form")} className="text-xs cursor-pointer">
                Switch to Form view
              </DropdownMenuItem>
              {!preview && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleAddRow} className="text-xs cursor-pointer">
                    Add new record
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {!preview && (
            <div className="flex items-center ml-1">
              <button
                onClick={handleAddRow}
                className="flex items-center gap-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-l-md transition"
              >
                <span>New</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center px-1.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-r-md border-l border-blue-500 transition">
                  <ChevronDown className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-neutral-900 min-w-[150px]">
                  <DropdownMenuItem onClick={handleAddRow} className="text-xs cursor-pointer">
                    New empty page
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      const promise = createNote({
                        title: "📝 Draft Plan",
                        parentDocument: documentId,
                      });
                      toast.promise(promise, {
                        loading: "Creating template...",
                        success: "Draft Plan created!",
                        error: "Failed to create Draft Plan.",
                      });
                    }}
                    className="text-xs cursor-pointer"
                  >
                    Draft Plan template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* --- Inline Sort Bar --- */}
      {showSort && (
        <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/60 p-2 border-b border-neutral-200 dark:border-neutral-800 text-xs gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Sort by:</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="px-2.5 py-1 border border-neutral-350 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 font-medium">
                {sortProp === "name" ? "Name" : (config.properties.find(p => p.id === sortProp)?.name || "Select property")}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-neutral-900">
                <DropdownMenuItem onClick={() => setSortProp("name")} className="text-xs cursor-pointer">Name</DropdownMenuItem>
                {config.properties.map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => setSortProp(p.id)} className="text-xs cursor-pointer">
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {sortProp && (
              <DropdownMenu>
                <DropdownMenuTrigger className="px-2.5 py-1 border border-neutral-350 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 font-medium">
                  {sortDir === "asc" ? "Ascending" : "Descending"}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark:bg-neutral-900">
                  <DropdownMenuItem onClick={() => setSortDir("asc")} className="text-xs cursor-pointer">Ascending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortDir("desc")} className="text-xs cursor-pointer">Descending</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {sortProp && (
            <button
              onClick={() => {
                setSortProp(null);
                setShowSort(false);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear Sort
            </button>
          )}
        </div>
      )}

      {/* --- Inline Filter Bar --- */}
      {showFilter && (
        <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/60 p-2 border-b border-neutral-200 dark:border-neutral-800 text-xs gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-muted-foreground">Filter by:</span>

            {/* Property select */}
            <DropdownMenu>
              <DropdownMenuTrigger className="px-2.5 py-1 border border-neutral-355 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 font-medium">
                {filterProp === "name" ? "Name" : (config.properties.find(p => p.id === filterProp)?.name || "Select property")}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-neutral-900">
                <DropdownMenuItem onClick={() => setFilterProp("name")} className="text-xs cursor-pointer">Name</DropdownMenuItem>
                {config.properties.map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => setFilterProp(p.id)} className="text-xs cursor-pointer">
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Operator select */}
            {filterProp && (
              <DropdownMenu>
                <DropdownMenuTrigger className="px-2.5 py-1 border border-neutral-355 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 font-medium">
                  {filterOperator}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="dark:bg-neutral-900">
                  <DropdownMenuItem onClick={() => setFilterOperator("contains")} className="text-xs cursor-pointer">contains</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterOperator("equals")} className="text-xs cursor-pointer">equals</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterOperator("is empty")} className="text-xs cursor-pointer">is empty</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterOperator("is checked")} className="text-xs cursor-pointer">is checked</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Filter Value input */}
            {filterProp && filterOperator !== "is empty" && filterOperator !== "is checked" && (
              <Input
                placeholder="Value..."
                value={filterVal}
                onChange={(e) => setFilterVal(e.target.value)}
                className="h-7 text-xs w-32 border-neutral-300 bg-white dark:bg-neutral-800 dark:border-neutral-700"
              />
            )}
          </div>
          {filterProp && (
            <button
              onClick={() => {
                setFilterProp(null);
                setFilterVal("");
                setShowFilter(false);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* --- Inline Search Bar --- */}
      {showSearch && (
        <div className="flex items-center bg-neutral-50 dark:bg-neutral-900/60 p-2 border-b border-neutral-200 dark:border-neutral-800 text-xs">
          <Input
            placeholder="Search rows by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-xs w-full max-w-sm border-neutral-300 bg-white dark:bg-neutral-800 dark:border-neutral-700"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* ── Active view ── */}
      <div className="pt-2">
        {activeTab === "table" && (
          <TableView
            documentId={documentId}
            config={config}
            subpages={processedSubpages}
            preview={preview}
            onAddRow={handleAddRow}
          />
        )}
        {activeTab === "board" && (
          <KanbanBoard
            documentId={documentId}
            config={config}
            subpages={processedSubpages}
            preview={preview}
          />
        )}
        {activeTab === "todo" && (
          <TodoView
            documentId={documentId}
            config={config}
            subpages={processedSubpages}
            preview={preview}
          />
        )}
        {activeTab === "document" && (
          <DocumentView
            documentId={documentId}
            config={config}
            subpages={processedSubpages}
            preview={preview}
          />
        )}
        {activeTab === "calendar" && (
          <CalendarView
            documentId={documentId}
            config={config}
            subpages={processedSubpages}
            preview={preview}
          />
        )}
        {activeTab === "timeline" && (
          <TimelineView
            documentId={documentId}
            config={config}
            subpages={processedSubpages}
            preview={preview}
          />
        )}
        {activeTab === "chart" && (
          <ChartView
            documentId={documentId}
            config={config}
            subpages={processedSubpages}
            preview={preview}
          />
        )}
        {activeTab === "gallery" && (
          <GalleryView
            documentId={documentId}
            config={config}
            subpages={processedSubpages}
            preview={preview}
            onAddRow={handleAddRow}
          />
        )}
        {activeTab === "form" && (
          <FormView
            documentId={documentId}
            config={config}
            subpages={processedSubpages}
            preview={preview}
            onAddRow={handleAddRow}
          />
        )}
      </div>
    </div>
  );
};
