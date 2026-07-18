import React from "react";
import { Coffee, Compass, Smile, Sparkles } from "lucide-react";

export default function CulturePage() {
  const pillars = [
    {
      emoji: "☕",
      title: "Asynchronous by default",
      description: "We minimize unnecessary sync meetings. Instead, we write robust specifications, comment directly on code, and update tasks asynchronously.",
    },
    {
      emoji: "🎨",
      title: "Aesthetic Pride",
      description: "We are designers, writers, and pixel-perfectionists. Every shadow, color palette, transition, and border width is crafted with care.",
    },
    {
      emoji: "💡",
      title: "No-ego collaborations",
      description: "Ideas win, not hierarchies. We invite direct critique, participate in virtual show-and-tell sessions, and learn together as equals.",
    },
    {
      emoji: "🗺️",
      title: "Work-life harmony",
      description: "We believe working hard requires stepping away. We maintain strict respect for weekends, time zones, and personal disconnect hours.",
    },
  ];

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 py-16">
      <div className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground uppercase tracking-widest">
            Life at Zotion
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-6">
            A community built on <br /> autonomy, focus, and craft
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            We are a completely remote team of creators building a tool we love. Learn about our working guidelines, core culture pillars, and remote rituals.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {pillars.map((pil, idx) => (
            <div
              key={idx}
              className="p-6 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl flex gap-x-4 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition duration-300"
            >
              <span className="text-4xl shrink-0">{pil.emoji}</span>
              <div>
                <h3 className="font-bold text-lg mb-1">{pil.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{pil.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Culture statement */}
        <div className="bg-neutral-900 dark:bg-neutral-900/60 text-white rounded-3xl p-8 md:p-12 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Want to be part of our journey?</h2>
            <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">
              We are constantly seeking passionate designers, fullstack developers, support engineers, and technical writers. Take a look at our careers board.
            </p>
          </div>
          <a
            href="/careers"
            className="px-6 py-3 bg-white text-black text-xs font-semibold rounded-full hover:bg-neutral-200 transition duration-200 shrink-0 text-center"
          >
            Explore Open Roles
          </a>
        </div>
      </div>
    </div>
  );
}
