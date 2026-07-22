import React from "react";
import { Compass, Users, Heart, Sparkles } from "lucide-react";
import { MetaHead } from "@/components/seo/meta-head";

export default function AboutPage() {
  const values = [
    {
      icon: <Users className="h-6 w-6 text-sky-500" />,
      title: "User-first craftsmanship",
      description: "We care deeply about details, UI smoothness, and responsiveness, ensuring developers and writers feel at home.",
    },
    {
      icon: <Compass className="h-6 w-6 text-emerald-500" />,
      title: "Autonomy and Ownership",
      description: "Our teams are independent and self-directed. We write plans, discuss ideas, and execute with absolute focus.",
    },
    {
      icon: <Heart className="h-6 w-6 text-rose-500" />,
      title: "Diverse Perspectives",
      description: "A diverse team creates a richer product. We foster transparency and invite critique from all background areas.",
    },
  ];

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 pt-4 pb-16">
      <MetaHead 
        title="About Us - Zotion Collaborative Layer"
        description="Learn about Zotion's mission to craft the connected workspace for remote teams, creative thinkers, and modern organizers worldwide."
      />
      <div className="mx-auto max-w-5xl px-6">
        {/* Mission */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground uppercase tracking-widest">
            Our Mission
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-6 leading-tight">
            We are here to build the <br /> collaborative layer of the web
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Zotion is built by a remote team spread across the globe. We believe that tools should feel like extensions of your thought processes. We organize, collaborate, and share, reducing friction in digital productivity.
          </p>
        </div>

        {/* Company Values */}
        <div className="border-t border-b border-neutral-200 dark:border-neutral-800 py-16 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Values we live by</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6 bg-neutral-50/50 dark:bg-neutral-900/30 rounded-2xl border border-neutral-100 dark:border-neutral-800/80">
                <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-xs mb-4">
                  {val.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{val.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed mb-4 text-sm md:text-base">
            Founded in 2024, Zotion started as a passion project to merge databases and simple documents into a single fluid container. What began as a tool for personal diaries soon became a collaborative environment utilized by remote groups, startups, and creative collectives.
          </p>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            Today, Zotion supports millions of active pages, scaling to host complex wikis, drag-and-drop boards, and rich content editors with lightning fast offline synchronizations. We are continuously improving, updating our tools monthly with speed and aesthetic excellence.
          </p>
        </div>
      </div>
    </div>
  );
}
