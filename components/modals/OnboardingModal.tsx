"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/hooks/useOnboardingModal";
import { Building2, Users, Sparkles, ArrowRight } from "lucide-react";

export const OnboardingModal = () => {
  const onboarding = useOnboarding();
  const [teamName, setTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = teamName.trim();
    if (!name) return;
    setIsLoading(true);
    try {
      await onboarding.onComplete(name);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={onboarding.isOpen} onOpenChange={() => { }}>
      <DialogTitle className="sr-only">Welcome Onboarding</DialogTitle>
      <DialogDescription className="sr-only">
        Set up your first teamspace by entering your team name.
      </DialogDescription>
      <DialogContent
        className="max-w-md p-0 overflow-hidden border-0 shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white">
          {/* Top illustration area */}
          <div className="relative px-8 pt-10 pb-6 flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center shadow-lg shadow-black/50 p-2.5 border border-white/10">
                <img src="/logo-dark.svg" className="h-full w-full object-contain" alt="Zotion Logo" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="h-3 w-3" />
              Welcome to Zotion
            </div>

            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Name your team space
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              This will be your team's home — Projects, Meetings, Docs, Tasks, and Goals will be set up automatically inside it.
            </p>
          </div>

          {/* Features preview */}
          <div className="mx-8 mb-6 grid grid-cols-3 gap-2">
            {[
              { icon: "🍻", label: "Projects" },
              { icon: "🍺", label: "Meetings" },
              { icon: "🥂", label: "Docs" },
              { icon: "🍹", label: "Tasks" },
              { icon: "🍷", label: "Brainstorm" },
              { icon: "🍾", label: "Goals" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-2"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-[10px] text-neutral-400 font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-neutral-500" />
                  Team space name
                </label>
                <Input
                  ref={inputRef}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. My Team, Acme Corp, Design Studio…"
                  className="bg-white/10 border-white/15 text-white placeholder:text-neutral-500 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 h-11"
                  autoFocus
                  maxLength={80}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold border-0 shadow-lg shadow-blue-500/20 transition-all"
                disabled={!teamName.trim() || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up your space…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create my team space
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
