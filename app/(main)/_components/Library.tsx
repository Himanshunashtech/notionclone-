"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@/hooks/use-supabase-db";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/supabase-db";
import { Id } from "@/lib/supabase-db";
import { Item } from "./Item";
import { 
  Clock, 
  Star, 
  Globe, 
  Target, 
  ChevronDown, 
  ChevronRight,
  FileIcon,
  Library as LibraryIcon
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LibraryProps {
  navDrawer?: boolean;
}

export const Library = ({ navDrawer }: LibraryProps) => {
  const params = useParams();
  const router = useRouter();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [sections, setSections] = useState({
    recent: false,
    favorites: false,
    published: false,
    projects: false,
  });

  const allDocs = useQuery(api.documents.getSearch);
  const rootDocs = useQuery(api.documents.getSidebar, {});
  const toggleFavorite = useMutation(api.documents.toggleFavorite);

  const onToggleFavorite = (id: Id<"documents">) => {
    const promise = toggleFavorite({ id });
    toast.promise(promise, {
      loading: "Updating favorites...",
      success: "Favorites updated!",
      error: "Failed to update favorites.",
    });
  };

  const toggleSection = (section: keyof typeof sections) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (allDocs === undefined) {
    return (
      <div className="space-y-2 px-3 py-2">
        <Item.Skeleton level={0} />
        <Item.Skeleton level={0} />
      </div>
    );
  }

  // Filter lists
  const recentDocs = [...allDocs]
    .sort((a, b) => (b.updatedAt || b._creationTime) - (a.updatedAt || a._creationTime))
    .slice(0, 5);

  const favoriteDocs = allDocs.filter((d) => d.isFavorite);
  const publishedDocs = allDocs.filter((d) => d.isPublished);
  
  const projectsDb = rootDocs?.find((d) => d.title === "Projects");
  const projectDocs = projectsDb 
    ? allDocs.filter((d) => d.parentDocument === projectsDb._id)
    : [];

  const sectionData = [
    {
      id: "recent" as const,
      label: "Recent",
      icon: Clock,
      docs: recentDocs,
      emptyMessage: "No recent pages",
    },
    {
      id: "favorites" as const,
      label: "Favorites",
      icon: Star,
      docs: favoriteDocs,
      emptyMessage: "No favorited pages",
    },
    {
      id: "published" as const,
      label: "Published",
      icon: Globe,
      docs: publishedDocs,
      emptyMessage: "No published pages",
    },
    {
      id: "projects" as const,
      label: "Projects",
      icon: Target,
      docs: projectDocs,
      emptyMessage: "No project pages",
    },
  ];

  return (
    <div className="mt-4">
      {/* Library Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        className="flex items-center gap-x-1 px-3 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md mx-2 select-none group cursor-pointer text-muted-foreground/60 text-xs font-bold"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0" />
        )}
        <LibraryIcon className="h-3.5 w-3.5 text-blue-500 mr-1 shrink-0" />
        <span className="uppercase tracking-wider">Library</span>
      </div>

      {isExpanded && (
        <div className="mt-1 space-y-[2px] pl-2">
          {sectionData.map((sec) => {
            const isSecExpanded = sections[sec.id];
            const SectionIcon = sec.icon;

            return (
              <div key={sec.id} className="space-y-[1px]">
                {/* Section Item */}
                <div
                  onClick={() => toggleSection(sec.id)}
                  role="button"
                  className={cn(
                    "flex items-center justify-between px-3 py-1 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 rounded-sm mx-1 select-none text-[11px] font-medium text-neutral-600 dark:text-neutral-400 cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-x-2">
                    {isSecExpanded ? (
                      <ChevronDown className="h-3 w-3 shrink-0 text-neutral-400" />
                    ) : (
                      <ChevronRight className="h-3 w-3 shrink-0 text-neutral-400" />
                    )}
                    <SectionIcon className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                    <span>{sec.label}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 bg-neutral-200/50 dark:bg-neutral-800 px-1.5 py-0.2 rounded-full">
                    {sec.docs.length}
                  </span>
                </div>

                {/* Sub-documents list */}
                {isSecExpanded && (
                  <div className="pl-6 space-y-[1px]">
                    {sec.docs.length === 0 ? (
                      <div className="text-[10px] text-muted-foreground/60 py-1 pl-3 select-none">
                        {sec.emptyMessage}
                      </div>
                    ) : (
                      sec.docs.map((doc) => (
                        <Item
                          key={doc._id}
                          id={doc._id}
                          onClick={() => router.push(`/documents/${doc._id}`)}
                          label={doc.title}
                          icon={FileIcon}
                          documentIcon={doc.icon}
                          active={params.documentId === doc._id}
                          level={0}
                          isFavorite={doc.isFavorite}
                          onFavorite={() => onToggleFavorite(doc._id)}
                          showDragHandle={false}
                          navDrawer={navDrawer}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
