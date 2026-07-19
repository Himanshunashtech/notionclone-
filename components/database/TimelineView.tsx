"use client";

import React, { useState, useRef, useEffect } from "react";
import { Doc } from "@/lib/supabase-db";
import { DatabaseConfig, parseDatabaseRow } from "./database-utils";
import { Calendar, ChevronLeft, ChevronRight, File, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TimelineViewProps {
  documentId: string;
  config: DatabaseConfig;
  subpages: Doc<"documents">[];
  preview?: boolean;
}

export const TimelineView = ({
  documentId: _documentId,
  config,
  subpages,
  preview = false,
}: TimelineViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scale, setScale] = useState<"day" | "week">("day");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // List all available date properties in this database schema
  const dateProperties = config.properties.filter((p) => p.type === "date");

  // Determine defaults for Start and End Date columns
  const [startDatePropId, setStartDatePropId] = useState<string>(() => {
    const found = config.properties.find(
      (p) => p.type === "date" && p.name.toLowerCase().includes("start")
    );
    return found?.id || config.properties.find((p) => p.type === "date")?.id || "";
  });

  const [endDatePropId, setEndDatePropId] = useState<string>(() => {
    const found = config.properties.find(
      (p) => p.type === "date" && p.name.toLowerCase().includes("end")
    );
    if (found) return found.id;
    const dates = config.properties.filter((p) => p.type === "date");
    return dates.length > 1 ? dates[1].id : "";
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate 30 days starting from 10 days ago for scroll centering
  const days: Date[] = [];
  const baseDate = new Date(year, month, currentDate.getDate() - 10);
  for (let i = 0; i < 30; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    days.push(d);
  }

  // Auto center scroll position on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 320; // Scroll roughly to active today
    }
  }, []);

  const getFormattedDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs flex flex-col">
      
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-900/10">
        <div className="flex items-center gap-x-2.5">
          <Calendar className="h-4 w-4 text-neutral-500" />
          <h3 className="font-bold text-sm">
            Timeline — {monthNames[month]} {year}
          </h3>
        </div>

        {/* Date Column Selectors */}
        {dateProperties.length > 0 && (
          <div className="flex items-center gap-x-2 text-xs text-muted-foreground select-none">
            <span>Map Range:</span>
            {/* Start Date Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="px-2.5 py-1 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-850 transition">
                {config.properties.find((p) => p.id === startDatePropId)?.name || "Choose Start Date"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="dark:bg-neutral-950">
                {dateProperties.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    className="cursor-pointer text-xs"
                    onClick={() => setStartDatePropId(p.id)}
                  >
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ArrowRight className="h-3.5 w-3.5" />

            {/* End Date Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="px-2.5 py-1 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-850 transition">
                {config.properties.find((p) => p.id === endDatePropId)?.name || "Choose End Date"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="dark:bg-neutral-950">
                <DropdownMenuItem
                  className="cursor-pointer text-xs text-rose-500 font-semibold"
                  onClick={() => setEndDatePropId("")}
                >
                  None (Single Day Bar)
                </DropdownMenuItem>
                {dateProperties.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    className="cursor-pointer text-xs"
                    onClick={() => setEndDatePropId(p.id)}
                  >
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="flex items-center gap-x-4">
          {/* Zoom levels */}
          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-md p-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs">
            <button
              onClick={() => setScale("day")}
              className={`px-2 py-0.5 rounded-sm transition ${scale === "day" ? "bg-white dark:bg-neutral-900 text-foreground font-semibold shadow-xs" : "text-neutral-500"}`}
            >
              Day
            </button>
            <button
              onClick={() => setScale("week")}
              className={`px-2 py-0.5 rounded-sm transition ${scale === "week" ? "bg-white dark:bg-neutral-900 text-foreground font-semibold shadow-xs" : "text-neutral-500"}`}
            >
              Week
            </button>
          </div>

          <div className="flex items-center gap-x-1.5">
            <button onClick={handlePrev} className="p-1 border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={handleNext} className="p-1 border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View split */}
      <div className="flex w-full overflow-hidden">
        {/* Left Side: Pages Names list */}
        <div className="w-56 border-r border-neutral-200 dark:border-neutral-800 shrink-0 select-none">
          <div className="h-10 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex items-center px-4 text-xs font-semibold text-neutral-500">
            Page Title
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {subpages.map((page) => (
              <div key={itemKey(page)} className="h-12 flex items-center px-4 truncate">
                <Link
                  href={`/documents/${page._id}`}
                  className="flex items-center gap-x-2 text-xs font-semibold hover:underline text-neutral-800 dark:text-neutral-200 truncate"
                >
                  <File className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{page.title || "Untitled"}</span>
                </Link>
              </div>
            ))}
            {subpages.length === 0 && (
              <div className="p-4 text-center text-xs text-muted-foreground">No rows yet.</div>
            )}
          </div>
        </div>

        {/* Right Side: Horizontal scrolling Gantt schedule */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin"
        >
          <div className="min-w-[1200px] flex flex-col relative select-none">
            
            {/* Timeline Header Row (Dates) */}
            <div className="flex h-10 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
              {days.map((day, idx) => (
                <div
                  key={idx}
                  className="w-20 border-r border-neutral-150 dark:border-neutral-800/80 shrink-0 text-center flex flex-col items-center justify-center py-1 text-[10px] text-neutral-400 font-semibold"
                >
                  <span>{monthNames[day.getMonth()]} {day.getDate()}</span>
                  <span className="text-[8px] opacity-70">
                    {scale === "day" ? day.toLocaleDateString(undefined, { weekday: "short" }) : `Wk ${idx}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Timeline Grid Rows */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 relative">
              {subpages.map((page) => {
                const row = parseDatabaseRow(page.content);
                const startDateStr = startDatePropId ? (row.values[startDatePropId] || "") : "";
                const endDateStr = endDatePropId ? (row.values[endDatePropId] || "") : "";

                if (startDateStr) {
                  const startDate = new Date(startDateStr);
                  const endDate = endDateStr ? new Date(endDateStr) : null;

                  // Normalize dates to midnight local time
                  const getMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
                  const startMidnight = getMidnight(startDate);
                  const endMidnight = endDate ? getMidnight(endDate) : startMidnight;

                  const firstDay = getMidnight(days[0]);
                  const lastDay = getMidnight(days[days.length - 1]);

                  // Render block if it falls within the 30-day timeline view window
                  if (startMidnight <= lastDay && endMidnight >= firstDay) {
                    const msInDay = 24 * 60 * 60 * 1000;
                    
                    const startDiffDays = (startMidnight.getTime() - firstDay.getTime()) / msInDay;
                    const endDiffDays = (endMidnight.getTime() - firstDay.getTime()) / msInDay;

                    // Constrain start and end coordinates within the view boundaries
                    const startPos = Math.max(0, startDiffDays);
                    const endPos = Math.min(days.length - 1, endDiffDays);

                    const leftOffset = startPos * 80 + 8;
                    const width = Math.max(80, (endPos - startPos + 1) * 80 - 16);

                    return (
                      <div key={itemKey(page)} className="h-12 flex relative items-center min-w-[1200px]">
                        {/* Background lines */}
                        {days.map((_, idx) => (
                          <div
                            key={idx}
                            className="w-20 h-full border-r border-neutral-100 dark:border-neutral-800/40 shrink-0"
                          />
                        ))}
                        {/* Gantt Bar */}
                        <Link
                          href={`/documents/${page._id}`}
                          className="absolute h-7 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-semibold text-[10px] flex items-center px-3 hover:bg-blue-500/20 transition cursor-pointer select-none truncate hover:scale-[1.01]"
                          style={{ left: `${leftOffset}px`, width: `${width}px` }}
                        >
                          <span className="truncate">{page.title || "Untitled"}</span>
                        </Link>
                      </div>
                    );
                  }
                }

                // If no valid dates, render empty timeline row with background columns
                return (
                  <div key={itemKey(page)} className="h-12 flex relative items-center min-w-[1200px]">
                    {days.map((_, idx) => (
                      <div
                        key={idx}
                        className="w-20 h-full border-r border-neutral-100 dark:border-neutral-800/40 shrink-0"
                      />
                    ))}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

// Helper for key identification
function itemKey(item: any): string {
  return item._id || item.id;
}
