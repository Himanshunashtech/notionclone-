"use client";

import React, { createContext, useContext, useState, useRef } from "react";

interface MentionItem {
  id: string;
  type: "person" | "page" | "event";
  title: string;
  subtitle?: string;
  icon?: string;
}

interface MentionModalContextType {
  isOpen: boolean;
  onOpen: (onSelect: (item: MentionItem) => void) => void;
  onClose: () => void;
}

const MentionModalContext = createContext<MentionMentionContextType | undefined>(undefined);

type MentionMentionContextType = MentionModalContextType;

export const useMentionModal = () => {
  const context = useContext(MentionModalContext);
  if (!context) {
    // Return a dummy safe fallback so it doesn't crash when rendering outside provider
    return {
      isOpen: false,
      onOpen: () => {},
      onClose: () => {},
      isFallback: true,
    };
  }
  return { ...context, isFallback: false };
};

import { useQuery } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { useUser } from "@/components/providers/supabase-provider";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { File, Calendar, User, Search } from "lucide-react";

export const MentionModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectCallbackRef = useRef<((item: MentionItem) => void) | null>(null);
  const [query, setQuery] = useState("");

  const { user } = useUser();
  const pages = useQuery(api.documents.getSearch);
  const events = useQuery(api.calendar.getEvents);

  const onOpen = (onSelect: (item: MentionItem) => void) => {
    setQuery("");
    selectCallbackRef.current = onSelect;
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
    selectCallbackRef.current = null;
  };

  // Compile list of potential items
  const items: MentionItem[] = [];

  // 1. Add current user as a person
  if (user) {
    items.push({
      id: user.id,
      type: "person",
      title: user.fullName || "User",
      subtitle: user.emailAddresses?.[0]?.emailAddress || "",
      icon: "user",
    });
  }

  // 2. Add pages
  if (pages) {
    pages.forEach((p) => {
      items.push({
        id: p._id,
        type: "page",
        title: p.title || "Untitled",
        icon: "page",
      });
    });
  }

  // 3. Add calendar events
  if (events) {
    events.forEach((ev) => {
      items.push({
        id: ev._id,
        type: "event",
        title: ev.title || "Untitled Event",
        subtitle: new Date(ev.startTime).toLocaleDateString(),
        icon: "event",
      });
    });
  }

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: MentionItem) => {
    if (selectCallbackRef.current) {
      selectCallbackRef.current(item);
    }
    onClose();
  };

  return (
    <MentionModalContext.Provider value={{ isOpen, onOpen, onClose }}>
      {children}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTitle className="sr-only">Mention Page, Event or Person</DialogTitle>
        <DialogDescription className="sr-only">
          Select a page, calendar event, or member to mention in your document.
        </DialogDescription>
        <DialogContent className="p-0 overflow-hidden max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl">
          <div className="flex items-center gap-x-2.5 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20">
            <Search className="h-4 w-4 text-neutral-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, pages, or events..."
              className="w-full text-sm bg-transparent outline-none border-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400"
              autoFocus
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-400 font-medium">
                No matches found
              </div>
            ) : (
              filtered.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-x-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition text-left cursor-pointer group"
                >
                  <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 group-hover:bg-white dark:group-hover:bg-neutral-750 transition shrink-0">
                    {item.type === "person" && <User className="h-4 w-4" />}
                    {item.type === "page" && <File className="h-4 w-4" />}
                    {item.type === "event" && <Calendar className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-neutral-850 dark:text-neutral-200 truncate leading-snug">
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-550 truncate leading-none mt-0.5">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MentionModalContext.Provider>
  );
};
