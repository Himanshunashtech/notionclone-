import { Heading } from "./_components/Heading";
import { Heroes } from "./_components/Heroes";
import { Features } from "./_components/Features";
import { MetaHead } from "@/components/seo/meta-head";

export default function LandingPage() {
  return (
    <div className="dark:bg-dark flex min-h-full flex-col">
      <MetaHead 
        title="Zotion - Connected Workspace for Docs, Notes & AI Tools"
        description="The all-in-one connected workspace. Plan, write, collaborate, and manage projects with rich real-time sync, database views, and embedded AI assistance."
        faqSchema={[
          { question: "What is Zotion?", answer: "Zotion is a connected workspace where teams plan, write, document, and collaborate in real-time." },
          { question: "Is Zotion free to use?", answer: "Yes, Zotion offers a free plan with unlimited documents and notes for individuals." },
          { question: "Does Zotion support AI integration?", answer: "Yes, Zotion features AI assistant capabilities for smart search, summarization, and content generation." }
        ]}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-y-8 px-6 pb-10 text-center md:justify-start">
        <Heading />
        <Heroes />
        <Features />
      </div>
    </div>
  );
}
