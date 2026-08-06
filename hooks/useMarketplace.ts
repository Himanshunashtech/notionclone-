import { create } from "zustand";

type MarketplaceCategory =
  | "all"
  | "project-management"
  | "productivity"
  | "student"
  | "design"
  | "marketing"
  | "engineering"
  | "personal"
  | "finance";

type MarketplaceTab = "discover" | "templates" | "popular" | "new";

interface MarketplaceStore {
  activeTab: MarketplaceTab;
  activeCategory: MarketplaceCategory;
  searchQuery: string;
  previewTemplateId: string | null;
  setActiveTab: (tab: MarketplaceTab) => void;
  setActiveCategory: (cat: MarketplaceCategory) => void;
  setSearchQuery: (q: string) => void;
  setPreviewTemplateId: (id: string | null) => void;
}

export const useMarketplace = create<MarketplaceStore>((set) => ({
  activeTab: "discover",
  activeCategory: "all",
  searchQuery: "",
  previewTemplateId: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setPreviewTemplateId: (id) => set({ previewTemplateId: id }),
}));
