import React from "react";
import { Sparkles, FileText, Share2, Shield, Calendar, Kanban, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OverviewPage() {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-sky-500" />,
      title: "Document Editor",
      description: "A rich, real-time block-based editor supporting emojis, code blocks, drag-and-drop, and nested pages.",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-amber-500" />,
      title: "AI Assistant",
      description: "Generate, autocomplete, summarize, and translate your text inline with Zotion AI.",
    },
    {
      icon: <Kanban className="h-8 w-8 text-emerald-500" />,
      title: "Project Management",
      description: "Organize your workflow using built-in interactive databases, tasks list, and project boards.",
    },
    {
      icon: <Share2 className="h-8 w-8 text-indigo-500" />,
      title: "Instant Publishing",
      description: "Share your documents instantly with a public link, acting as a clean web page for anyone.",
    },
    {
      icon: <Calendar className="h-8 w-8 text-rose-500" />,
      title: "Workspaces & Wikis",
      description: "Consolidate all tribal knowledge in one beautiful, hierarchical sidebar structure.",
    },
    {
      icon: <Shield className="h-8 w-8 text-violet-500" />,
      title: "Secure Collaborations",
      description: "Enterprise-grade safety with detailed workspace permissions and data encryption.",
    },
  ];

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-x-2 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full text-xs font-medium text-muted-foreground mb-6">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>Introducing Zotion AI Autocomplete</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-neutral-600 to-muted-foreground bg-clip-text text-transparent dark:from-white dark:via-neutral-400 dark:to-neutral-600 leading-none">
          A workspace that <br className="hidden sm:inline" /> adapts to you
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Zotion is the connected workspace where better, faster work happens. Plan, write, collaborate, and get organized — all in one tool.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/documents" className="flex items-center gap-x-2">
              Get Zotion free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">View Plans</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-bold">Everything you need, in one place</h2>
          <p className="mt-3 text-muted-foreground">
            No more switching tabs. Connect your docs, tasks, and notes seamlessly.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 hover:shadow-lg dark:hover:bg-neutral-900/50 transition duration-300 flex flex-col gap-y-4 hover:scale-[1.02]"
            >
              <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl w-fit shadow-xs">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
