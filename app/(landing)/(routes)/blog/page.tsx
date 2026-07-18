import React, { useState } from "react";
import { Search, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPage() {
  const posts = [
    {
      title: "How to organize your team wiki: a masterclass guide",
      category: "Productivity",
      author: "Sarah Jenkins",
      date: "July 12, 2026",
      readTime: "6 min read",
      excerpt: " tribal knowledge shouldn't live in chats or scattered drive folders. Learn the core layout systems to build an organic wiki for your department.",
      image: "📖",
    },
    {
      title: "Behind the design: Zotion's new nested sidebar navigation",
      category: "Design",
      author: "Alex Rivera",
      date: "June 28, 2026",
      readTime: "8 min read",
      excerpt: "Our engineering and design teams share the iterative steps taken to code highly responsive sidebar drag-and-drops without sacrificing mobile scroll stability.",
      image: "🎨",
    },
    {
      title: "Boosting development velocities with custom database workflows",
      category: "Engineering",
      author: "Michael Chen",
      date: "May 15, 2026",
      readTime: "10 min read",
      excerpt: "Discover how our product teams coordinate code releases, link bug trackers, and review design specifications inside integrated Zotion databases.",
      image: "💻",
    },
    {
      title: "Designing remote-friendly onboarding documentation",
      category: "Productivity",
      author: "Emily Watson",
      date: "April 02, 2026",
      readTime: "5 min read",
      excerpt: "Help new hires feel integrated from Day 1. Learn standard layout templates for remote onboarding packets, manuals, and workspace tutorials.",
      image: "🤝",
    },
  ];

  const categories = ["All", "Productivity", "Design", "Engineering"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = posts.filter((post) => selectedCategory === "All" || post.category === selectedCategory);

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight">The Zotion Blog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Stories, guides, and insights about product updates, remote work, organization tips, and design.
          </p>
        </div>

        {/* Categories bar */}
        <div className="flex gap-2 justify-center mb-12 border-b border-neutral-200 dark:border-neutral-800 pb-6">
          {categories.map((cat, idx) => (
            <Button
              key={idx}
              variant={selectedCategory === cat ? "default" : "ghost"}
              onClick={() => setSelectedCategory(cat)}
              className="rounded-full"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((post, idx) => (
            <div
              key={idx}
              className="group cursor-pointer p-6 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl hover:shadow-lg transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="text-5xl mb-6 bg-white dark:bg-neutral-800 shadow-xs border border-neutral-200 dark:border-neutral-800 rounded-2xl w-16 h-16 flex items-center justify-center group-hover:scale-105 transition duration-300">
                  {post.image}
                </div>
                <div className="flex gap-x-3 items-center text-xs text-muted-foreground mb-3">
                  <span className="font-bold text-sky-500 uppercase tracking-wider">{post.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-x-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-sky-500 transition duration-200 mb-3">
                  {post.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              </div>

              {/* Author bar */}
              <div className="flex items-center gap-x-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="bg-neutral-200 dark:bg-neutral-850 p-2 rounded-full">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{post.author}</p>
                  <p className="text-[10px] text-muted-foreground">{post.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
