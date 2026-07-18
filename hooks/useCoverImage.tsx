import { create } from "zustand";

type CoverImageStore = {
  url?: string;
  isOpen: boolean;
  documentId?: string;
  onOpen: (documentId?: string) => void;
  onClose: () => void;
  onReplace: (url: string, documentId?: string) => void;
};

export const useCoverImage = create<CoverImageStore>((set) => ({
  url: undefined,
  isOpen: false,
  documentId: undefined,
  onOpen: (documentId?: string) => set({ isOpen: true, url: undefined, documentId }),
  onClose: () => set({ isOpen: false, url: undefined, documentId: undefined }),
  onReplace: (url: string, documentId?: string) => set({ isOpen: true, url, documentId }),
}));
