import React from "react";
import { MarketplaceTemplate } from "../types";
import {
  SplitLeftCard,
  SplitRightCard,
  FullWidthCard,
  NumberedCard,
  CenteredCard,
  GridCardsCard,
  HorizontalCard,
  StackedCard,
  MagazineCard,
  MinimalCard,
} from "./CardLayouts";

interface TemplateCardProps {
  tmpl: MarketplaceTemplate;
  isDark: boolean;
  onAdd: () => void;
  onPreview: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  tmpl,
  isDark,
  onAdd,
  onPreview,
}) => {
  const props = { tmpl, isDark, onAdd, onPreview };

  switch (tmpl.layoutType) {
    case "split-left":
      return <SplitLeftCard {...props} />;
    case "split-right":
      return <SplitRightCard {...props} />;
    case "full-width":
      return <FullWidthCard {...props} />;
    case "numbered":
      return <NumberedCard {...props} />;
    case "centered":
      return <CenteredCard {...props} />;
    case "grid-cards":
      return <GridCardsCard {...props} />;
    case "horizontal":
      return <HorizontalCard {...props} />;
    case "stacked":
      return <StackedCard {...props} />;
    case "magazine":
      return <MagazineCard {...props} />;
    case "minimal":
      return <MinimalCard {...props} />;
    default:
      return <MinimalCard {...props} />;
  }
};
