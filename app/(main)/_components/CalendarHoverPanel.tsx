"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useQuery } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { Calendar, Clock, Video, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// ─── helpers ─────────────────────────────────────────────────────────────────

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_SHORT   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function fmtTime(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function isToday(ms: number): boolean {
  return new Date(ms).toDateString() === new Date().toDateString();
}

function isTomorrow(ms: number): boolean {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return new Date(ms).toDateString() === t.toDateString();
}

function groupLabel(ms: number): string {
  if (isToday(ms))    return "Today";
  if (isTomorrow(ms)) return "Tomorrow";
  const d = new Date(ms);
  return `${DAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

// ─── component ───────────────────────────────────────────────────────────────

interface CalendarHoverPanelProps {
  children: React.ReactNode;
}

export const CalendarHoverPanel = ({ children }: CalendarHoverPanelProps) => {
  const router = useRouter();
  const events = useQuery(api.calendar.getEvents);

  const [open, setOpen]   = useState(false);
  const [pos,  setPos]    = useState({ top: 0, left: 0 });
  const triggerRef        = useRef<HTMLDivElement>(null);
  const enterTimer        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer        = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recalculate position whenever the panel opens
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top:  rect.top,
        left: rect.right + 4,   // 4px gap from sidebar edge
      });
    }
  }, [open]);

  const handleEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    enterTimer.current = setTimeout(() => setOpen(true), 180);
  };

  const handleLeave = () => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    leaveTimer.current = setTimeout(() => setOpen(false), 160);
  };

  // Filter upcoming events (from now on), cap at 8
  const now      = Date.now();
  const upcoming = (events ?? [])
    .filter((e: any) => e.endTime >= now)
    .slice(0, 8);

  // Group by date
  const grouped: { label: string; events: any[] }[] = [];
  for (const ev of upcoming) {
    const label = groupLabel(ev.startTime);
    const g = grouped.find((x) => x.label === label);
    if (g) g.events.push(ev);
    else   grouped.push({ label, events: [ev] });
  }

  // ── panel markup (rendered in portal) ────────────────────────────────────
  const panel = open ? (
    <div
      style={{
        position: "fixed",
        top:   pos.top,
        left:  pos.left,
        zIndex: 99999,
        width:  "260px",
      }}
      className="rounded-xl border border-neutral-200 dark:border-neutral-700/60 bg-secondary shadow-2xl overflow-hidden"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-neutral-200 dark:border-neutral-700/60">
        <div className="flex items-center gap-x-2">
          <Calendar className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
          <span className="text-[12px] font-semibold text-neutral-800 dark:text-neutral-100">
            Upcoming Events
          </span>
        </div>
        <button
          onClick={() => { setOpen(false); router.push("/calendar"); }}
          className="flex items-center gap-x-0.5 text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
        >
          Open <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Event list */}
      <div className="max-h-[340px] overflow-y-auto scrollbar-none">
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Calendar className="h-7 w-7 text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
              No upcoming events
            </p>
          </div>
        ) : (
          <div className="py-1">
            {grouped.map(({ label, events: dayEvents }) => (
              <div key={label}>
                {/* Day label */}
                <div className="px-4 pt-2.5 pb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide ${
                      label === "Today"
                        ? "text-red-500 dark:text-red-400"
                        : "text-neutral-400 dark:text-neutral-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {/* Events */}
                {dayEvents.map((ev: any) => (
                  <button
                    key={ev._id}
                    onClick={() => { setOpen(false); router.push("/calendar"); }}
                    className="w-full flex items-start gap-x-2.5 px-4 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition text-left"
                  >
                    {/* Color dot */}
                    <span
                      className="mt-[5px] h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: ev.color || "#3b82f6" }}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-neutral-800 dark:text-neutral-100 truncate leading-snug">
                        {ev.title || "Untitled"}
                      </p>

                      <div className="flex items-center gap-x-1.5 mt-0.5">
                        {ev.isAllDay ? (
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                            All day
                          </span>
                        ) : (
                          <>
                            <Clock className="h-2.5 w-2.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                              {fmtTime(ev.startTime)} – {fmtTime(ev.endTime)}
                            </span>
                          </>
                        )}
                        {ev.meetingLink && (
                          <Video className="h-2.5 w-2.5 text-blue-400 shrink-0 ml-1" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 dark:border-neutral-700/60 px-4 py-2.5">
        <button
          onClick={() => { setOpen(false); router.push("/calendar"); }}
          className="w-full text-[11px] text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium text-center transition"
        >
          View full calendar →
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {typeof window !== "undefined" &&
        ReactDOM.createPortal(panel, document.body)}
    </div>
  );
};
