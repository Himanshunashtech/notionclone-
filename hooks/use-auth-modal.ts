import { create } from "zustand";

type AuthModalStore = {
  isOpen: boolean;
  view: "login" | "signup";
  onOpen: (view?: "login" | "signup") => void;
  onClose: () => void;
};

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  view: "login",
  onOpen: (view = "login") => set({ isOpen: true, view }),
  onClose: () => set({ isOpen: false }),
}));
