import React from "react";
import { Shield, Lock, Server, Key, EyeOff, CheckCircle } from "lucide-react";

export default function SecurityPage() {
  const securityPillars = [
    {
      icon: <Lock className="h-6 w-6 text-sky-500" />,
      title: "Data Encryption",
      description: "Documents and database backups are encrypted at rest using AES-256 standards, and in transit using TLS 1.3.",
    },
    {
      icon: <Server className="h-6 w-6 text-emerald-500" />,
      title: "Secure Hosting",
      description: "Zotion is hosted on enterprise-grade AWS and Supabase infrastructure across multiple regional zones for high availability.",
    },
    {
      icon: <Key className="h-6 w-6 text-violet-500" />,
      title: "Access Controls",
      description: "Manage detailed permissions at the workspace and document level. Full SAML SSO and Multi-Factor Authentication (MFA).",
    },
    {
      icon: <EyeOff className="h-6 w-6 text-amber-500" />,
      title: "Continuous Auditing",
      description: "We perform automated vulnerability scanning, annual third-party penetration testing, and maintain active SOC2 readiness.",
    },
  ];

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 py-16">
      <div className="mx-auto max-w-5xl px-6">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-x-2 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-6">
            <Shield className="h-3.5 w-3.5" />
            <span>Enterprise-Grade Security Standards</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Your data is secure, private, <br /> and fully under control
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Zotion is built with deep defensive systems. We ensure privacy safeguards, server speed, and compliance certifications are fully aligned.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {securityPillars.map((p, idx) => (
            <div key={idx} className="p-6 bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-3xl flex gap-x-4">
              <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-xs shrink-0 w-fit h-fit border border-neutral-100 dark:border-neutral-700">
                {p.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Block */}
        <div className="p-8 border border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/30 dark:bg-neutral-900/10">
          <h2 className="text-2xl font-bold mb-6 text-center">Compliance Standards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
              <h4 className="font-semibold text-sm">GDPR Compliant</h4>
              <p className="text-[10px] text-muted-foreground mt-1">Full control over exporting and deleting personal account records.</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
              <h4 className="font-semibold text-sm">SOC 2 Type II</h4>
              <p className="text-[10px] text-muted-foreground mt-1">Independent auditing ensuring our systems protect client databases.</p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
              <h4 className="font-semibold text-sm">99.99% Uptime SLA</h4>
              <p className="text-[10px] text-muted-foreground mt-1">Guaranteed reliability and service availability across all regions.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
