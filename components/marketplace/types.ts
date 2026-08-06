export interface MarketplaceTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string[];
  previewImage: string;
  accentFrom: string;
  accentTo: string;
  accentBorder: string;
  lightAccentFrom: string;
  lightAccentTo: string;
  lightAccentBorder: string;
  creator: {
    name: string;
    avatar: string;
    templateCount: number;
  };
  stats: {
    uses: string;
    rating: number;
  };
  isFree: boolean;
  price?: string;
  layoutType:
    | "split-left"
    | "split-right"
    | "full-width"
    | "numbered"
    | "centered"
    | "grid-cards"
    | "horizontal"
    | "stacked"
    | "magazine"
    | "minimal";
  dbConfig: string;
  dbType: "table" | "board" | "document" | "todo" | "form";
}

export interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}
