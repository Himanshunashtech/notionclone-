import { create } from "zustand";

type HistorySidebarStore = {
  isOpen: boolean;
  documentId: string | null;
  onOpen: (documentId: string) => void;
  onClose: () => void;
};

export const useHistorySidebar = create<HistorySidebarStore>((set) => ({
  isOpen: false,
  documentId: null,
  onOpen: (documentId: string) => set({ isOpen: true, documentId }),
  onClose: () => set({ isOpen: false, documentId: null }),
}));
