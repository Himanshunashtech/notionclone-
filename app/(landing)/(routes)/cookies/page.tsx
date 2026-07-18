import React, { useState } from "react";
import { ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiesPage() {
  const [cookiePrefs, setCookiePrefs] = useState({
    essential: true, // Always true
    analytics: true,
    marketing: false,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 py-16">
      <div className="mx-auto max-w-3xl px-6">
        
        {/* Intro */}
        <div className="mb-12">
          <div className="flex items-center gap-x-2 text-sky-500 mb-4">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Privacy Settings</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Cookie Preferences</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Configure how Zotion handles analytics tracking and personalized marketing cookies. Essential cookies are necessary for page loading and cannot be disabled.
          </p>
        </div>

        {/* Saved Alert Banner */}
        {saved && (
          <div className="p-4 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl mb-6 flex items-center gap-x-2 text-sm font-semibold transition duration-300">
            <Info className="h-4 w-4" />
            Preferences saved successfully!
          </div>
        )}

        {/* Options List */}
        <div className="space-y-6 mb-10">
          
          {/* Essential */}
          <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="font-bold text-base mb-1">Essential Cookies</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                These cookies are necessary for core features, such as secure logins, setting system theme selections, database loading, and caching editor sessions.
              </p>
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase px-3 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-full">
              Required
            </span>
          </div>

          {/* Analytics */}
          <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="font-bold text-base mb-1">Performance & Analytics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We use these to measure how users interact with pages, count unique visitors, monitor loading speed, and detect application errors to optimize features.
              </p>
            </div>
            <button
              onClick={() => setCookiePrefs((prev) => ({ ...prev, analytics: !prev.analytics }))}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-350 shrink-0 ${
                cookiePrefs.analytics ? "bg-sky-500 justify-end" : "bg-neutral-300 dark:bg-neutral-700 justify-start"
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-xs" />
            </button>
          </div>

          {/* Marketing */}
          <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="font-bold text-base mb-1">Marketing Cookies</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Used to deliver relative ads on third-party channels, evaluate promotional campaigns, and understand which marketing sites brought users to Zotion.
              </p>
            </div>
            <button
              onClick={() => setCookiePrefs((prev) => ({ ...prev, marketing: !prev.marketing }))}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-350 shrink-0 ${
                cookiePrefs.marketing ? "bg-sky-500 justify-end" : "bg-neutral-300 dark:bg-neutral-700 justify-start"
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-xs" />
            </button>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button onClick={handleSave}>Save Preferences</Button>
          <Button
            variant="outline"
            onClick={() => {
              setCookiePrefs({ essential: true, analytics: true, marketing: true });
              handleSave();
            }}
          >
            Accept All
          </Button>
        </div>

      </div>
    </div>
  );
}
