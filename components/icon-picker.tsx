"use client";

import React, { useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import * as Ri from "react-icons/ri";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IconPickerProps {
  onChange: (icon: string) => void;
  children: React.ReactNode;
  asChild?: boolean;
}

const COLORS = [
  { name: "gray", value: "#6b7280" },
  { name: "red", value: "#ef4444" },
  { name: "orange", value: "#f97316" },
  { name: "yellow", value: "#facc15" },
  { name: "green", value: "#22c55e" },
  { name: "blue", value: "#3b82f6" },
  { name: "purple", value: "#a855f7" },
  { name: "pink", value: "#ec4899" },
];

const ICON_LIST = [
  "RiUserFill", "RiUsersFill", "RiBriefcaseFill", "RiFolderFill", "RiFileTextFill", "RiBookOpenFill", "RiBookmarkFill", 
  "RiCalendarEventFill", "RiTimeFill", "RiCheckboxFill", "RiListCheck", "RiTargetFill", "RiTrophyFill", "RiAwardFill", "RiStarFill", 
  "RiHeartFill", "RiCompassFill", "RiMapPinFill", "RiGlobeFill", "RiAnchorFill", "RiActivityFill", "RiBarChartFill", 
  "RiPieChartFill", "RiDatabaseFill", "RiCodeBoxFill", "RiTerminalBoxFill", "RiCpuFill", "RiMacbookFill", "RiTvFill", 
  "RiSmartphoneFill", "RiCameraFill", "RiImageFill", "RiVideoChatFill", "RiMusic2Fill", "RiVolumeUpFill", "RiHeadphoneFill", "RiPlayCircleFill", 
  "RiPauseCircleFill", "RiSettings4Fill", "RiSlidersFill", "RiWrenchFill", "RiShieldCheckFill", "RiKey2Fill", "RiLock2Fill", "RiUnlock2Fill", 
  "RiMailFill", "RiInboxArchiveFill", "RiSendPlaneFill", "RiAttachmentFill", "RiLink", "RiAddCircleFill", "RiIndeterminateCircleFill", "RiTrashFill", 
  "RiInformationFill", "RiQuestionFill", "RiAlertFill", "RiErrorWarningFill", "RiSunFill", "RiMoonFill", "RiCloudFill", "RiWifiFill", 
  "RiFireFill", "RiFlashlightFill", "RiGiftFill", "RiShoppingBagFill", "RiShoppingCartFill", "RiBankCardFill", "RiMoneyDollarBoxFill", "RiCoinsFill", 
  "RiHardDriveFill", "RiServerFill", "RiShareForwardFill", "RiExternalLinkFill", "RiSearchFill", "RiEmotionHappyFill", 
  "RiEyeFill", "RiEyeCloseFill", "RiPenNibFill", "RiScissorsFill", "RiHashtag", "RiAtFill", "RiFilter2Fill", "RiEqualizerFill",
  "RiArrowRightFill", "RiArrowLeftFill", "RiArrowUpFill", "RiArrowDownFill", "RiArrowUpRightFill", "RiArrowRightSLine", "RiArrowLeftSLine", "RiMenuFill"
];

export const IconPicker = ({
  onChange,
  children,
  asChild,
}: IconPickerProps) => {
  const { resolvedTheme } = useTheme();
  const currentTheme = (resolvedTheme || "light") as "light" | "dark";
  const [activeTab, setActiveTab] = useState<"emoji" | "icon" | "upload">("emoji");
  const [selectedColor, setSelectedColor] = useState("#6b7280");
  const [searchQuery, setSearchQuery] = useState("");

  const themeMap = {
    dark: Theme.DARK,
    light: Theme.LIGHT,
  };

  const theme = themeMap[currentTheme];

  const filteredIcons = ICON_LIST.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>
      <PopoverContent className="w-[360px] p-0 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md rounded-lg overflow-hidden z-50">
        {/* Tabs Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 px-3 py-1.5 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-x-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <button
              onClick={() => setActiveTab("emoji")}
              className={cn(
                "px-2.5 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer",
                activeTab === "emoji" && "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-150"
              )}
            >
              Emoji
            </button>
            <button
              onClick={() => setActiveTab("icon")}
              className={cn(
                "px-2.5 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer",
                activeTab === "icon" && "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-150"
              )}
            >
              Icons
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={cn(
                "px-2.5 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer",
                activeTab === "upload" && "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-150"
              )}
            >
              Upload
            </button>
          </div>
          <button
            onClick={() => onChange("")}
            className="text-xs text-neutral-500 hover:text-rose-500 dark:hover:text-rose-450 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 py-1 rounded-md transition cursor-pointer font-medium"
          >
            Remove
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-1">
          {activeTab === "emoji" && (
            <div className="w-full flex items-center justify-center">
              <EmojiPicker
                height={320}
                width="100%"
                theme={theme}
                skinTonesDisabled
                searchDisabled
                onEmojiClick={(data) => onChange(data.emoji)}
              />
            </div>
          )}

          {activeTab === "icon" && (
            <div className="flex flex-col p-2 space-y-3">
              {/* Color Bar */}
              <div className="flex items-center justify-between gap-x-1.5 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={cn(
                      "h-5 w-5 rounded-full border border-neutral-200 dark:border-neutral-750 transition transform hover:scale-110 cursor-pointer relative",
                      selectedColor === c.value && "ring-1 ring-offset-1 ring-neutral-400 dark:ring-neutral-600"
                    )}
                  />
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Ri.RiSearchLine className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-neutral-200 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-900/50 focus:ring-1 focus:ring-blue-500 outline-hidden dark:text-neutral-200"
                />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto custom-scrollbar p-0.5">
                {filteredIcons.map((name) => {
                  const IconComp = (Ri as any)[name];
                  if (!IconComp) return null;
                  return (
                    <button
                      key={name}
                      onClick={() => onChange(`ri:${name}:${selectedColor}`)}
                      className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-850 flex items-center justify-center transition cursor-pointer"
                    >
                      <IconComp
                        className="h-4.5 w-4.5"
                        style={{ color: selectedColor }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-md m-2 space-y-2 hover:bg-neutral-50 dark:hover:bg-neutral-850/40 transition cursor-pointer">
              <Ri.RiUploadCloud2Line className="h-8 w-8 text-neutral-400" />
              <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Upload custom image
              </div>
              <div className="text-[10px] text-neutral-400">
                Supports PNG, JPG, or SVG (max 5MB)
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
