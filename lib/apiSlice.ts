import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { dbQueries, dbMutations } from "./supabase-db";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Documents", "Sidebar", "Favorites"],
  endpoints: (builder) => ({
    getSidebar: builder.query<any[], { userId: string; parentDocument?: string }>({
      queryFn: async ({ userId, parentDocument }) => {
        try {
          const data = await dbQueries.getSidebar(userId, { parentDocument });
          return { data };
        } catch (error: any) {
          return { error: error.message || "Failed to fetch sidebar" };
        }
      },
      providesTags: (result, error, arg) => [{ type: "Sidebar" as const, id: arg.parentDocument || "root" }],
    }),
    getFavorites: builder.query<any[], { userId: string }>({
      queryFn: async ({ userId }) => {
        try {
          const data = await dbQueries.getFavorites(userId);
          return { data };
        } catch (error: any) {
          return { error: error.message || "Failed to fetch favorites" };
        }
      },
      providesTags: ["Favorites"],
    }),
    searchDocuments: builder.query<any[], { userId: string; query: string }>({
      queryFn: async ({ userId, query }) => {
        try {
          const data = await dbQueries.searchDocuments(userId, { query });
          return { data };
        } catch (error: any) {
          return { error: error.message || "Failed to search documents" };
        }
      },
    }),
    createDocument: builder.mutation<string, { userId: string; title: string; parentDocument?: string }>({
      queryFn: async ({ userId, title, parentDocument }) => {
        try {
          const data = await dbMutations.create(userId, { title, parentDocument });
          return { data };
        } catch (error: any) {
          return { error: error.message || "Failed to create document" };
        }
      },
      invalidatesTags: ["Sidebar"],
    }),
    archiveDocument: builder.mutation<any, { userId: string; id: string }>({
      queryFn: async ({ userId, id }) => {
        try {
          const data = await dbMutations.archive(userId, { id });
          return { data };
        } catch (error: any) {
          return { error: error.message || "Failed to archive document" };
        }
      },
      invalidatesTags: ["Sidebar", "Favorites"],
    }),
    updateDocument: builder.mutation<any, {
      userId: string;
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
    }>({
      queryFn: async ({ userId, ...args }) => {
        try {
          const data = await dbMutations.update(userId, args);
          return { data };
        } catch (error: any) {
          return { error: error.message || "Failed to update document" };
        }
      },
      invalidatesTags: ["Sidebar", "Favorites"],
    }),
    toggleFavoriteDocument: builder.mutation<any, { userId: string; id: string }>({
      queryFn: async ({ userId, id }) => {
        try {
          const data = await dbMutations.toggleFavorite(userId, { id });
          return { data };
        } catch (error: any) {
          return { error: error.message || "Failed to toggle favorite" };
        }
      },
      invalidatesTags: ["Favorites", "Sidebar"],
    }),
  }),
});

export const {
  useGetSidebarQuery,
  useGetFavoritesQuery,
  useLazySearchDocumentsQuery,
  useCreateDocumentMutation,
  useArchiveDocumentMutation,
  useUpdateDocumentMutation,
  useToggleFavoriteDocumentMutation,
} = apiSlice;
