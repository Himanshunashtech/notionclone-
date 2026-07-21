"use client";

import { useState, useEffect } from "react";
import { useConvexAuth } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@/components/auth-components";
import { ArrowRight, FileText, Database, ShieldAlert, Sparkles, Sliders } from "lucide-react";
import Link from "next/link";

const words = [
  { text: "Create", bg: "bg-pink-100 dark:bg-pink-950/50", textCol: "text-pink-700 dark:text-pink-300", border: "border-pink-200/50", dot: "bg-pink-500" },
  { text: "Build", bg: "bg-emerald-100 dark:bg-emerald-950/50", textCol: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200/50", dot: "bg-emerald-500" },
  { text: "Jam", bg: "bg-amber-100 dark:bg-amber-950/50", textCol: "text-amber-700 dark:text-amber-300", border: "border-amber-200/50", dot: "bg-amber-500" },
  { text: "Scale", bg: "bg-indigo-100 dark:bg-indigo-950/50", textCol: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200/50", dot: "bg-indigo-500" }
];

export const Features = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentWord = words[index];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-16 space-y-24">
      
      {/* Think Together Section (Matches User's Request Image) */}
      <div className="flex flex-col items-center text-center space-y-6">
        
        {/* Overlapping Avatar Row */}
        <div className="flex items-center justify-center pl-4 py-2">
          {/* Avatar 1: Blue circle with a face */}
          <div className="w-16 h-16 rounded-full border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center -ml-4 first:ml-0 overflow-hidden shadow-md transition hover:scale-110 duration-200">
            <svg className="w-9 h-9 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>

          {/* Avatar 2: Gray circle with eyes */}
          <div className="w-16 h-16 rounded-full border-2 border-neutral-400 bg-white dark:bg-neutral-800 flex items-center justify-center -ml-4 overflow-hidden shadow-md transition hover:scale-110 duration-200">
            <svg className="w-9 h-9 text-neutral-700 dark:text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="11" r="1.5" fill="currentColor" />
              <circle cx="15" cy="11" r="1.5" fill="currentColor" />
              <path d="M9 15.5c1.5 1 4.5 1 6 0" strokeLinecap="round" />
            </svg>
          </div>

          {/* Avatar 3: Red circle with flag */}
          <div className="w-16 h-16 rounded-full border-2 border-red-500 bg-red-50 dark:bg-red-950/40 flex items-center justify-center -ml-4 overflow-hidden shadow-md transition hover:scale-110 duration-200">
            <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-3.478-3.97m-14.699 4l3.149-.741a9 9 0 016.087.71l.1.05a9 9 0 006.209.682L21 15v-1.5m0 0a48.536 48.536 0 00-3.478-3.97m0 0A9 9 0 0112 10.125H9.75" />
            </svg>
          </div>

          {/* Avatar 4: Yellow/Orange circle with classic face */}
          <div className="w-16 h-16 rounded-full border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/40 flex items-center justify-center -ml-4 overflow-hidden shadow-md transition hover:scale-110 duration-200">
            <svg className="w-9 h-9 text-yellow-600 dark:text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
              <line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeWidth="2" />
              <line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>

          {/* Avatar 5: Neutral circle with neutral look */}
          <div className="w-16 h-16 rounded-full border-2 border-neutral-400 bg-white dark:bg-neutral-800 flex items-center justify-center -ml-4 overflow-hidden shadow-md transition hover:scale-110 duration-200">
            <svg className="w-9 h-9 text-neutral-600 dark:text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 9h.01M16 9h.01M9 15h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Avatar 6: Blue circle with document/folder symbol */}
          <div className="w-16 h-16 rounded-full border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center -ml-4 overflow-hidden shadow-md transition hover:scale-110 duration-200">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>

        </div>

        {/* Headline */}
        <h2 className="text-4xl font-bold sm:text-5xl tracking-tight max-w-2xl text-neutral-800 dark:text-neutral-100">
          Where teams and agents{" "}
          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border shadow-sm transition-all duration-550 ${currentWord.bg} ${currentWord.textCol} ${currentWord.border}`}>
            <span className={`w-2.5 h-2.5 rounded-full inline-block ${currentWord.dot}`}></span>
            {currentWord.text}
          </span>{" "}
          together.
        </h2>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground max-w-xl">
          Capture context, find answers, and automate tasks with AI built for your team.
        </p>
      </div>

      {/* Zotion Features Sections Grid */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold sm:text-3xl">Workspace Capabilities</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Discover the premium features built directly into your connected Zotion editor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Rich Editor */}
          <div className="group border rounded-2xl p-6 bg-card/40 hover:bg-card hover:shadow-md transition duration-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-lg">Rich Document Editor</h4>
              <p className="text-sm text-muted-foreground">
                Write documents with real-time text styles, nested headers, bullet items, block formatting, and more.
              </p>
            </div>
            <div className="text-xs font-semibold text-indigo-500 mt-4 group-hover:translate-x-1 transition duration-150 flex items-center gap-1">
              Interactive blocknote editor <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 2: Supabase Storage */}
          <div className="group border rounded-2xl p-6 bg-card/40 hover:bg-card hover:shadow-md transition duration-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-lg">Storage Bucket Manager</h4>
              <p className="text-sm text-muted-foreground">
                Directly create storage buckets, upload profile photos or assets, and delete files inside Supabase Storage.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-500 mt-4 group-hover:translate-x-1 transition duration-150 flex items-center gap-1">
              Supabase powered storage <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          {/* Card 3: Flexible Font Customization */}
          <div className="group border rounded-2xl p-6 bg-card/40 hover:bg-card hover:shadow-md transition duration-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                <Sliders className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-lg">Editor customizer</h4>
              <p className="text-sm text-muted-foreground">
                Customize layout attributes dynamically including custom cover page backgrounds, emoji icons, full-width formats, and font choices.
              </p>
            </div>
            <div className="text-xs font-semibold text-amber-500 mt-4 group-hover:translate-x-1 transition duration-150 flex items-center gap-1">
              Zustand settings modal <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="border rounded-3xl p-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 text-center space-y-6">
        <h3 className="text-2xl font-bold">Ready to take control of your knowledge base?</h3>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Start publishing clean pages, sharing previews publicly, and orchestrating documents instantly.
        </p>
        <div>
          {isAuthenticated && !isLoading ? (
            <Button asChild size="lg">
              <Link href="/documents">
                Go to Workspace <ArrowRight className="ml-2 h-4.5 w-4.5" />
              </Link>
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button size="lg" className="flex items-center gap-2 mx-auto">
                Get started today <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
      
    </div>
  );
};
