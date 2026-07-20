"use client";

import React from "react";
import * as Lucide from "lucide-react";
import * as Ri from "react-icons/ri";
import { cn } from "@/lib/utils";

interface DocumentIconProps {
  icon?: string | null;
  className?: string;
}

export const DocumentIcon = ({ icon, className }: DocumentIconProps) => {
  if (!icon) return null;

  if (icon.startsWith("ri:") || icon.startsWith("lucide:")) {
    const parts = icon.split(":");
    const prefix = parts[0];
    const iconName = parts[1];
    const iconColor = parts[2] || "currentColor";

    if (prefix === "ri") {
      const IconComponent = (Ri as any)[iconName];
      if (IconComponent) {
        return (
          <IconComponent
            className={cn("h-5 w-5 shrink-0", className)}
            style={{ color: iconColor }}
          />
        );
      }
    } else {
      const IconComponent = (Lucide as any)[iconName];
      if (IconComponent) {
        return (
          <IconComponent
            className={cn("h-5 w-5 shrink-0", className)}
            style={{ color: iconColor }}
          />
        );
      }
    }
  }

  // Otherwise treat as emoji string
  return (
    <span className={cn("text-xl select-none shrink-0 font-emoji", className)}>
      {icon}
    </span>
  );
};
