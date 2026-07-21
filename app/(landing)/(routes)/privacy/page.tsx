import React from "react";
import { ShieldCheck, ArrowUpRight } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    { id: "introduction", title: "1. Introduction" },
    { id: "data-collection", title: "2. Data We Collect" },
    { id: "data-usage", title: "3. How We Use Data" },
    { id: "sharing", title: "4. Information Sharing" },
    { id: "security", title: "5. Security Standards" },
  ];

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 pt-4 pb-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Indexes */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-28 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Privacy Index</h3>
            <nav className="flex flex-col gap-y-2.5">
              {sections.map((sec, idx) => (
                <a
                  key={idx}
                  href={`#${sec.id}`}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline transition duration-200"
                >
                  {sec.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Document Content */}
          <article className="flex-1 max-w-3xl prose dark:prose-invert">
            <div className="flex items-center gap-x-2 text-sky-500 mb-4">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Legal Document</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground mb-8">Last Updated: July 18, 2026</p>

            <section id="introduction" className="scroll-mt-28 mb-10">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Welcome to Zotion. We value your privacy and are committed to protecting your personal data. This privacy policy will explain how we look after your personal data when you visit our website, use our workspace editor, and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section id="data-collection" className="scroll-mt-28 mb-10">
              <h2 className="text-2xl font-bold mb-4">2. Data We Collect</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                We collect personal information that you voluntarily provide to us when you register on our platform, express an interest in obtaining information about us, or when you participate in activities on the services.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground leading-relaxed space-y-2">
                <li>Account credentials: email addresses, usernames, and profile images.</li>
                <li>User Content: documents, text files, workspace metadata, titles, and database entries.</li>
                <li>Billing and payments info: secure payment tokens, billing details, and subscription states.</li>
              </ul>
            </section>

            <section id="data-usage" className="scroll-mt-28 mb-10">
              <h2 className="text-2xl font-bold mb-4">3. How We Use Data</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We process your personal information for a variety of reasons, depending on how you interact with our services, including: to deliver, facilitate and improve service delivery; to manage accounts and user preferences; to communicate security alerts and system updates; and to ensure compliance with our terms of service.
              </p>
            </section>

            <section id="sharing" className="scroll-mt-28 mb-10">
              <h2 className="text-2xl font-bold mb-4">4. Information Sharing</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We do not sell, rent, or distribute your private database records or documents to advertisers or third-parties. We only share information with payment processors, databases hosts, and secure authentication providers who comply with GDPR, HIPAA, and SOC2 regulations.
              </p>
            </section>

            <section id="security" className="scroll-mt-28 mb-10">
              <h2 className="text-2xl font-bold mb-4">5. Security Standards</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. Documents are encrypted in transit (TLS 1.3) and at rest (AES-256). Please remember that no transmission over the internet can be guaranteed 100% secure.
              </p>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
