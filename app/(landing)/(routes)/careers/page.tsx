import React from "react";
import { Briefcase, MapPin, Globe, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CareersPage() {
  const roles = [
    {
      title: "Senior Fullstack Engineer",
      team: "Product & Core Systems",
      location: "Remote (Global)",
      type: "Full-time",
    },
    {
      title: "UI/UX Designer",
      team: "Product Design",
      location: "Remote (Global)",
      type: "Full-time",
    },
    {
      title: "Developer Advocate",
      team: "Developer Relations",
      location: "Remote (US/Europe)",
      type: "Full-time",
    },
    {
      title: "Technical Support Engineer",
      team: "Customer Success",
      location: "Remote (APAC)",
      type: "Full-time",
    },
  ];

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 py-16">
      <div className="mx-auto max-w-5xl px-6">
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground uppercase tracking-widest">
            Join the team
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-6">
            Help us design the <br /> workspace of the future
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            We are looking for creators, coders, and organizers who love craft, speed, and premium user experiences. Come make an impact.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/30 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex gap-x-4">
            <span className="text-3xl">🌍</span>
            <div>
              <h3 className="font-semibold text-lg mb-1">Work from anywhere</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Our workspace is remote-first. Choose your hours and work from home or anywhere globally.</p>
            </div>
          </div>
          <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/30 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex gap-x-4">
            <span className="text-3xl">💻</span>
            <div>
              <h3 className="font-semibold text-lg mb-1">Premium Setup</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">We will fund your home office workstation equipment, screen accessories, and tech software tools.</p>
            </div>
          </div>
          <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/30 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex gap-x-4">
            <span className="text-3xl">🏥</span>
            <div>
              <h3 className="font-semibold text-lg mb-1">Health & Wellness</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Excellent health insurance coverage plans, plus dynamic wellness stipends for gym or hobbies.</p>
            </div>
          </div>
          <div className="p-6 bg-neutral-50/50 dark:bg-neutral-900/30 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex gap-x-4">
            <span className="text-3xl">🚀</span>
            <div>
              <h3 className="font-semibold text-lg mb-1">Learning Stipends</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">We cover online courses, book subscriptions, and annual conference ticket fees to support growth.</p>
            </div>
          </div>
        </div>

        {/* Open Roles */}
        <div>
          <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
          <div className="flex flex-col gap-y-4">
            {roles.map((role, idx) => (
              <div
                key={idx}
                className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:shadow-md transition duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-4"
              >
                <div>
                  <h3 className="font-bold text-lg">{role.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-x-1">
                      <Briefcase className="h-3 w-3" />
                      {role.team}
                    </span>
                    <span className="flex items-center gap-x-1">
                      <MapPin className="h-3 w-3" />
                      {role.location}
                    </span>
                    <span className="flex items-center gap-x-1">
                      <Globe className="h-3 w-3" />
                      {role.type}
                    </span>
                  </div>
                </div>
                <Button size="sm">Apply Now</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
