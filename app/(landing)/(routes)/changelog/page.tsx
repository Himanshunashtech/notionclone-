import React from "react";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ChangelogPage() {
  const updates = [
    {
      date: "July 2026",
      version: "v2.5.0",
      title: "Mobile Responsiveness & Real-Time Performance Tuning",
      description: "Enjoy zero-lag typing inside all document inputs by deferring database updates to blur/Enter. Bulk select and delete pages directly from the Library, and navigate seamlessly with new mobile-responsive layouts for project boards, table views, and meeting transcriptions.",
      tags: ["Performance", "Library", "Mobile", "Aesthetics"],
    },
    {
      date: "July 2026",
      version: "v2.4.0",
      title: "Introduce Tabbed Layouts & Custom Cover Presets",
      description: "Manage multiple views and pages in workspace tabs. Plus, upload or select from curated aesthetic covers with ease.",
      tags: ["Workspace", "Editor", "Aesthetics"],
    },
    {
      date: "June 2026",
      version: "v2.3.0",
      title: "Zotion AI Autocomplete & Command Actions",
      description: "Trigger AI inside the editor by pressing '/' and selecting the AI command. Real-time completions are now 2x faster.",
      tags: ["AI", "Performance"],
    },
    {
      date: "May 2026",
      version: "v2.2.0",
      title: "Advanced Database Views and Filters",
      description: "Filter and sort your databases using custom operators. Export view summaries as CSV or PDF instantly.",
      tags: ["Database", "Export"],
    },
    {
      date: "April 2026",
      version: "v2.1.0",
      title: "Collaborative Syncing & Presence Indicators",
      description: "See exactly who is editing what with avatar presence in the top navigation panel. Zero lag document edits.",
      tags: ["Collaboration", "Realtime"],
    },
  ];

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 pt-4 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            What's new in Zotion. Follow our product updates and feature enhancements.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-4 md:ml-32 pl-8 space-y-16">
          {updates.map((update, idx) => (
            <div key={idx} className="relative">
              {/* Date Column (Hidden on small screens) */}
              <div className="absolute -left-[144px] top-1 hidden md:block w-28 text-right">
                <span className="text-sm font-semibold text-muted-foreground">{update.date}</span>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{update.version}</p>
              </div>

              {/* Dot indicator */}
              <span className="absolute -left-[37px] top-1 bg-white dark:bg-neutral-900 border-2 border-neutral-400 dark:border-neutral-700 rounded-full w-4 h-4 flex items-center justify-center" />

              {/* Content */}
              <div>
                {/* Mobile Date */}
                <div className="md:hidden flex items-center gap-x-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  <span>{update.date}</span>
                  <span>•</span>
                  <span>{update.version}</span>
                </div>

                <h3 className="text-2xl font-bold leading-tight hover:text-neutral-700 dark:hover:text-neutral-300 transition duration-200 cursor-pointer">
                  {update.title}
                </h3>

                <div className="flex flex-wrap gap-2 my-4">
                  {update.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground flex items-center gap-x-1"
                    >
                      <Tag className="h-2 w-2" />
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-2xl">
                  {update.description}
                </p>

                <div className="mt-6">
                  <Link
                    href="#"
                    className="inline-flex items-center gap-x-1 text-sm font-semibold text-sky-500 hover:text-sky-600 transition"
                  >
                    Read full release notes <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
