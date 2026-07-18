"use client";

import React, { useState } from "react";
import { Doc, Id } from "@/lib/supabase-db";
import { DatabaseConfig, parseDatabaseRow } from "./database-utils";
import { ChevronLeft, ChevronRight, Plus, File } from "lucide-react";
import { useMutation } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { toast } from "sonner";
import Link from "next/link";

interface CalendarViewProps {
  documentId: string;
  config: DatabaseConfig;
  subpages: Doc<"documents">[];
  preview?: boolean;
}

export const CalendarView = ({
  documentId,
  config,
  subpages,
  preview = false,
}: CalendarViewProps) => {
  const update = useMutation(api.documents.update);
  const createNote = useMutation(api.documents.create);

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: Date[] = [];
  // Days from previous month for padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push(new Date(year, month - 1, prevMonthDays - i));
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i));
  }
  // Days of next month for padding
  const remaining = 35 - calendarDays.length;
  const paddingNext = remaining > 0 ? remaining : (42 - calendarDays.length);
  for (let i = 1; i <= paddingNext; i++) {
    calendarDays.push(new Date(year, month + 1, i));
  }

  const getFormattedDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Group subpages by date string (YYYY-MM-DD)
  const itemsByDate: Record<string, Doc<"documents">[]> = {};
  subpages.forEach((page) => {
    const row = parseDatabaseRow(page.content);
    // Find any date property in values
    const dateProp = config.properties.find((p) => p.type === "date");
    if (dateProp) {
      const val = row.values[dateProp.id] || "";
      if (val) {
        itemsByDate[val] = itemsByDate[val] || [];
        itemsByDate[val].push(page);
      }
    }
  });

  const handleAddForDate = async (dateStr: string) => {
    if (preview) return;

    const dateProp = config.properties.find((p) => p.type === "date");
    const defaultValues: Record<string, string> = {};
    
    config.properties.forEach((prop) => {
      defaultValues[prop.id] = prop.type === "date" && dateProp?.id === prop.id 
        ? dateStr 
        : "";
    });

    const initialContent = JSON.stringify(
      { type: "database_row", values: defaultValues },
      null,
      2
    );

    const promise = createNote({
      title: "Untitled",
      parentDocument: documentId,
    }).then(async (newId) => {
      await update({
        id: newId as Id<"documents">,
        content: initialContent,
      });
    });

    toast.promise(promise, {
      loading: `Adding item for ${dateStr}...`,
      success: "Added item!",
      error: "Failed to add item.",
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
        <h3 className="font-bold text-base">
          {monthNames[month]} {year}
        </h3>
        <div className="flex items-center gap-x-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-foreground transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-foreground transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday Names Row */}
      <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 text-center py-2 text-xs font-semibold text-neutral-500">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Monthly Day Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-neutral-200 dark:divide-neutral-800 border-l border-t-0 border-neutral-200 dark:border-neutral-800">
        {calendarDays.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === month;
          const formatted = getFormattedDateString(day);
          const dayItems = itemsByDate[formatted] || [];
          const isToday = new Date().toDateString() === day.toDateString();

          return (
            <div
              key={idx}
              className={`min-h-[100px] p-2 flex flex-col justify-between transition ${
                isCurrentMonth 
                  ? "bg-transparent" 
                  : "bg-neutral-50/40 dark:bg-neutral-900/10 text-neutral-400"
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ${
                    isToday 
                      ? "bg-blue-600 text-white" 
                      : isCurrentMonth ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-400"
                  }`}
                >
                  {day.getDate()}
                </span>
                {!preview && isCurrentMonth && (
                  <button
                    onClick={() => handleAddForDate(formatted)}
                    className="opacity-0 hover:opacity-100 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Items in Day */}
              <div className="flex-grow space-y-1 overflow-y-auto max-h-[70px] scrollbar-none">
                {dayItems.map((item) => (
                  <Link
                    key={item._id}
                    href={`/documents/${item._id}`}
                    className="flex items-center gap-x-1 px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-850 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 rounded-sm text-[10px] text-neutral-700 dark:text-neutral-300 truncate"
                  >
                    <File className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">{item.title || "Untitled"}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
