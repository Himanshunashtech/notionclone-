import React from "react";
import { Download, Mail, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PressPage() {
  const releases = [
    {
      date: "July 15, 2026",
      title: "Zotion launches Zotion AI for all desktop and enterprise users",
      category: "Product Launch",
      excerpt: "Zotion AI autocomplete commands are now fully integrated across database tables and custom templates, bringing productivity to a higher level.",
    },
    {
      date: "April 10, 2026",
      title: "Zotion reaches 5 million collaborative workspaces globally",
      category: "Corporate Milestone",
      excerpt: "Rapid growth in startups and remote teams fuels the global adoption of Zotion as their primary source of collaborative wikis and docs.",
    },
    {
      date: "January 8, 2026",
      title: "Zotion announces seed funding to build the next-gen doc interface",
      category: "Financials",
      excerpt: "Capital injection will support engineering hires, global server speeds, and the development of offline synchronization.",
    },
  ];

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 pt-4 pb-16">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground uppercase tracking-widest">
            Press Room
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-6">
            News, milestones, and brand assets
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Read our latest news announcements or download official logos, screenshots, and visual media materials.
          </p>
        </div>

        {/* Brand Assets */}
        <div className="bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 mb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Media & Brand Kit</h2>
              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                Download high-resolution logos (light/dark theme versions), custom screenshots, and headshots of the Zotion founding team.
              </p>
            </div>
            <Button className="flex items-center gap-x-2 shrink-0">
              <Download className="h-4 w-4" /> Download Brand Kit (.ZIP)
            </Button>
          </div>
        </div>

        {/* Press Releases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="md:col-span-2 flex flex-col gap-y-8">
            <h2 className="text-2xl font-bold mb-4">Latest Press Releases</h2>
            {releases.map((rel, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col gap-y-3">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-x-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {rel.date}
                  </span>
                  <span className="font-semibold bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">{rel.category}</span>
                </div>
                <h3 className="font-bold text-lg leading-tight hover:text-sky-500 transition duration-200 cursor-pointer">{rel.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{rel.excerpt}</p>
              </div>
            ))}
          </div>

          {/* Contact Box */}
          <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl h-fit">
            <h3 className="font-bold text-lg mb-2">Press Contact</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              For press inquiries, interview requests, or speaking opportunities, please contact our PR team.
            </p>
            <div className="flex items-center gap-x-2 text-sm font-semibold text-sky-500">
              <Mail className="h-4 w-4" />
              <a href="mailto:press@zotion.com">press@zotion.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
