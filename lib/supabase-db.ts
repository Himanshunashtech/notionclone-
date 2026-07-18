import { supabase } from "./supabase";

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
    getById: "getById" as const,
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
  }
} as const;

// Custom type definitions for the api object
export type ApiType = typeof api;

export const dbQueries = {
  getSidebar: async (userId: string, args: { parentDocument?: string }) => {
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

    if (document.isPublished && !document.isArchived) {
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
  }
};

export const dbMutations = {
  create: async (userId: string, args: { title: string; parentDocument?: string }) => {
    const { data, error } = await supabase
      .from("documents")
      .insert({
        title: args.title,
        parent_document: args.parentDocument || null,
        user_id: userId,
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

  updateUserSettings: async (userId: string, args: { editorFont?: string; focusMode?: boolean }) => {
    const { data: existing, error: getError } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const updateObj: any = {};
    if (args.editorFont !== undefined) updateObj.editor_font = args.editorFont;
    if (args.focusMode !== undefined) updateObj.focus_mode = args.focusMode;

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
  }
};

export type Doc<T extends "documents" | "userSettings"> = T extends "documents" ? DocumentRow : UserSettingsRow;
export type Id<T extends "documents" | "userSettings"> = string;

