import { supabase } from "./supabase";

const REDIS_URL = "https://ultimate-wahoo-117639.upstash.io";
const REDIS_TOKEN = "gQAAAAAAAcuHAAIgcDEyY2MzYzljZjAwYTc0NjFhOTNlZmVlODcwY2RhZGI5Ng";

const redisCommand = async (command: any[]) => {
  try {
    const res = await fetch(`${REDIS_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.error("Redis command error:", err);
    return null;
  }
};

const getCache = async (userId: string, queryKey: string, args: any) => {
  if (!userId) return null;
  try {
    const version = await redisCommand(["GET", `zotion:version:${userId}`]) || "1";
    const cacheKey = `zotion:v${version}:user:${userId}:query:${queryKey}:${JSON.stringify(args || {})}`;
    const cached = await redisCommand(["GET", cacheKey]);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error("Redis getCache error:", err);
  }
  return null;
};

const setCache = async (userId: string, queryKey: string, args: any, data: any) => {
  if (!userId) return;
  try {
    const version = await redisCommand(["GET", `zotion:version:${userId}`]) || "1";
    const cacheKey = `zotion:v${version}:user:${userId}:query:${queryKey}:${JSON.stringify(args || {})}`;
    // Cache for 24 hours (86400 seconds)
    await redisCommand(["SET", cacheKey, JSON.stringify(data), "EX", "86400"]);
  } catch (err) {
    console.error("Redis setCache error:", err);
  }
};

const invalidateCache = async (userId: string) => {
  if (!userId) return;
  try {
    await redisCommand(["INCR", `zotion:version:${userId}`]);
  } catch (err) {
    console.error("Redis invalidateCache error:", err);
  }
};

export interface DocumentRow {
  _id: string;
  _creationTime: number;
  id: string;
  title: string;
  userId: string;
  isArchived: boolean;
  parentDocument?: string;
  content?: string;
  coverImage?: string;
  icon?: string;
  isPublished: boolean;
  order?: number;
  updatedAt?: number;
  isFavorite?: boolean;
  editorFont?: string;
  fullWidth?: boolean;
  smallText?: boolean;
  showToc?: boolean;
}

export interface UserSettingsRow {
  _id: string;
  id: string;
  userId: string;
  editorFont?: string;
  focusMode: boolean;
  customLandingPageId?: string;
}

export interface CalendarEventRow {
  _id: string;
  _creationTime: number;
  id: string;
  title: string;
  description?: string;
  userId: string;
  startTime: number;
  endTime: number;
  isAllDay: boolean;
  color?: string;
  meetingLink?: string;
  documentId?: string;
}

// Map database row to app model (mapping id -> _id, etc.)
const mapDocument = (row: any): DocumentRow => {
  if (!row) return row;
  return {
    ...row,
    _id: row.id,
    _creationTime: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    userId: row.user_id,
    isArchived: row.is_archived,
    parentDocument: row.parent_document || undefined,
    coverImage: row.cover_image || undefined,
    isPublished: row.is_published,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
    isFavorite: row.is_favorite,
    editorFont: row.editor_font || undefined,
    fullWidth: row.full_width,
    smallText: row.small_text,
    showToc: row.show_toc,
    content: row.content || undefined,
    icon: row.icon || undefined,
  };
};

const mapUserSettings = (row: any): UserSettingsRow => {
  if (!row) return row;
  return {
    ...row,
    _id: row.id,
    userId: row.user_id,
    editorFont: row.editor_font || undefined,
    focusMode: row.focus_mode,
    customLandingPageId: row.custom_landing_page_id || undefined,
  };
};

const mapCalendarEvent = (row: any): CalendarEventRow => {
  if (!row) return row;
  return {
    ...row,
    _id: row.id,
    _creationTime: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    userId: row.user_id,
    startTime: new Date(row.start_time).getTime(),
    endTime: new Date(row.end_time).getTime(),
    isAllDay: row.is_all_day,
    meetingLink: row.meeting_link || undefined,
    documentId: row.document_id || undefined,
  };
};

export const api = {
  documents: {
    getSidebar: "getSidebar" as const,
    create: "create" as const,
    update: "update" as const,
    archive: "archive" as const,
    getTrash: "getTrash" as const,
    restore: "restore" as const,
    remove: "remove" as const,
    getSearch: "getSearch" as const,
    searchDocuments: "searchDocuments" as const,
    getById: "getById" as const,
    getAncestors: "getAncestors" as const,
    removeIcon: "removeIcon" as const,
    removeCoverImage: "removeCoverImage" as const,
    reorder: "reorder" as const,
    removeAll: "removeAll" as const,
    toggleFavorite: "toggleFavorite" as const,
    getFavorites: "getFavorites" as const,
    getVersions: "getVersions" as const,
    createVersion: "createVersion" as const,
    restoreVersion: "restoreVersion" as const,
  },
  userSettings: {
    getUserSettings: "getUserSettings" as const,
    updateUserSettings: "updateUserSettings" as const,
    deleteUserAccount: "deleteUserAccount" as const,
  },
  calendar: {
    getEvents: "getEvents" as const,
    createEvent: "createEvent" as const,
    updateEvent: "updateEvent" as const,
    deleteEvent: "deleteEvent" as const,
  },
  activities: {
    getActivities: "getActivities" as const,
    createActivity: "createActivity" as const,
  }
} as const;

// Custom type definitions for the api object
export type ApiType = typeof api;

const rawDbQueries = {
  getSidebar: async (userId: string | null, args: { parentDocument?: string }) => {
    let isParentPublished = false;
    if (args.parentDocument) {
      const { data: parentData } = await supabase
        .from("documents")
        .select("is_published, user_id")
        .eq("id", args.parentDocument)
        .single();
      
      if (parentData && parentData.is_published) {
        isParentPublished = true;
      }
    }

    let query = supabase
      .from("documents")
      .select("*")
      .eq("is_archived", false);

    if (isParentPublished && args.parentDocument) {
      query = query.eq("parent_document", args.parentDocument);
    } else {
      if (!userId) {
        return [];
      }
      query = query.eq("user_id", userId);
      if (args.parentDocument) {
        query = query.eq("parent_document", args.parentDocument);
      } else {
        query = query.is("parent_document", null);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map(mapDocument);

    // Sort as done in Convex
    mapped.sort((a, b) => {
      if (a.order === undefined && b.order === undefined) {
        return b._creationTime - a._creationTime;
      }
      if (a.order === undefined) return -1;
      if (b.order === undefined) return 1;
      return a.order - b.order;
    });

    return mapped;
  },

  getTrash: async (userId: string) => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDocument);
  },

  getSearch: async (userId: string) => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDocument);
  },

  getById: async (userId: string | null, args: { documentId: string }) => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", args.documentId)
      .single();

    if (error) throw new Error("Document not found");

    const document = mapDocument(data);

    const isPubliclyAccessible = await (async () => {
      if (data.is_published && !data.is_archived) return true;
      let current = data;
      while (current.parent_document) {
        const { data: parent } = await supabase
          .from("documents")
          .select("is_published, parent_document, is_archived")
          .eq("id", current.parent_document)
          .single();
        if (!parent || parent.is_archived) break;
        if (parent.is_published) return true;
        current = parent;
      }
      return false;
    })();

    if (isPubliclyAccessible && !document.isArchived) {
      return document;
    }

    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (document.userId !== userId) {
      throw new Error("Not authorized");
    }

    return document;
  },

  getAncestors: async (userId: string | null, args: { documentId: string }) => {
    if (!args.documentId) return [];

    const { data: currentDoc, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", args.documentId)
      .single();

    if (error || !currentDoc) return [];

    const path: DocumentRow[] = [];
    let current = currentDoc;

    for (let i = 0; i < 10; i++) {
      const doc = mapDocument(current);
      
      const isPublic = doc.isPublished && !doc.isArchived;
      const isAuthorized = userId && doc.userId === userId;
      if (!isPublic && !isAuthorized) {
        break;
      }

      path.unshift(doc);

      if (!current.parent_document) break;

      const { data: parentDoc, error: parentError } = await supabase
        .from("documents")
        .select("*")
        .eq("id", current.parent_document)
        .single();

      if (parentError || !parentDoc) break;
      current = parentDoc;
    }

    return path;
  },

  getFavorites: async (userId: string) => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .eq("is_favorite", true)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDocument);
  },

  getUserSettings: async (userId: string) => {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return mapUserSettings(data);
  },

  getVersions: async (userId: string, args: { documentId: string }) => {
    const { data, error } = await supabase
      .from("document_versions")
      .select("*")
      .eq("document_id", args.documentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getActivities: async (userId: string, args: { documentId: string }) => {
    const { data, error } = await supabase
      .from("page_activities")
      .select("*")
      .eq("document_id", args.documentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      ...row,
      _id: row.id,
      _creationTime: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      documentId: row.document_id,
      userId: row.user_id,
    }));
  },

  getEvents: async (userId: string) => {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .order("start_time", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapCalendarEvent);
  },

  searchDocuments: async (userId: string, args: { query: string }) => {
    if (!args.query) return [];
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .ilike("title", `%${args.query}%`);
    if (error) throw error;
    return (data || []).map(mapDocument);
  }
};
const rawDbMutations = {
  create: async (userId: string | null, args: { title: string; parentDocument?: string; content?: string }) => {
    let finalUserId = userId;
    if (!finalUserId && args.parentDocument) {
      const { data: parent } = await supabase
        .from("documents")
        .select("user_id")
        .eq("id", args.parentDocument)
        .single();
      if (parent) {
        finalUserId = parent.user_id;
      }
    }

    if (!finalUserId) {
      throw new Error("User ID is required to create a document");
    }

    const { data, error } = await supabase
      .from("documents")
      .insert({
        title: args.title,
        parent_document: args.parentDocument || null,
        user_id: finalUserId,
        content: args.content || null,
        full_width: true,
        show_toc: true,
        is_archived: false,
        is_published: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  archive: async (userId: string, args: { id: string }) => {
    // 1. Get the document to make sure user owns it
    const { data: doc, error: getError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", args.id)
      .single();

    if (getError || !doc) throw new Error("Document not found");
    if (doc.user_id !== userId) throw new Error("Not authorized");

    // Recursive archiving helper
    const recursiveArchive = async (docId: string) => {
      const { data: children } = await supabase
        .from("documents")
        .select("id")
        .eq("user_id", userId)
        .eq("parent_document", docId);

      if (children && children.length > 0) {
        for (const child of children) {
          await supabase
            .from("documents")
            .update({ is_archived: true })
            .eq("id", child.id);
          
          await recursiveArchive(child.id);
        }
      }
    };

    // 2. Perform main update
    const { data, error } = await supabase
      .from("documents")
      .update({ is_archived: true })
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw error;

    await recursiveArchive(args.id);

    return mapDocument(data);
  },

  restore: async (userId: string, args: { id: string }) => {
    const { data: doc, error: getError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", args.id)
      .single();

    if (getError || !doc) throw new Error("Document not found");
    if (doc.user_id !== userId) throw new Error("Not authorized");

    const recursiveRestore = async (docId: string) => {
      const { data: children } = await supabase
        .from("documents")
        .select("id")
        .eq("user_id", userId)
        .eq("parent_document", docId);

      if (children && children.length > 0) {
        for (const child of children) {
          await supabase
            .from("documents")
            .update({ is_archived: false })
            .eq("id", child.id);
          
          await recursiveRestore(child.id);
        }
      }
    };

    const updateData: any = { is_archived: false };

    // If parent is archived, set parent_document to null
    if (doc.parent_document) {
      const { data: parent } = await supabase
        .from("documents")
        .select("is_archived")
        .eq("id", doc.parent_document)
        .single();
      
      if (parent?.is_archived) {
        updateData.parent_document = null;
      }
    }

    const { data, error } = await supabase
      .from("documents")
      .update(updateData)
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw error;

    await recursiveRestore(args.id);

    return mapDocument(data);
  },

  remove: async (userId: string, args: { id: string }) => {
    const { data: doc, error: getError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", args.id)
      .single();

    if (getError || !doc) throw new Error("Document not found");
    if (doc.user_id !== userId) throw new Error("Not authorized");

    const { data, error } = await supabase
      .from("documents")
      .delete()
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw error;
    return mapDocument(data);
  },

  update: async (userId: string, args: {
    id: string;
    title?: string;
    content?: string;
    coverImage?: string | null;
    icon?: string | null;
    isPublished?: boolean;
    editorFont?: string;
    fullWidth?: boolean;
    smallText?: boolean;
    showToc?: boolean;
    parentDocument?: string | null;
  }) => {
    const { data: doc, error: getError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", args.id)
      .single();

    if (getError || !doc) throw new Error("Document not found");
    if (doc.user_id !== userId) throw new Error("Not authorized");

    const { id, ...rest } = args;

    // Convert snake case fields
    const updateObj: any = { ...rest, updated_at: new Date().toISOString() };
    if (rest.coverImage !== undefined) {
      updateObj.cover_image = rest.coverImage;
      delete updateObj.coverImage;
    }
    if (rest.isPublished !== undefined) {
      updateObj.is_published = rest.isPublished;
      delete updateObj.isPublished;
    }
    if (rest.editorFont !== undefined) {
      updateObj.editor_font = rest.editorFont;
      delete updateObj.editorFont;
    }
    if (rest.fullWidth !== undefined) {
      updateObj.full_width = rest.fullWidth;
      delete updateObj.fullWidth;
    }
    if (rest.smallText !== undefined) {
      updateObj.small_text = rest.smallText;
      delete updateObj.smallText;
    }
    if (rest.showToc !== undefined) {
      updateObj.show_toc = rest.showToc;
      delete updateObj.showToc;
    }
    if (rest.parentDocument !== undefined) {
      updateObj.parent_document = rest.parentDocument;
      delete updateObj.parentDocument;
    }

    const { data, error } = await supabase
      .from("documents")
      .update(updateObj)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapDocument(data);
  },

  removeIcon: async (userId: string, args: { id: string }) => {
    const { data, error } = await supabase
      .from("documents")
      .update({ icon: null, updated_at: new Date().toISOString() })
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw error;
    return mapDocument(data);
  },

  removeCoverImage: async (userId: string, args: { id: string }) => {
    const { data, error } = await supabase
      .from("documents")
      .update({ cover_image: null, updated_at: new Date().toISOString() })
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw error;
    return mapDocument(data);
  },

  reorder: async (userId: string, args: { id: string; parentDocument?: string; newOrder: number }) => {
    let query = supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false);

    if (args.parentDocument) {
      query = query.eq("parent_document", args.parentDocument);
    } else {
      query = query.is("parent_document", null);
    }

    const { data: siblings, error } = await query;
    if (error) throw error;

    const mapped = (siblings || []).map(mapDocument);

    mapped.sort((a, b) => {
      if (a.order === undefined && b.order === undefined) return 0;
      if (a.order === undefined) return -1;
      if (b.order === undefined) return 1;
      return a.order - b.order;
    });

    const itemIndex = mapped.findIndex((item) => item._id === args.id);
    if (itemIndex > -1) {
      const [movedItem] = mapped.splice(itemIndex, 1);
      mapped.splice(args.newOrder, 0, movedItem);

      await Promise.all(
        mapped.map((sibling, index) =>
          supabase
            .from("documents")
            .update({ order: index })
            .eq("id", sibling._id)
        )
      );
    }

    return true;
  },

  removeAll: async (userId: string) => {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("user_id", userId)
      .eq("is_archived", true);

    if (error) throw error;
    return true;
  },

  toggleFavorite: async (userId: string, args: { id: string }) => {
    const { data: doc, error: getError } = await supabase
      .from("documents")
      .select("is_favorite")
      .eq("id", args.id)
      .single();

    if (getError || !doc) throw new Error("Document not found");

    const { data, error } = await supabase
      .from("documents")
      .update({ is_favorite: !doc.is_favorite })
      .eq("id", args.id)
      .select()
      .single();

    if (error) throw error;
    return mapDocument(data);
  },

  updateUserSettings: async (userId: string, args: { editorFont?: string; focusMode?: boolean; customLandingPageId?: string | null }) => {
    const { data: existing, error: getError } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const updateObj: any = {};
    if (args.editorFont !== undefined) updateObj.editor_font = args.editorFont;
    if (args.focusMode !== undefined) updateObj.focus_mode = args.focusMode;
    if (args.customLandingPageId !== undefined) updateObj.custom_landing_page_id = args.customLandingPageId;

    if (existing) {
      const { error } = await supabase
        .from("user_settings")
        .update(updateObj)
        .eq("user_id", userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("user_settings")
        .insert({
          user_id: userId,
          editor_font: args.editorFont || "default",
          focus_mode: args.focusMode || false,
          custom_landing_page_id: args.customLandingPageId || null,
        });
      if (error) throw error;
    }
  },

  createVersion: async (userId: string, args: { documentId: string; title: string; content?: string; label?: string }) => {
    let contentToSave = args.content || "";

    // Check if the document is a database and serialize rows too
    if (contentToSave) {
      try {
        const parsed = JSON.parse(contentToSave);
        if (parsed && parsed.type === "database") {
          // Fetch all current child subpages (rows) of the database
          const { data: rows } = await supabase
            .from("documents")
            .select("id, title, content, icon, cover_image, order")
            .eq("parent_document", args.documentId)
            .eq("user_id", userId)
            .eq("is_archived", false);

          const snapshot = {
            snapshotType: "database_with_rows",
            parentContent: contentToSave,
            rows: (rows || []).map((r) => ({
              id: r.id,
              title: r.title,
              content: r.content,
              icon: r.icon,
              coverImage: r.cover_image,
              order: r.order,
            })),
          };
          contentToSave = JSON.stringify(snapshot);
        }
      } catch {}
    }

    const { data, error } = await supabase
      .from("document_versions")
      .insert({
        document_id: args.documentId,
        title: args.title,
        content: contentToSave,
        label: args.label || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  restoreVersion: async (userId: string, args: { documentId: string; title: string; content?: string }) => {
    // 1. Check if it's a database snapshot
    let isDbSnapshot = false;
    let snapshotData: any = null;

    if (args.content) {
      try {
        const parsed = JSON.parse(args.content);
        if (parsed && parsed.snapshotType === "database_with_rows") {
          isDbSnapshot = true;
          snapshotData = parsed;
        }
      } catch {}
    }

    if (isDbSnapshot && snapshotData) {
      // 2. Restore parent database
      const { data: parentDoc, error: parentError } = await supabase
        .from("documents")
        .update({
          title: args.title,
          content: snapshotData.parentContent || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", args.documentId)
        .eq("user_id", userId)
        .select()
        .single();

      if (parentError) throw parentError;

      // 3. Get all current rows
      const { data: currentRows } = await supabase
        .from("documents")
        .select("id")
        .eq("parent_document", args.documentId)
        .eq("user_id", userId);

      const currentIds = new Set((currentRows || []).map((r) => r.id));
      const snapshotIds = new Set(snapshotData.rows.map((r: any) => r.id));

      // 4. Restore/Create rows in snapshot
      for (const row of snapshotData.rows) {
        if (currentIds.has(row.id)) {
          // Update existing row
          await supabase
            .from("documents")
            .update({
              title: row.title,
              content: row.content || null,
              icon: row.icon || null,
              cover_image: row.coverImage || null,
              order: row.order !== undefined ? row.order : null,
              is_archived: false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", row.id)
            .eq("user_id", userId);
        } else {
          // Create deleted row back
          await supabase
            .from("documents")
            .insert({
              id: row.id,
              title: row.title,
              content: row.content || null,
              icon: row.icon || null,
              cover_image: row.coverImage || null,
              order: row.order !== undefined ? row.order : null,
              parent_document: args.documentId,
              user_id: userId,
              is_archived: false,
            });
        }
      }

      // 5. Archive rows that are not in the snapshot
      const toArchive = (currentRows || []).filter((r) => !snapshotIds.has(r.id));
      for (const row of toArchive) {
        await supabase
          .from("documents")
          .update({ is_archived: true })
          .eq("id", row.id)
          .eq("user_id", userId);
      }

      return parentDoc.id;
    } else {
      // Normal page restore
      const { data, error } = await supabase
        .from("documents")
        .update({
          title: args.title,
          content: args.content || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", args.documentId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data.id;
    }
  },

  createEvent: async (userId: string, args: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    isAllDay?: boolean;
    color?: string;
    meetingLink?: string;
    documentId?: string;
  }) => {
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        title: args.title,
        description: args.description || null,
        user_id: userId,
        start_time: args.startTime,
        end_time: args.endTime,
        is_all_day: args.isAllDay || false,
        color: args.color || null,
        meeting_link: args.meetingLink || null,
        document_id: args.documentId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return mapCalendarEvent(data);
  },

  updateEvent: async (userId: string, args: {
    id: string;
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    isAllDay?: boolean;
    color?: string;
    meetingLink?: string;
    documentId?: string;
  }) => {
    const updateData: Record<string, any> = {};
    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined) updateData.description = args.description || null;
    if (args.startTime !== undefined) updateData.start_time = args.startTime;
    if (args.endTime !== undefined) updateData.end_time = args.endTime;
    if (args.isAllDay !== undefined) updateData.is_all_day = args.isAllDay;
    if (args.color !== undefined) updateData.color = args.color || null;
    if (args.meetingLink !== undefined) updateData.meeting_link = args.meetingLink || null;
    if (args.documentId !== undefined) updateData.document_id = args.documentId || null;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("calendar_events")
      .update(updateData)
      .eq("id", args.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return mapCalendarEvent(data);
  },

  createActivity: async (userId: string, args: {
    documentId: string;
    action: string;
    target: string;
    context?: string;
    icon?: string;
  }) => {
    const { data, error } = await supabase
      .from("page_activities")
      .insert({
        document_id: args.documentId,
        user_id: userId,
        action: args.action,
        target: args.target,
        context: args.context || null,
        icon: args.icon || null,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      _id: data.id,
      _creationTime: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      documentId: data.document_id,
      userId: data.user_id,
    };
  },

  deleteEvent: async (userId: string, args: { id: string }) => {
    const { data, error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", args.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  deleteUserAccount: async (userId: string) => {
    const { error } = await supabase.rpc("delete_user_account");
    if (error) throw error;
    return true;
  }
};

const cacheScopedQueries = ["getSidebar", "getFavorites"];

const wrapQueries = () => {
  const wrapped: any = {};
  for (const [key, fn] of Object.entries(rawDbQueries)) {
    if (cacheScopedQueries.includes(key)) {
      wrapped[key] = async (userId: string, args: any) => {
        if (!userId) return await (fn as any)(userId, args);
        const cached = await getCache(userId, key, args);
        if (cached !== null) {
          return cached;
        }
        const data = await (fn as any)(userId, args);
        await setCache(userId, key, args, data);
        return data;
      };
    } else {
      wrapped[key] = fn;
    }
  }
  return wrapped;
};

const wrapMutations = () => {
  const wrapped: any = {};
  for (const [key, fn] of Object.entries(rawDbMutations)) {
    wrapped[key] = async (userId: string, args: any) => {
      const result = await (fn as any)(userId, args);
      if (userId) {
        console.log(`[Cache Invalidation] Triggered by ${key}`);
        await invalidateCache(userId);
      }
      return result;
    };
  }
  return wrapped;
};

export const dbQueries = wrapQueries() as typeof rawDbQueries;
export const dbMutations = wrapMutations() as typeof rawDbMutations;

export type Doc<T extends "documents" | "userSettings"> = T extends "documents" ? DocumentRow : UserSettingsRow;
export type Id<T extends "documents" | "userSettings"> = string;

