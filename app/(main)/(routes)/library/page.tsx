"use client";

import { useState, useMemo, useEffect } from "react";
import { useTheme } from "next-themes";
import { useQuery, useMutation } from "@/hooks/use-supabase-db";
import { useRouter } from "next/navigation";
import { api } from "@/lib/supabase-db";
import { useUser } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Clock, 
  Star, 
  Globe, 
  Lock, 
  Bot, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  FileIcon,
  ChevronRight,
  ExternalLink,
  Trash
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "recents" | "favorites" | "shared" | "private" | "meetings";

export default function LibraryPage() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const defaultFavicon = resolvedTheme === "dark" ? "/logo-dark.svg" : "/logo.svg";
    const libraryFavicon = resolvedTheme === "dark" ? "/library-dark.svg" : "/library.svg";

    window.document.title = "Library | Zotion";

    const link = window.document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = libraryFavicon;
    }

    return () => {
      window.document.title = "Zotion";
      if (link) {
        link.href = defaultFavicon;
      }
    };
  }, [resolvedTheme]);

  const [activeTab, setActiveTab] = useState<TabType>("recents");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "edited" | "created">("edited");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allDocs = useQuery(api.documents.getSearch);
  const create = useMutation(api.documents.create);
  const archive = useMutation(api.documents.archive);

  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab]);

  const onCreatePage = () => {
    const promise = create({ title: "Untitled" }).then((documentId) =>
      router.push(`/documents/${documentId}`)
    );

    toast.promise(promise, {
      loading: "Creating a new page...",
      success: "New page created!",
      error: "Failed to create page."
    });
  };

  const onDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const ok = window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected pages?`);
    if (!ok) return;

    const promises = selectedIds.map((id) => archive({ id }));

    toast.promise(Promise.all(promises), {
      loading: "Deleting selected pages...",
      success: "Selected pages deleted successfully!",
      error: "Failed to delete some pages."
    });

    setSelectedIds([]);
  };

  const formatRelativeTime = (timestamp?: number) => {
    if (!timestamp) return "—";
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const filteredAndSortedDocs = useMemo(() => {
    if (!allDocs) return [];

    // 1. Filter by Tab
    let docs = [...allDocs];
    if (activeTab === "favorites") {
      docs = docs.filter((d) => d.isFavorite);
    } else if (activeTab === "shared") {
      docs = docs.filter((d) => d.isPublished);
    } else if (activeTab === "private") {
      docs = docs.filter((d) => !d.isPublished);
    } else if (activeTab === "meetings") {
      // Pages nested under a parent named "Meetings" or containing meeting tags
      docs = docs.filter((d) => {
        const isMeeting = d.title?.toLowerCase().includes("meeting") || d.content?.toLowerCase().includes("transcription");
        return isMeeting;
      });
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.content?.toLowerCase().includes(q)
      );
    }

    // 3. Sort
    docs.sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (sortBy === "title") {
        valA = a.title || "";
        valB = b.title || "";
      } else if (sortBy === "edited") {
        valA = a.updatedAt || a._creationTime;
        valB = b.updatedAt || b._creationTime;
      } else if (sortBy === "created") {
        valA = a._creationTime;
        valB = b._creationTime;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return docs;
  }, [allDocs, activeTab, searchQuery, sortBy, sortOrder]);

  if (allDocs === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl px-8">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-md w-1/4"></div>
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-md w-full"></div>
          <div className="h-40 bg-neutral-200 dark:bg-neutral-800 rounded-md w-full"></div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "recents" as const, label: "Recents", icon: Clock },
    { id: "favorites" as const, label: "Favorites", icon: Star },
    { id: "shared" as const, label: "Shared", icon: Globe },
    { id: "private" as const, label: "Private", icon: Lock },
    { id: "meetings" as const, label: "AI Meeting Notes", icon: Bot },
  ];

  const toggleSort = (field: "title" | "edited" | "created") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="h-full bg-background dark:bg-dark overflow-y-auto px-4 py-6 md:px-10 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Library
        </h1>
        <div className="flex items-center gap-x-2">
          {selectedIds.length > 0 && (
            <Button
              onClick={onDeleteSelected}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-md px-3 py-1.5 md:px-4 md:py-2 font-medium flex items-center gap-x-2 text-xs md:text-sm shadow-xs transition"
            >
              <Trash className="h-4 w-4" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button 
            onClick={onCreatePage}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 md:px-4 md:py-2 font-medium flex items-center gap-x-2 text-xs md:text-sm shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            New page
          </Button>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-6">
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-x-1.5 md:gap-x-2 px-2.5 py-1.2 md:px-3 md:py-1.5 text-xs font-semibold rounded-md transition select-none cursor-pointer",
                  isActive
                    ? "bg-neutral-250 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
                )}
              >
                <TabIcon className={cn("h-3.5 w-3.5", isActive ? "text-blue-500" : "text-neutral-500")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search, Filter, Sort Controls */}
        <div className="flex items-center gap-x-2 w-full md:w-auto justify-between md:justify-end">
          {/* Search Box */}
          <div className="relative flex-1 md:flex-none w-full md:w-48 lg:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md outline-hidden focus:ring-1 focus:ring-blue-500 text-neutral-700 dark:text-neutral-300"
            />
          </div>

          <button 
            onClick={() => toggleSort("edited")}
            title="Sort by edited time"
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition shrink-0"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-card/30">
        <div className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 bg-neutral-50/50 dark:bg-neutral-900/30 px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider select-none items-center">
            <div className="col-span-5 flex items-center gap-x-3">
              <input
                type="checkbox"
                checked={filteredAndSortedDocs.length > 0 && selectedIds.length === filteredAndSortedDocs.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(filteredAndSortedDocs.map((d) => d._id));
                  } else {
                    setSelectedIds([]);
                  }
                }}
                className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              />
              <FileIcon className="h-3.5 w-3.5 text-neutral-400" />
              <span>Page name</span>
            </div>
            <div className="col-span-2">Created by</div>
            <div className="col-span-1">Source</div>
            <div className="col-span-2">Last edited time</div>
            <div className="col-span-2">Last visited time</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-neutral-100 dark:divide-neutral-850">
            {filteredAndSortedDocs.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No pages found matching this section
              </div>
            ) : (
              filteredAndSortedDocs.map((doc) => {
                const authorName = user?.fullName || "Sonu";
                const isDocPublished = doc.isPublished;

                return (
                  <div 
                    key={doc._id}
                    onClick={() => router.push(`/documents/${doc._id}`)}
                    className="flex flex-col md:grid md:grid-cols-12 px-4 md:px-6 py-3.5 items-start md:items-center hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30 transition cursor-pointer group text-sm text-neutral-700 dark:text-neutral-300 gap-y-2 md:gap-y-0"
                  >
                    {/* Page name */}
                    <div className="w-full md:col-span-5 flex items-center justify-between pr-0 md:pr-4">
                      <div className="flex items-center gap-x-2.5 truncate font-medium">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(doc._id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds((prev) => [...prev, doc._id]);
                            } else {
                              setSelectedIds((prev) => prev.filter((id) => id !== doc._id));
                            }
                          }}
                          className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-1 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        {doc.icon ? (
                          <span className="text-base select-none shrink-0">{doc.icon}</span>
                        ) : (
                          <FileIcon className="h-4 w-4 text-neutral-400 shrink-0" />
                        )}
                        <span className="truncate">{doc.title || "Untitled"}</span>
                      </div>
                      
                      {/* OPEN Hover Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/documents/${doc._id}`);
                        }}
                        className="opacity-0 group-hover:opacity-100 md:flex hidden items-center gap-x-1 text-[10px] uppercase font-bold text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/40 px-2 py-0.5 rounded transition"
                      >
                        <span>OPEN</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </button>
                    </div>

                    {/* Mobile Metadata Row */}
                    <div className="flex md:hidden items-center gap-x-2.5 text-xs text-neutral-500 flex-wrap">
                      <div className="flex items-center gap-x-1.5 truncate">
                        <div className="h-4.5 w-4.5 rounded-full bg-neutral-200 dark:bg-neutral-700 font-bold flex items-center justify-center select-none text-[8px] text-neutral-600 dark:text-neutral-400 shrink-0">
                          {authorName.substring(0, 1).toUpperCase()}
                        </div>
                        <span className="truncate text-neutral-600 dark:text-neutral-450">{authorName}</span>
                      </div>
                      <span className="text-neutral-300 dark:text-neutral-800">•</span>
                      <div className="flex items-center gap-x-1">
                        {isDocPublished ? (
                          <Globe className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Lock className="h-3 w-3 text-neutral-400" />
                        )}
                        <span>{isDocPublished ? "Public" : "Private"}</span>
                      </div>
                      <span className="text-neutral-300 dark:text-neutral-800">•</span>
                      <span>{formatRelativeTime(doc.updatedAt || doc._creationTime)}</span>
                    </div>

                    {/* Created by */}
                    <div className="hidden md:flex md:col-span-2 items-center gap-x-2 truncate">
                      <div className="h-5 w-5 rounded-full bg-neutral-200 dark:bg-neutral-700 font-bold flex items-center justify-center select-none text-[9px] text-neutral-600 dark:text-neutral-400 shrink-0">
                        {authorName.substring(0, 1).toUpperCase()}
                      </div>
                      <span className="truncate text-xs text-neutral-600 dark:text-neutral-400">{authorName}</span>
                    </div>

                    {/* Source */}
                    <div className="hidden md:flex md:col-span-1 items-center gap-x-1.5 text-xs text-neutral-500">
                      {isDocPublished ? (
                        <>
                          <Globe className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-500 font-medium">Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5 text-neutral-400" />
                          <span>Private</span>
                        </>
                      )}
                    </div>

                    {/* Last edited time */}
                    <div className="hidden md:block md:col-span-2 text-xs text-neutral-500">
                      {formatRelativeTime(doc.updatedAt || doc._creationTime)}
                    </div>

                    {/* Last visited time */}
                    <div className="hidden md:block md:col-span-2 text-xs text-neutral-500">
                      {formatRelativeTime(doc.updatedAt)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
