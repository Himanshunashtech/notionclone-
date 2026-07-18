import { create } from "zustand";

type FilePreviewStore = {
  isOpen: boolean;
  documentId: string | null;
  onOpen: (documentId: string) => void;
  onClose: () => void;
};

export const useFilePreview = create<FilePreviewStore>((set) => ({
  isOpen: false,
  documentId: null,
  onOpen: (documentId: string) => set({ isOpen: true, documentId }),
  onClose: () => set({ isOpen: false, documentId: null }),
}));
