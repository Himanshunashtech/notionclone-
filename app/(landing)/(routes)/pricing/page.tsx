import React from "react";
import { Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PricingPage() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "For organizing your work and life.",
      features: [
        "Collaborative workspace",
        "Integrate with Slack, GitHub & more",
        "Basic page analytics",
        "7-day page history",
        "Invite up to 5 guests",
      ],
      cta: "Get Zotion Free",
      href: "/documents",
      popular: false,
    },
    {
      name: "Plus",
      price: "$8",
      period: "per user/month billed annually",
      description: "A hub for small groups to plan & get organized.",
      features: [
        "Everything in Free",
        "Unlimited blocks for teams",
        "Unlimited file uploads",
        "30-day page history",
        "Invite up to 100 guests",
      ],
      cta: "Start 14-day free trial",
      href: "/documents",
      popular: true,
    },
    {
      name: "Business",
      price: "$15",
      period: "per user/month billed annually",
      description: "For companies that use Zotion to run their operations.",
      features: [
        "Everything in Plus",
        "SAML SSO & advanced security",
        "Private teamspaces",
        "Bulk PDF export",
        "90-day page history",
        "Invite up to 250 guests",
      ],
      cta: "Start 14-day free trial",
      href: "/documents",
      popular: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Advanced controls and support for large organizations.",
      features: [
        "Everything in Business",
        "Unlimited page history & guests",
        "Dedicated success manager",
        "Audit log integrations",
        "Advanced provisioning (SCIM)",
        "Custom contracts & invoicing",
      ],
      cta: "Contact Sales",
      href: "#",
      popular: false,
    },
  ];

  return (
    <div className="dark:bg-dark min-h-screen text-foreground transition-colors duration-300 pt-4 pb-16">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          One workspace. <br /> Simple, transparent pricing.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Free for individuals, scalable and feature-rich for collaborative teams and enterprises.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col rounded-3xl p-8 bg-neutral-50/50 dark:bg-neutral-900/30 border transition duration-300 hover:scale-[1.02] ${
                tier.popular
                  ? "border-neutral-900 dark:border-neutral-100 shadow-md ring-1 ring-neutral-900 dark:ring-neutral-100"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <div className="mb-6 flex-1">
                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                <p className="text-xs text-muted-foreground min-h-[32px]">{tier.description}</p>
                <div className="mt-4 flex items-baseline justify-center">
                  <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                  {tier.period && (
                    <span className="ml-1 text-xs text-muted-foreground">/mo</span>
                  )}
                </div>
                {tier.period && (
                  <p className="text-[10px] text-muted-foreground mt-1">{tier.period}</p>
                )}
                
                <ul className="mt-8 space-y-4 text-left border-t border-neutral-200 dark:border-neutral-800 pt-6">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start text-sm">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mr-3 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={tier.popular ? "default" : "outline"}
                className="w-full mt-auto"
                asChild
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
