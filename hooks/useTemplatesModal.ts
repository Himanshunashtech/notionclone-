import { create } from "zustand";

type TemplatesStore = {
  isOpen: boolean;
  parentId?: string;
  onOpen: (parentId?: string) => void;
  onClose: () => void;
};

export const useTemplates = create<TemplatesStore>((set) => ({
  isOpen: false,
  parentId: undefined,
  onOpen: (parentId) => set({ isOpen: true, parentId }),
  onClose: () => set({ isOpen: false, parentId: undefined }),
}));
