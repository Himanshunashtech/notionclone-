import React from "react";
import { Kanban, Sparkles, Layers, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RoadmapPage() {
  const columns = [
    {
      title: "In Progress",
      color: "bg-amber-500",
      items: [
        {
          title: "Offline Sync Support",
          description: "Enable full access and editor updates offline, auto-syncing when back online.",
          votes: 342,
        },
        {
          title: "Mobile App Redesign",
          description: "A complete overhaul of our iOS and Android mobile app interfaces for smoother gestures.",
          votes: 219,
        },
      ],
    },
    {
      title: "Up Next",
      color: "bg-sky-500",
      items: [
        {
          title: "Interactive Charts & Graphs",
          description: "Convert databases directly into dashboards with custom pie, bar, and line charts.",
          votes: 512,
        },
        {
          title: "Custom Domain Publishing",
          description: "Point any published Zotion page to your own custom domain (e.g. docs.yourcompany.com).",
          votes: 493,
        },
        {
          title: "Multiplayer Cursor Chat",
          description: "Type comments directly at your cursor to quickly chat with active team editors.",
          votes: 184,
        },
      ],
    },
    {
      title: "Planned",
      color: "bg-emerald-500",
      items: [
        {
          title: "Advanced Permissions (Groups)",
          description: "Organize users into permission groups for simplified enterprise access management.",
          votes: 277,
        },
        {
          title: "Zotion AI Voice Dictation",
          description: "Dictate transcripts directly into Zotion pages and let AI format it as clean summaries.",
          votes: 409,
        },
      ],
    },
  ];

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight">Product Roadmap</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A transparent look into what we are building, what is planned next, and where the product is heading.
          </p>
        </div>

        {/* Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {columns.map((column, colIdx) => (
            <div
              key={colIdx}
              className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col gap-y-6"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-x-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-lg">{column.title}</h3>
                </div>
                <span className="text-xs bg-neutral-200 dark:bg-neutral-800 text-muted-foreground px-2 py-0.5 rounded-full font-bold">
                  {column.items.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex flex-col gap-y-4">
                {column.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs hover:shadow-md transition duration-200 flex flex-col gap-y-3"
                  >
                    <h4 className="font-semibold text-base leading-snug">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-x-1">
                        <Vote className="h-3 w-3" />
                        {item.votes} votes
                      </span>
                      <Button variant="ghost" size="sm" className="h-7 px-2.5 text-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        Upvote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
