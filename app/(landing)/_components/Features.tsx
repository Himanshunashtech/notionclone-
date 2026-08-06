"use client";

import { useState, useEffect } from "react";
import { useConvexAuth } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@/components/auth-components";
import {
  ArrowRight,
  FileText,
  Database,
  Sparkles,
  Sliders,
  Users,
  Calendar,
  Search,
  BookOpen,
  LayoutDashboard,
  Mic,
  BarChart2,
  Star,
  FolderKanban,
  Globe,
  CheckSquare,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";

const words = [
  { text: "Create", bg: "bg-pink-100 dark:bg-pink-950/50", textCol: "text-pink-700 dark:text-pink-300", border: "border-pink-200/50", dot: "bg-pink-500" },
  { text: "Build", bg: "bg-emerald-100 dark:bg-emerald-950/50", textCol: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200/50", dot: "bg-emerald-500" },
  { text: "Jam", bg: "bg-amber-100 dark:bg-amber-950/50", textCol: "text-amber-700 dark:text-amber-300", border: "border-amber-200/50", dot: "bg-amber-500" },
  { text: "Scale", bg: "bg-indigo-100 dark:bg-indigo-950/50", textCol: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200/50", dot: "bg-indigo-500" },
];

const myApps = [
  {
    icon: Users,
    title: "Teamspace",
    description:
      "Collaborative shared workspaces for your entire team. Create named teamspaces with pre-seeded Projects, Meetings, Docs, Tasks, Goals, and Brainstorming sessions — all auto-structured and ready to use.",
    badge: "Collaboration",
    features: ["Auto-seeded databases", "Shared documents", "Projects & Goals tracking", "Hide/show sections"],
    cta: "Explore Teamspaces",
  },
  {
    icon: BookOpen,
    title: "Project Wiki",
    description:
      "Build living knowledge bases and project documentation wikis. Organize nested hierarchical pages, embed database views, link to related documents, and maintain always-up-to-date specs and guides.",
    badge: "Knowledge Base",
    features: ["Infinite nested pages", "Wiki page types", "Embed databases", "Linked references"],
    cta: "Build a Wiki",
  },
  {
    icon: Calendar,
    title: "Calendar & Timeline",
    description:
      "Schedule tasks, events, and sprints visually with the built-in Calendar view. Use the mini hover-panel calendar directly in the sidebar for quick date navigation, or the full calendar page for rich planning.",
    badge: "Planning",
    features: ["Full calendar page", "Timeline planner", "Sidebar hover panel", "Event scheduling"],
    cta: "Open Calendar",
  },
  {
    icon: FileText,
    title: "Rich Document Editor",
    description:
      "Write beautifully with the BlockNote-powered block editor. Supports headings, bullet lists, callouts, code blocks, images, dividers, and more — all with smooth drag-and-drop reordering.",
    badge: "Editor",
    features: ["BlockNote block editor", "Drag-and-drop blocks", "Custom icons & covers", "Font & width options"],
    cta: "Start Writing",
  },
  {
    icon: Database,
    title: "Powerful Database Views",
    description:
      "Transform your data into meaningful views. Switch between Table, Kanban Board, Chart/Analytics, List/Todo, Calendar, and Timeline views — all from the same dataset with live property editing.",
    badge: "Database",
    features: ["Table & Kanban views", "SVG Charts & Analytics", "Calendar & Timeline", "Custom properties"],
    cta: "Explore Databases",
  },
  {
    icon: Search,
    title: "Quick Search",
    description:
      "Find any page, document, or wiki instantly using the global search command palette (Ctrl+K). Fuzzy-search across your entire workspace and jump directly to what you need.",
    badge: "Search",
    features: ["Global command palette", "Ctrl+K shortcut", "Workspace-wide search", "Instant navigation"],
    cta: "Search Everything",
  },
  {
    icon: BarChart2,
    title: "Analytics & Charts",
    description:
      "Visualize your database data with live SVG Pie Charts and Bar Charts. Supports interactive tooltips, value distributions, and statistical aggregates like Sum, Average, Min, and Max.",
    badge: "Analytics",
    features: ["SVG Pie & Bar charts", "Interactive tooltips", "Statistical aggregates", "Select/number columns"],
    cta: "View Analytics",
  },
  {
    icon: Mic,
    title: "Meeting Transcription",
    description:
      "Record and transcribe meetings directly in Zotion. AI-powered transcription captures everything, organized by speaker and timestamp, so your team never misses an action item.",
    badge: "AI Feature",
    features: ["Live transcription", "Speaker detection", "Timestamped notes", "Export to doc"],
    cta: "Transcribe Meetings",
  },
  {
    icon: Sliders,
    title: "Editor Customizer",
    description:
      "Personalize your workspace exactly how you like it. Choose from multiple fonts, toggle full-width layout, set custom cover images, pick emoji icons, and switch between light and dark modes.",
    badge: "Customization",
    features: ["Custom fonts", "Cover images", "Emoji icons", "Full-width mode"],
    cta: "Customize Now",
  },
];

const statsItems = [
  { value: "9+", label: "Core Apps" },
  { value: "6+", label: "Database Views" },
  { value: "∞", label: "Nested Pages" },
  { value: "100%", label: "Free to Use" },
];

export const Features = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [index, setIndex] = useState(0);
  const [hoveredApp, setHoveredApp] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentWord = words[index];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16 space-y-28">

      {/* ── Think Together Section ── */}
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Overlapping Avatars */}
        <div className="flex items-center justify-center pl-4 py-2">
          {[
            {
              border: "border-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40", icon: (
                <svg className="w-9 h-9 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )
            },
            {
              border: "border-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40", icon: (
                <svg className="w-9 h-9 text-violet-600 dark:text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="11" r="1.5" fill="currentColor" />
                  <circle cx="15" cy="11" r="1.5" fill="currentColor" />
                  <path d="M9 15.5c1.5 1 4.5 1 6 0" strokeLinecap="round" />
                </svg>
              )
            },
            {
              border: "border-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40", icon: (
                <svg className="w-8 h-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-3.478-3.97m-14.699 4l3.149-.741a9 9 0 016.087.71l.1.05a9 9 0 006.209.682L21 15v-1.5m0 0a48.536 48.536 0 00-3.478-3.97m0 0A9 9 0 0112 10.125H9.75" />
                </svg>
              )
            },
            {
              border: "border-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40", icon: (
                <svg className="w-9 h-9 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
                  <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeWidth="2" />
                  <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeWidth="2" />
                </svg>
              )
            },
            {
              border: "border-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40", icon: (
                <svg className="w-9 h-9 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 9h.01M16 9h.01M9 15h6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )
            },
            {
              border: "border-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/40", icon: (
                <svg className="w-8 h-8 text-cyan-600 dark:text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              )
            },
          ].map((av, i) => (
            <div key={i} className={`w-14 h-14 rounded-full border-2 ${av.border} ${av.bg} flex items-center justify-center -ml-3 first:ml-0 overflow-hidden shadow-md transition hover:scale-110 duration-200 hover:z-10 relative`}>
              {av.icon}
            </div>
          ))}
        </div>

        <h2 className="text-4xl font-bold sm:text-5xl tracking-tight max-w-2xl text-neutral-800 dark:text-neutral-100">
          Where teams and agents{" "}
          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border shadow-sm transition-all duration-500 ${currentWord.bg} ${currentWord.textCol} ${currentWord.border}`}>
            <span className={`w-2.5 h-2.5 rounded-full inline-block ${currentWord.dot}`}></span>
            {currentWord.text}
          </span>{" "}
          together.
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl">
          Capture context, find answers, and automate tasks with AI built for your team.
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsItems.map((stat, i) => (
          <div key={i} className="border rounded-2xl p-5 bg-card/40 text-center hover:bg-card hover:shadow-sm transition duration-200">
            <p className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── My Apps Section ── */}
      <div className="space-y-10" id="my-apps">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            All Apps Included
          </div>
          <h3 className="text-3xl font-bold sm:text-4xl tracking-tight">Everything in your workspace</h3>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Zotion is more than a document editor — it&apos;s a full suite of connected apps that work together seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myApps.map((app, i) => {
            const Icon = app.icon;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredApp(i)}
                onMouseLeave={() => setHoveredApp(null)}
                className="group relative border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 bg-neutral-100/70 dark:bg-neutral-900/60 hover:bg-neutral-200/70 dark:hover:bg-neutral-850 hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-default overflow-hidden"
              >
                <div className="space-y-4 relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="h-11 w-11 bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-200/60 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      {app.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{app.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      {app.description}
                    </p>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-1.5 mt-2">
                    {app.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-neutral-400 dark:bg-neutral-500"></span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-5 group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-1 relative z-10">
                  {app.cta} <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200/70 dark:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300 text-xs font-semibold border border-neutral-300 dark:border-neutral-700 mb-2">
            <LayoutDashboard className="h-3.5 w-3.5" />
            How It Works
          </div>
          <h3 className="text-3xl font-bold sm:text-4xl tracking-tight">Set up in seconds</h3>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Zotion guides you through onboarding and auto-seeds your workspace with everything you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: Globe,
              title: "Sign In",
              desc: "Use Google or GitHub OAuth to instantly create your account — no password required.",
            },
            {
              step: "02",
              icon: FolderKanban,
              title: "Name Your Teamspace",
              desc: "Zotion auto-creates your workspace with Projects, Tasks, Docs, Meetings, Goals, and more.",
            },
            {
              step: "03",
              icon: CheckSquare,
              title: "Start Working",
              desc: "Write notes, manage databases, schedule tasks, and collaborate — all from one connected place.",
            },
          ].map((step, i) => (
            <div key={i} className="relative border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 bg-neutral-100/70 dark:bg-neutral-900/60 hover:bg-neutral-200/70 dark:hover:bg-neutral-850 hover:shadow-md transition duration-200 text-center group">
              <div className="w-12 h-12 bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                <step.icon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black text-muted-foreground/50 tracking-widest uppercase">{step.step}</span>
              <h4 className="font-bold text-lg mt-1">{step.title}</h4>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Call to Action Banner ── */}
      <div className="relative border rounded-3xl p-10 overflow-hidden text-center space-y-6">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-primary/12 to-violet-500/8 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <Star className="h-3.5 w-3.5 fill-current" />
            Free Forever
          </div>
          <h3 className="text-2xl font-bold sm:text-3xl">Ready to take control of your knowledge base?</h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Start publishing clean pages, managing teams, and orchestrating documents instantly — for free.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {isAuthenticated && !isLoading ? (
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/documents">
                  Go to Workspace <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button size="lg" className="rounded-xl flex items-center gap-2">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
