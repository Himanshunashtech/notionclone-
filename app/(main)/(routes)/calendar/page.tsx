"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTheme } from "next-themes";
import { useQuery, useMutation } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Clock, 
  Video, 
  FileText, 
  X,
  Search,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Keyboard,
  Globe,
  Settings,
  MoreHorizontal
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  color: string;
  meetingLink: string;
  documentId: string;
}

const COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
];

export default function CalendarPage() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const events = useQuery(api.calendar.getEvents);
  const documents = useQuery(api.documents.getSearch);

  useEffect(() => {
    const defaultFavicon = resolvedTheme === "dark" ? "/logo-dark.svg" : "/logo.svg";
    const calendarFavicon = resolvedTheme === "dark" ? "/calendar-dark.svg" : "/calendar.svg";

    window.document.title = "Calendar | Zotion";

    const link = window.document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = calendarFavicon;
    }

    return () => {
      window.document.title = "Zotion";
      if (link) {
        link.href = defaultFavicon;
      }
    };
  }, [resolvedTheme]);

  const createEvent = useMutation(api.calendar.createEvent);
  const updateEvent = useMutation(api.calendar.updateEvent);
  const deleteEvent = useMutation(api.calendar.deleteEvent);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "day" | "month">("week");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Timezones configuration
  const TIMEZONES = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "EST / EDT (New York)" },
    { value: "America/Los_Angeles", label: "PST / PDT (Los Angeles)" },
    { value: "Europe/London", label: "GMT / BST (London)" },
    { value: "Asia/Tokyo", label: "JST (Tokyo)" },
    { value: "Asia/Kolkata", label: "IST (India)" },
  ];

  const [secondaryTimeZone, setSecondaryTimeZone] = useState<string>("UTC");
  const [showSecondaryTimeZone, setShowSecondaryTimeZone] = useState<boolean>(false);

  // Interactive Availability sharing state
  const [isSharingAvailability, setIsSharingAvailability] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<{ day: Date; hour: number }[]>([]);

  // Filter out/toggles for categories
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({
    "Work": true,
    "Personal": true,
    "Data Science Team": true,
    "Data Science Core": true,
    "Kids": true,
    "Holidays": true,
  });

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    isAllDay: false,
    color: "#3b82f6",
    meetingLink: "",
    documentId: "",
  });

  // Calculate starting of the week
  const weekStart = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust start to Monday
    return new Date(start.setDate(diff));
  }, [currentDate]);

  // Generate 7 days of the week
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  // Mini-calendar generation
  const miniCalendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    const days: Date[] = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthDays - i));
    }
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i));
    }
    const rem = 35 - days.length;
    const padding = rem > 0 ? rem : (42 - days.length);
    for (let i = 1; i <= padding; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  }, [currentDate]);

  const getFormattedDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handlePrev = () => {
    const copy = new Date(currentDate);
    if (viewMode === "week") {
      copy.setDate(copy.getDate() - 7);
    } else if (viewMode === "day") {
      copy.setDate(copy.getDate() - 1);
    } else {
      copy.setMonth(copy.getMonth() - 1);
    }
    setCurrentDate(copy);
  };

  const handleNext = () => {
    const copy = new Date(currentDate);
    if (viewMode === "week") {
      copy.setDate(copy.getDate() + 7);
    } else if (viewMode === "day") {
      copy.setDate(copy.getDate() + 1);
    } else {
      copy.setMonth(copy.getMonth() + 1);
    }
    setCurrentDate(copy);
  };

  const handleOpenAddModal = (date: Date, hour?: number) => {
    const dateStr = getFormattedDateString(date);
    const startHour = hour !== undefined ? String(hour).padStart(2, "0") : "12";
    const endHour = hour !== undefined ? String(hour + 1).padStart(2, "0") : "13";
    
    setFormData({
      title: "",
      description: "",
      startTime: `${dateStr}T${startHour}:00`,
      endTime: `${dateStr}T${endHour}:00`,
      isAllDay: false,
      color: "#3b82f6",
      meetingLink: "",
      documentId: "",
    });
    setEditingEventId(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (event: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const formatTimestamp = (ts: number) => {
      const d = new Date(ts);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const date = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${date}T${hours}:${minutes}`;
    };

    setFormData({
      title: event.title,
      description: event.description || "",
      startTime: formatTimestamp(event.startTime),
      endTime: formatTimestamp(event.endTime),
      isAllDay: event.isAllDay || false,
      color: event.color || "#3b82f6",
      meetingLink: event.meetingLink || "",
      documentId: event.documentId || "",
    });
    setEditingEventId(event.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const startISO = new Date(formData.startTime).toISOString();
    const endISO = new Date(formData.endTime).toISOString();

    if (new Date(startISO) > new Date(endISO)) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      if (editingEventId) {
        await updateEvent({
          id: editingEventId,
          title: formData.title,
          description: formData.description,
          startTime: startISO,
          endTime: endISO,
          isAllDay: formData.isAllDay,
          color: formData.color,
          meetingLink: formData.meetingLink,
          documentId: formData.documentId || undefined,
        });
        toast.success("Event updated!");
      } else {
        await createEvent({
          title: formData.title,
          description: formData.description,
          startTime: startISO,
          endTime: endISO,
          isAllDay: formData.isAllDay,
          color: formData.color,
          meetingLink: formData.meetingLink,
          documentId: formData.documentId || undefined,
        });
        toast.success("Event added!");
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save event");
    }
  };

  const handleDelete = async () => {
    if (!editingEventId) return;
    const ok = window.confirm("Are you sure you want to delete this event?");
    if (!ok) return;

    try {
      await deleteEvent({ id: editingEventId });
      toast.success("Event deleted");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete event");
    }
  };

  const handleSlotClick = (day: Date, hr: number) => {
    if (isSharingAvailability) {
      setSelectedSlots((prev) => {
        const exists = prev.some(
          (s) => s.day.toDateString() === day.toDateString() && s.hour === hr
        );
        if (exists) {
          return prev.filter(
            (s) => !(s.day.toDateString() === day.toDateString() && s.hour === hr)
          );
        } else {
          return [...prev, { day, hour: hr }].sort((a, b) => {
            const timeA = a.day.getTime() + a.hour * 3600000;
            const timeB = b.day.getTime() + b.hour * 3600000;
            return timeA - timeB;
          });
        }
      });
    } else {
      handleOpenAddModal(day, hr);
    }
  };

  const handleClearAllEvents = async () => {
    const ok = window.confirm("Are you sure you want to delete all calendar events?");
    if (!ok) return;

    try {
      if (!events || events.length === 0) return;
      await Promise.all(events.map((ev) => deleteEvent({ id: ev.id })));
      toast.success("All calendar events cleared!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear all events");
    }
  };

  const handleSeedDemoData = async () => {
    const ok = window.confirm("Would you like to seed calendar with realistic demo events for this week?");
    if (!ok) return;

    try {
      const daysOffset = [
        { dayIdx: 0, title: "Weekly Team Sync", description: "Status updates and blocker sync", hour: 10, duration: 1, color: "#3b82f6" },
        { dayIdx: 0, title: "Lunch with Sarah", description: "Catch up and chat about weekend plans", hour: 12, duration: 1, color: "#ec4899" },
        { dayIdx: 1, title: "Product Spec Review", description: "Review specs for Notion Calendar integration", hour: 14, duration: 2, color: "#8b5cf6" },
        { dayIdx: 2, title: "1:1 with Tech Lead", description: "Bi-weekly career development and planning sync", hour: 11, duration: 1, color: "#10b981" },
        { dayIdx: 3, title: "Deep Work Block", description: "Dev focus time", hour: 13, duration: 3, color: "#f59e0b" },
        { dayIdx: 4, title: "Friday Retrospective", description: "Team retro and weekly demo session", hour: 16, duration: 1, color: "#ef4444" },
      ];

      const seedPromises = daysOffset.map((ev) => {
        const start = new Date(weekStart);
        start.setDate(weekStart.getDate() + ev.dayIdx);
        start.setHours(ev.hour, 0, 0, 0);

        const end = new Date(start);
        end.setHours(start.getHours() + ev.duration);

        return createEvent({
          title: ev.title,
          description: ev.description,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          isAllDay: false,
          color: ev.color,
          meetingLink: "https://meet.google.com/abc-defg-hij",
        });
      });

      await Promise.all(seedPromises);
      toast.success("Demo calendar events seeded successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to seed demo events");
    }
  };

  const handleDragStart = (e: React.DragEvent, eventObj: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(eventObj));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnHour = async (e: React.DragEvent, targetDay: Date, targetHour: number) => {
    e.preventDefault();
    try {
      const eventDataStr = e.dataTransfer.getData("application/json");
      if (!eventDataStr) return;
      const draggedEvent = JSON.parse(eventDataStr);
      
      const origStart = new Date(draggedEvent.startTime);
      const origEnd = new Date(draggedEvent.endTime);
      const durationMs = origEnd.getTime() - origStart.getTime();
      
      const newStart = new Date(targetDay);
      newStart.setHours(targetHour, origStart.getMinutes(), 0, 0);
      const newEnd = new Date(newStart.getTime() + durationMs);
      
      await updateEvent({
        id: draggedEvent.id,
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString(),
      });
      toast.success(`Rescheduled "${draggedEvent.title}"`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reschedule event");
    }
  };

  const handleDropOnDay = async (e: React.DragEvent, targetDay: Date) => {
    e.preventDefault();
    try {
      const eventDataStr = e.dataTransfer.getData("application/json");
      if (!eventDataStr) return;
      const draggedEvent = JSON.parse(eventDataStr);
      
      const origStart = new Date(draggedEvent.startTime);
      const origEnd = new Date(draggedEvent.endTime);
      const durationMs = origEnd.getTime() - origStart.getTime();
      
      const newStart = new Date(targetDay);
      newStart.setHours(origStart.getHours(), origStart.getMinutes(), 0, 0);
      const newEnd = new Date(newStart.getTime() + durationMs);
      
      await updateEvent({
        id: draggedEvent.id,
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString(),
      });
      toast.success(`Moved "${draggedEvent.title}" to ${newStart.toLocaleDateString()}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to move event");
    }
  };

  // Helper for colourful cards background and border styling
  const getPastelColorStyles = (hexColor: string) => {
    const map: Record<string, { bg: string; border: string }> = {
      "#3b82f6": { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.45)" },
      "#10b981": { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.45)" },
      "#f59e0b": { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.45)" },
      "#ef4444": { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.45)" },
      "#8b5cf6": { bg: "rgba(139, 92, 246, 0.15)", border: "rgba(139, 92, 246, 0.45)" },
      "#ec4899": { bg: "rgba(236, 72, 153, 0.15)", border: "rgba(236, 72, 153, 0.45)" },
    };
    return map[hexColor] || { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.45)" };
  };

  // Group events by day and hour
  const eventsByDayAndHour = useMemo(() => {
    const map: Record<string, any[]> = {};
    if (!events) return map;

    events.forEach((ev) => {
      // Find category by color
      const cat = [
        { name: "Work", color: "#3b82f6" },
        { name: "Data Science Team", color: "#8b5cf6" },
        { name: "Data Science Core", color: "#10b981" },
        { name: "Personal", color: "#f59e0b" },
        { name: "Kids", color: "#ef4444" },
        { name: "Holidays", color: "#ec4899" },
      ].find((c) => c.color === ev.color);
      
      const catName = cat ? cat.name : "Work";
      
      // Filter out events that aren't toggled active
      if (visibleCategories[catName] === false) {
        return;
      }

      const dStr = getFormattedDateString(new Date(ev.startTime));
      if (!map[dStr]) map[dStr] = [];
      map[dStr].push(ev);
    });

    return map;
  }, [events, visibleCategories]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const miniWeekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const displayDays = useMemo(() => {
    if (viewMode === "day") {
      return [currentDate];
    }
    return weekDays;
  }, [viewMode, currentDate, weekDays]);

  return (
    <div className="h-full flex overflow-hidden bg-background dark:bg-dark select-none text-neutral-800 dark:text-neutral-200">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-[260px] border-r border-neutral-200 dark:border-neutral-800 flex flex-col p-4 space-y-6 shrink-0 bg-neutral-50/30 dark:bg-neutral-900/10">
        {/* Back Button */}
        <button
          onClick={() => router.push("/documents")}
          className="flex items-center gap-x-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition cursor-pointer px-1 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Workspace</span>
        </button>

        {/* Small Mini Calendar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <div className="flex items-center gap-x-1">
              <button onClick={handlePrev} className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition cursor-pointer">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button onClick={handleNext} className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition cursor-pointer">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-bold text-neutral-450">
            {miniWeekDays.map((wd, i) => <div key={i}>{wd}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
            {miniCalendarDays.map((day, idx) => {
              const isSel = day.toDateString() === currentDate.toDateString();
              const isCurrMonth = day.getMonth() === currentDate.getMonth();
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentDate(day)}
                  className={`h-6 w-6 mx-auto rounded-full flex items-center justify-center font-medium transition cursor-pointer ${
                    isSel 
                      ? "bg-blue-600 text-white font-bold" 
                      : isCurrMonth 
                        ? "text-neutral-755 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800" 
                        : "text-neutral-400 opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Calendars Toggles List */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-neutral-400 tracking-wider uppercase px-1">Calendars</div>
          <div className="space-y-2">
            {[
              { name: "Work", color: "#3b82f6" },
              { name: "Data Science Team", color: "#8b5cf6" },
              { name: "Data Science Core", color: "#10b981" },
              { name: "Personal", color: "#f59e0b" },
              { name: "Kids", color: "#ef4444" },
              { name: "Holidays", color: "#ec4899" },
            ].map((cat) => (
              <label key={cat.name} className="flex items-center gap-x-2.5 px-1 py-0.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={visibleCategories[cat.name] !== false}
                  onChange={() => setVisibleCategories({
                    ...visibleCategories,
                    [cat.name]: !visibleCategories[cat.name]
                  })}
                  className="rounded-sm border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="truncate">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Zones section */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-neutral-400 tracking-wider uppercase px-1">Time Zones</div>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-x-2.5 px-1 py-0.5 text-neutral-755 dark:text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showSecondaryTimeZone}
                onChange={(e) => setShowSecondaryTimeZone(e.target.checked)}
                className="rounded-sm border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
              />
              <span className="truncate">Secondary TZ</span>
            </label>
            {showSecondaryTimeZone && (
              <select
                value={secondaryTimeZone}
                onChange={(e) => setSecondaryTimeZone(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 rounded-md outline-hidden text-neutral-700 dark:text-neutral-300"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MIDDLE SCHEDULER BOARD */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Sub Header (Dashboard navigation & Control tools) */}
        <header className="h-[60px] border-b border-neutral-200 dark:border-neutral-800 px-6 flex items-center justify-between shrink-0 bg-white dark:bg-dark">
          {/* Active Date Title */}
          <div className="flex items-center gap-x-4">
            <h2 className="text-lg font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center border border-neutral-250 dark:border-neutral-750 rounded-lg p-0.5 bg-neutral-50 dark:bg-neutral-900/50">
              <button
                onClick={handlePrev}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2 py-0.5 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right section - View modes switcher & Search */}
          <div className="flex items-center gap-x-4">
            {/* View Mode switches */}
            <div className="flex items-center border border-neutral-250 dark:border-neutral-750 rounded-lg p-0.5 bg-neutral-50 dark:bg-neutral-900/50 text-xs font-semibold">
              <button 
                onClick={() => setViewMode("day")} 
                className={`px-3 py-1 rounded-md transition cursor-pointer ${viewMode === "day" ? "bg-white dark:bg-neutral-800 shadow-2xs font-bold text-blue-600 dark:text-blue-400" : ""}`}
              >
                Day
              </button>
              <button 
                onClick={() => setViewMode("week")} 
                className={`px-3 py-1 rounded-md transition cursor-pointer ${viewMode === "week" ? "bg-white dark:bg-neutral-800 shadow-2xs font-bold text-blue-600 dark:text-blue-400" : ""}`}
              >
                Week
              </button>
              <button 
                onClick={() => setViewMode("month")} 
                className={`px-3 py-1 rounded-md transition cursor-pointer ${viewMode === "month" ? "bg-white dark:bg-neutral-800 shadow-2xs font-bold text-blue-600 dark:text-blue-400" : ""}`}
              >
                Month
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative w-44">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 rounded-lg outline-hidden focus:ring-1 focus:ring-blue-500 text-neutral-700 dark:text-neutral-300"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Views Rendering */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex bg-white dark:bg-dark relative scrollbar-thin">
          
          {viewMode === "month" ? (
            <div className="flex-1 grid grid-cols-7 grid-rows-6 divide-x divide-y divide-neutral-200 dark:divide-neutral-800 min-h-[600px] bg-white dark:bg-dark">
              {miniCalendarDays.map((day, idx) => {
                const dayStr = getFormattedDateString(day);
                const dayEvents = eventsByDayAndHour[dayStr] || [];
                const isToday = new Date().toDateString() === day.toDateString();
                const isCurrMonth = day.getMonth() === currentDate.getMonth();

                return (
                  <div
                    key={idx}
                    onClick={() => handleOpenAddModal(day)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnDay(e, day)}
                    className={`p-2 min-h-[100px] flex flex-col justify-between hover:bg-neutral-50/20 dark:hover:bg-neutral-900/10 cursor-pointer transition ${
                      isCurrMonth ? "" : "opacity-35"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                        isToday ? "bg-red-500 text-white font-extrabold" : "text-neutral-550 dark:text-neutral-400"
                      }`}>
                        {day.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 mt-1.5 space-y-1 overflow-y-auto max-h-[75px] scrollbar-none">
                      {dayEvents.map((ev) => {
                        const colStyles = getPastelColorStyles(ev.color || "#3b82f6");
                        return (
                          <div
                            key={ev.id}
                            onClick={(e) => handleOpenEditModal(ev, e)}
                            draggable={!isSharingAvailability}
                            onDragStart={(e) => handleDragStart(e, ev)}
                            style={{ 
                              backgroundColor: colStyles.bg, 
                              borderColor: colStyles.border,
                              borderLeftColor: ev.color || "#3b82f6" 
                            }}
                            className="px-1.5 py-0.5 text-[9px] border border-l-4 rounded-md truncate font-semibold text-neutral-800 dark:text-neutral-100 hover:brightness-105 transition cursor-grab active:cursor-grabbing"
                          >
                            {ev.title || "Untitled"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {/* Time scale label column (left side of schedule) */}
              <div className="w-[60px] border-r border-neutral-200 dark:border-neutral-800 pt-[45px] shrink-0 text-[10px] text-neutral-400 dark:text-neutral-550 font-bold select-none text-right pr-3.5 space-y-[44px]">
                {hours.map((hr) => {
                  if (hr === 0) return <div key={hr} className="h-4">12 AM</div>;
                  const suffix = hr >= 12 ? "PM" : "AM";
                  const displayHr = hr > 12 ? hr - 12 : hr;
                  return (
                    <div key={hr} className="h-4">
                      {displayHr} {suffix}
                    </div>
                  );
                })}
              </div>

              {/* Secondary Time zone scale column (optional) */}
              {showSecondaryTimeZone && (
                <div className="w-[70px] border-r border-neutral-200 dark:border-neutral-800 pt-[45px] shrink-0 text-[10px] text-neutral-400 dark:text-neutral-550 font-bold select-none text-right pr-3.5 space-y-[44px]">
                  {hours.map((hr) => {
                    const date = new Date(currentDate);
                    date.setHours(hr, 0, 0, 0);
                    try {
                      const formatter = new Intl.DateTimeFormat("en-US", {
                        timeZone: secondaryTimeZone,
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      });
                      return (
                        <div key={hr} className="h-4 truncate" title={secondaryTimeZone}>
                          {formatter.format(date)}
                        </div>
                      );
                    } catch {
                      return <div key={hr} className="h-4">{hr}:00</div>;
                    }
                  })}
                </div>
              )}

              {/* Days content viewport */}
              <div className={`flex-1 grid ${viewMode === "day" ? "grid-cols-1" : "grid-cols-7"} divide-x divide-neutral-200 dark:divide-neutral-800`}>
                {displayDays.map((day, dIdx) => {
                  const dayStr = getFormattedDateString(day);
                  const dayEvents = eventsByDayAndHour[dayStr] || [];
                  const isToday = new Date().toDateString() === day.toDateString();

                  return (
                    <div key={dIdx} className="min-w-0 relative flex flex-col">
                      {/* Column Header Date Stamp */}
                      <div className="h-[45px] border-b border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center select-none py-1 bg-neutral-50/20 dark:bg-neutral-900/5">
                        <span className="text-[10px] uppercase font-bold text-neutral-450 dark:text-neutral-500">
                          {day.toLocaleDateString(undefined, { weekday: 'short' })}
                        </span>
                        <span className={`text-base font-extrabold rounded-full w-7 h-7 flex items-center justify-center mt-0.5 ${
                          isToday ? "bg-red-500 text-white shadow-xs" : "text-neutral-800 dark:text-neutral-200"
                        }`}>
                          {day.getDate()}
                        </span>
                      </div>

                      {/* Hourly rows block space */}
                      <div className="flex-1 relative min-h-[1440px]">
                        {/* Background line markings */}
                        {hours.map((hr) => {
                          const isSelectedSlot = selectedSlots.some(
                            (s) => s.day.toDateString() === day.toDateString() && s.hour === hr
                          );
                          return (
                            <div
                              key={hr}
                              onClick={() => handleSlotClick(day, hr)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDropOnHour(e, day, hr)}
                              className={`absolute left-0 right-0 h-[60px] border-b border-neutral-100 dark:border-neutral-900/50 hover:bg-neutral-50/20 dark:hover:bg-neutral-900/5 cursor-pointer transition ${
                                isSelectedSlot 
                                  ? "bg-blue-500/20 border-l-4 border-l-blue-500 hover:bg-blue-500/30" 
                                  : ""
                              }`}
                              style={{ top: `${hr * 60}px` }}
                            />
                          );
                        })}

                        {/* Draggable/Clickable event cards */}
                        {dayEvents.map((ev) => {
                          const start = new Date(ev.startTime);
                          const end = new Date(ev.endTime);
                          
                          const startMin = start.getHours() * 60 + start.getMinutes();
                          const endMin = end.getHours() * 60 + end.getMinutes();
                          const duration = endMin - startMin;

                          // Position event top/height coordinate dynamically
                          const top = startMin; 
                          const height = duration < 30 ? 30 : duration;
                          const colStyles = getPastelColorStyles(ev.color || "#3b82f6");

                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => handleOpenEditModal(ev, e)}
                              draggable={!isSharingAvailability}
                              onDragStart={(e) => handleDragStart(e, ev)}
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                backgroundColor: colStyles.bg,
                                borderColor: colStyles.border,
                                borderLeftWidth: "4px",
                                borderLeftColor: ev.color || "#3b82f6",
                              }}
                              className="absolute left-1 right-2 border rounded-lg p-2 text-xs flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-xs hover:scale-[1.01] hover:brightness-105 transition cursor-grab active:cursor-grabbing select-none"
                            >
                              <div className="font-bold truncate text-[11px] leading-tight text-neutral-900 dark:text-neutral-100">
                                {ev.title || "Untitled Event"}
                              </div>
                              {height > 40 && (
                                <div className="text-[9px] text-neutral-505 dark:text-neutral-450 mt-1 flex items-center gap-x-1 shrink-0">
                                  <Clock className="h-2.5 w-2.5" />
                                  <span>
                                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR PANE */}
      <aside className="w-[240px] border-l border-neutral-200 dark:border-neutral-800 flex flex-col p-4 space-y-6 shrink-0 bg-neutral-50/30 dark:bg-neutral-900/10">
        
        {/* Mini HUD */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-neutral-455 tracking-wider uppercase px-1">Upcoming</div>
          {(!events || events.length === 0) ? (
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-950/20 text-center space-y-3">
              <span className="text-3xl block">👋</span>
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">No events found</div>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-550 leading-relaxed">
                Your calendar is empty. Get started by adding events.
              </p>
            </div>
          ) : (
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-950/20 space-y-3">
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <span>Next meetings</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {events.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="text-[11px] p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-start justify-between">
                    <div>
                      <div className="font-bold truncate max-w-[130px]">{ev.title}</div>
                      <div className="text-[9px] text-neutral-400">{new Date(ev.startTime).toLocaleDateString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <span className="h-2 w-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: ev.color }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleOpenAddModal(new Date())}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-x-2"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Quick meet</span>
              </button>
              <button 
                onClick={() => {
                  setIsSharingAvailability(true);
                  setSelectedSlots([]);
                  toast.info("Click empty slots on the calendar to select availability");
                }}
                className="border border-neutral-250 dark:border-neutral-750 hover:bg-neutral-50 dark:hover:bg-neutral-855 rounded-lg py-2 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-x-2 text-neutral-750 dark:text-neutral-250"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Share slots</span>
              </button>
            </div>
            {events && events.length > 0 && (
              <button 
                onClick={handleClearAllEvents}
                className="w-full border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg py-2 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-x-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear all events</span>
              </button>
            )}
          </div>
        </div>

        {/* Shortcuts Guides panel */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-455 tracking-wider uppercase px-1">Useful shortcuts</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-x-1.5">
                <Keyboard className="h-3.5 w-3.5 text-neutral-400" />
                <span>Command menu</span>
              </span>
              <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-sm font-mono text-[9px] font-bold">Ctrl K</kbd>
            </div>
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-x-1.5">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                <span>Jump to Today</span>
              </span>
              <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-sm font-mono text-[9px] font-bold">T</kbd>
            </div>
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-x-1.5">
                <Globe className="h-3.5 w-3.5 text-neutral-400" />
                <span>Switch view</span>
              </span>
              <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-sm font-mono text-[9px] font-bold">W / D / M</kbd>
            </div>
          </div>
        </div>
      </aside>

      {/* Availability share panel */}
      {isSharingAvailability && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-750 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-x-6 z-[9999] animate-in slide-in-from-bottom duration-200">
          <div className="text-xs space-y-1">
            <div className="font-bold text-neutral-855 dark:text-neutral-150">Sharing Availability Mode</div>
            <div className="text-neutral-450 dark:text-neutral-500 font-medium">
              Selected <span className="font-bold text-blue-600 dark:text-blue-400">{selectedSlots.length}</span> slot{selectedSlots.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <button
              onClick={() => {
                if (selectedSlots.length === 0) {
                  toast.error("Please select at least one slot");
                  return;
                }
                const text = "Here is my availability:\n" + selectedSlots
                  .map((s) => {
                    const startHr = s.hour;
                    const endHr = s.hour + 1;
                    const dateStr = s.day.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });
                    const formatHr = (h: number) => {
                      const suffix = h >= 12 ? "PM" : "AM";
                      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                      return `${displayH}:00 ${suffix}`;
                    };
                    return `- ${dateStr}: ${formatHr(startHr)} - ${formatHr(endHr)}`;
                  })
                  .join("\n");
                navigator.clipboard.writeText(text);
                toast.success("Availability text copied to clipboard!");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-bold text-xs transition cursor-pointer shadow-xs"
            >
              Copy Slots
            </button>
            <button
              onClick={() => setSelectedSlots([])}
              className="border border-neutral-250 dark:border-neutral-750 rounded-lg px-3 py-2 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-850 transition cursor-pointer text-neutral-700 dark:text-neutral-300"
            >
              Clear
            </button>
            <button
              onClick={() => {
                setIsSharingAvailability(false);
                setSelectedSlots([]);
              }}
              className="bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg px-3 py-2 font-bold text-xs hover:bg-neutral-300 dark:hover:bg-neutral-700 transition cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Popover/Dialog Modal for Event Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[99999] flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                {editingEventId ? "Edit Event Details" : "Create New Event"}
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-505 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              
              {/* Event Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-455 dark:text-neutral-500">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Event title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden focus:ring-1 focus:ring-blue-500 text-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Event Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-455 dark:text-neutral-500">Description</label>
                <textarea
                  placeholder="Add details, notes, etc."
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden focus:ring-1 focus:ring-blue-500 text-neutral-800 dark:text-neutral-100 resize-none"
                />
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-2 gap-x-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-455 dark:text-neutral-500 font-bold">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden focus:ring-1 focus:ring-blue-500 text-neutral-800 dark:text-neutral-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-455 dark:text-neutral-500 font-bold">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden focus:ring-1 focus:ring-blue-500 text-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>

              {/* Color Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-455 dark:text-neutral-500 block mb-1">Color Tag</label>
                <div className="flex gap-x-2">
                  {[
                    { value: "#3b82f6", label: "Blue" },
                    { value: "#8b5cf6", label: "Purple" },
                    { value: "#10b981", label: "Green" },
                    { value: "#f59e0b", label: "Orange" },
                    { value: "#ef4444", label: "Red" },
                    { value: "#ec4899", label: "Pink" },
                  ].map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: col.value })}
                      style={{ backgroundColor: col.value }}
                      className={`h-6 w-6 rounded-full transition cursor-pointer ${
                        formData.color === col.value 
                          ? "ring-2 ring-neutral-400 dark:ring-neutral-200 ring-offset-2 dark:ring-offset-neutral-900 scale-110" 
                          : "opacity-80 hover:opacity-100"
                      }`}
                      title={col.label}
                    />
                  ))}
                </div>
              </div>

              {/* Meeting Link */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-455 dark:text-neutral-550 flex items-center gap-x-1">
                  <Video className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Meeting Link (Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://zoom.us/..."
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden focus:ring-1 focus:ring-blue-500 text-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Associated Page Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-455 dark:text-neutral-550 flex items-center gap-x-1">
                  <FileText className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Associate Note (Optional)</span>
                </label>
                <select
                  value={formData.documentId}
                  onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-hidden focus:ring-1 focus:ring-blue-500 text-neutral-800 dark:text-neutral-100"
                >
                  <option value="">None (Select a page)</option>
                  {(documents || []).map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.icon ? `${doc.icon} ` : ""}{doc.title || "Untitled"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Footer action buttons */}
              <div className="flex items-center justify-between pt-2">
                {editingEventId ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-x-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Event
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-neutral-250 dark:border-neutral-750 rounded-lg text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition cursor-pointer text-neutral-700 dark:text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
