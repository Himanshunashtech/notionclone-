import React from "react";
import { FileText } from "lucide-react";

export default function TermsPage() {
  const sections = [
    { id: "terms-acceptance", title: "1. Acceptance of Terms" },
    { id: "accounts", title: "2. User Accounts" },
    { id: "acceptable-use", title: "3. Acceptable Use Policy" },
    { id: "ownership", title: "4. Intellectual Property" },
    { id: "limitation", title: "5. Limitation of Liability" },
  ];

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Indexes */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-28 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Terms Index</h3>
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
              <FileText className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Legal Document</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Terms of Service</h1>
            <p className="text-xs text-muted-foreground mb-8">Last Updated: July 18, 2026</p>

            <section id="terms-acceptance" className="scroll-mt-28 mb-10">
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By accessing or using Zotion services, workspace interfaces, and client integrations, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not download, install, or use our workspace platform.
              </p>
            </section>

            <section id="accounts" className="scroll-mt-28 mb-10">
              <h2 className="text-2xl font-bold mb-4">2. User Accounts</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you create a Zotion account, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the terms. You are responsible for safeguarding the credentials you use to access the service.
              </p>
            </section>

            <section id="acceptable-use" className="scroll-mt-28 mb-10">
              <h2 className="text-2xl font-bold mb-4">3. Acceptable Use Policy</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                You agree not to use the service for any illegal purposes or to conduct activities that disrupt Zotion servers. Acceptable use rules include:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground leading-relaxed space-y-2">
                <li>No automated scraping, API flooding, or DDoS scripts.</li>
                <li>No uploading malware, trojans, or malicious scripts inside document file attachments.</li>
                <li>No distribution of unsolicited advertising or spam pages.</li>
              </ul>
            </section>

            <section id="ownership" className="scroll-mt-28 mb-10">
              <h2 className="text-2xl font-bold mb-4">4. Intellectual Property</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You retain full copyright and ownership of all content you upload, write, or construct inside Zotion. Zotion does not claim ownership or licenses over user documents, texts, wikis, or databases. The Zotion interface, logo, code, and design tokens remain the exclusive property of Zotion Inc.
              </p>
            </section>

            <section id="limitation" className="scroll-mt-28 mb-10">
              <h2 className="text-2xl font-bold mb-4">5. Limitation of Liability</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To the maximum extent permitted by applicable law, Zotion Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, goodwill, or other intangible losses resulting from your access to or use of the services.
              </p>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
