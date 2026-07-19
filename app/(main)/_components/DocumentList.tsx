"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@/hooks/use-supabase-db";
import { useParams, useRouter } from "next/navigation";

import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

import { api } from "@/lib/supabase-db";
import { Doc, Id } from "@/lib/supabase-db";

import { Item } from "./Item";

import { FileIcon } from "lucide-react";
import { toast } from "sonner";

interface SortableItemProps {
  document: Doc<"documents">;
  level: number;
  onExpand: (id: string) => void;
  expanded: boolean;
  onRedirect: (id: string) => void;
  activeId?: string | string[];
  isFavorite?: boolean;
  onFavorite?: (id: Id<"documents">) => void;
  navDrawer?: boolean;
}
interface DocumentListProps {
  parentDocumentId?: Id<"documents">;
  level?: number;
  data?: Doc<"documents">[];
  navDrawer?: boolean;
  excludeIds?: string[];
}

const SortableItem = ({
  document,
  level,
  onExpand,
  expanded,
  onRedirect,
  activeId,
  onFavorite,
  navDrawer,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: document._id });

  const style = {
    transform: CSS.Transform.toString(
      transform ? { ...transform, scaleY: 1, scaleX: 1 } : null,
    ),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
    cursor: isDragging ? "grabbing" : "pointer",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Item
        id={document._id}
        onClick={() => onRedirect(document._id)}
        label={document.title}
        icon={FileIcon}
        documentIcon={document.icon}
        active={activeId === document._id}
        level={level}
        onExpand={() => onExpand(document._id)}
        expanded={expanded}
        isFavorite={document.isFavorite}
        onFavorite={() => onFavorite?.(document._id)}
        navDrawer={navDrawer}
      />
      {expanded && (
        <DocumentList
          parentDocumentId={document._id}
          level={level + 1}
          navDrawer={navDrawer}
        />
      )}
    </div>
  );
};

export const DocumentList = ({
  parentDocumentId,
  level = 0,
  navDrawer,
  excludeIds,
}: DocumentListProps) => {
  const params = useParams();
  const router = useRouter();

  const reorder = useMutation(api.documents.reorder);
  const toggleFavorite = useMutation(api.documents.toggleFavorite);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("zotion-sidebar-expanded");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [orderedDocuments, setOrderedDocuments] = useState<Doc<"documents">[]>(
    [],
  );

  const documents = useQuery(api.documents.getSidebar, {
    parentDocument: parentDocumentId,
  });

  const activeDocument = useQuery(
    api.documents.getById,
    params.documentId ? { documentId: params.documentId as string } : "skip",
  );

  useEffect(() => {
    if (activeDocument && activeDocument.parentDocument) {
      setExpanded((prevExpanded) => {
        if (prevExpanded[activeDocument.parentDocument!]) {
          return prevExpanded;
        }
        const next = {
          ...prevExpanded,
          [activeDocument.parentDocument!]: true,
        };
        try {
          localStorage.setItem("zotion-sidebar-expanded", JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
    }
  }, [activeDocument]);

  const TEAMSPACE_TITLES = ["Projects", "Meetings", "Docs", "Tasks", "Brainstorming Session", "Goals"];
  const [localTeamspaceIds, setLocalTeamspaceIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("teamspaceIds");
      if (stored) {
        setLocalTeamspaceIds(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Prefer prop-provided excludeIds, fall back to locally read teamspaceIds
  const effectiveExcludeIds = excludeIds ?? localTeamspaceIds;

  useEffect(() => {
    if (isDragging) {
      return;
    }
    if (documents) {
      if (!parentDocumentId) {
        setOrderedDocuments(documents.filter((d) => !TEAMSPACE_TITLES.includes(d.title) && !effectiveExcludeIds.includes(d._id)));
      } else if (effectiveExcludeIds.includes(parentDocumentId)) {
        const order = ["Projects", "Meetings", "Docs", "Tasks", "Brainstorming Session", "Goals"];
        const sorted = [...documents].sort((a, b) => {
          const idxA = order.indexOf(a.title);
          const idxB = order.indexOf(b.title);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.title.localeCompare(b.title);
        });
        setOrderedDocuments(sorted);
      } else {
        setOrderedDocuments(documents);
      }
    }
  }, [documents, parentDocumentId, isDragging, effectiveExcludeIds]);

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);

    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = orderedDocuments.findIndex(
        (doc) => doc._id === active.id,
      );
      const newIndex = orderedDocuments.findIndex((doc) => doc._id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setOrderedDocuments((prev) => arrayMove(prev, oldIndex, newIndex));
        reorder({
          id: active.id as Id<"documents">,
          parentDocument: parentDocumentId,
          newOrder: newIndex,
        });
      }
    }
  };

  const onToggleFavorite = (id: Id<"documents">) => {
    const promise = toggleFavorite({ id });
    toast.promise(promise, {
      loading: "Updating favorites...",
      success: "Favorites updated!",
      error: "Failed to update favorites.",
    });
  };

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  if (documents === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  return (
    <div className="w-full">
      {orderedDocuments.length === 0 && level !== 0 && (
        <p
          style={{ paddingLeft: level ? `${level * 12 + 25}px` : undefined }}
          className="text-muted-foreground/80 py-1 text-sm font-medium"
        >
          No pages inside
        </p>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={() => {
          setIsDragging(true);
          document.body.classList.add("cursor-grabbing");
        }}
        onDragEnd={(event) => {
          document.body.classList.remove("cursor-grabbing");
          handleDragEnd(event);
        }}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        collisionDetection={closestCorners}
      >
        <SortableContext
          items={orderedDocuments.map((doc) => doc._id)}
          strategy={verticalListSortingStrategy}
        >
          {orderedDocuments.map((document) => (
            <SortableItem
              key={document._id}
              document={document}
              level={level}
              onExpand={onExpand}
              expanded={expanded[document._id]}
              onRedirect={onRedirect}
              activeId={params.documentId}
              isFavorite={document.isFavorite}
              onFavorite={onToggleFavorite}
              navDrawer={navDrawer}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
