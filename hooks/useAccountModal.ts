import { create } from "zustand";

type AccountStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useAccount = create<AccountStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
