import { create } from "zustand";

type OnboardingStore = {
  isOpen: boolean;
  onComplete: (teamName: string) => Promise<void>;
  _resolveRef: ((teamName: string) => void) | null;
  onOpen: (onComplete: (teamName: string) => Promise<void>) => void;
  onClose: () => void;
};

export const useOnboarding = create<OnboardingStore>((set) => ({
  isOpen: false,
  onComplete: async () => {},
  _resolveRef: null,
  onOpen: (onComplete) => set({ isOpen: true, onComplete }),
  onClose: () => set({ isOpen: false }),
}));
