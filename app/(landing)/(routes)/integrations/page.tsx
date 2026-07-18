import React, { useState } from "react";
import { Search, Compass, Cpu, MessageSquare, Briefcase, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntegrationsPage() {
  const integrations = [
    {
      name: "Slack",
      category: "Communication",
      description: "Receive notifications, updates, and previews about edits directly within your Slack channels.",
      icon: "💬",
    },
    {
      name: "GitHub",
      category: "Development",
      description: "Link GitHub issues, pull requests, and code branches to Zotion tasks and workspaces.",
      icon: "💻",
    },
    {
      name: "Figma",
      category: "Design",
      description: "Embed interactive Figma design files and canvas designs directly inside your Zotion documents.",
      icon: "🎨",
    },
    {
      name: "Google Calendar",
      category: "Productivity",
      description: "Synchronize your personal and shared calendar events into Zotion databases and pages.",
      icon: "📅",
    },
    {
      name: "Jira",
      category: "Management",
      description: "Create and track Jira issues from Zotion pages, keeping product managers in sync.",
      icon: "📊",
    },
    {
      name: "Zoom",
      category: "Communication",
      description: "Link Zoom video meetings to calendar events, tasks, and team workspace wikis.",
      icon: "📹",
    },
  ];

  const categories = ["All", "Communication", "Development", "Design", "Productivity", "Management"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = integrations.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight">Connect your favorite tools</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Bring your team's existing workflow directly into Zotion. Seamlessly embed, preview, and sync data.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-8 mb-12">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map((cat, idx) => (
              <Button
                key={idx}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full"
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-full text-sm bg-neutral-50/50 dark:bg-neutral-900/30 border-neutral-200 dark:border-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition duration-300 flex flex-col justify-between hover:scale-[1.01]"
            >
              <div>
                <div className="text-4xl mb-4 bg-white dark:bg-neutral-800 shadow-xs border border-neutral-200 dark:border-neutral-800 rounded-xl w-14 h-14 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-200 dark:bg-neutral-800 text-muted-foreground rounded-full">
                  {item.category}
                </span>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <Button variant="ghost" size="sm" className="w-full justify-center">
                  Connect Integration
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground">
              No integrations found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
