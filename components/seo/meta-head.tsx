import React, { useEffect } from "react";

export interface MetaHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  geoRegion?: string;
  geoPlacename?: string;
  geoPosition?: string;
  icbm?: string;
  author?: string;
  faqSchema?: Array<{ question: string; answer: string }>;
}

export const MetaHead: React.FC<MetaHeadProps> = ({
  title = "Zotion - Connected Workspace for Docs, Notes & AI Tools",
  description = "Zotion is the connected workspace where better, faster work happens. Plan, write, collaborate with real-time editing, database views, and AI intelligence.",
  keywords = "Zotion, workspace, note taking, collaborative documentation, markdown editor, database views, generative AI, task management, team wiki",
  canonicalUrl = window.location.href,
  ogImage = "/og-image.svg",
  ogType = "website",
  geoRegion = "US-CA",
  geoPlacename = "San Francisco",
  geoPosition = "37.7749;-122.4194",
  icbm = "37.7749, -122.4194",
  author = "Zotion Inc.",
  faqSchema,
}) => {
  useEffect(() => {
    // Document title
    document.title = title;

    // Helper to update or set meta tag
    const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Helper for link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    // Standard Primary SEO Meta
    setMetaTag('meta[name="description"]', "name", "description", description);
    setMetaTag('meta[name="keywords"]', "name", "keywords", keywords);
    setMetaTag('meta[name="author"]', "name", "author", author);
    setMetaTag('meta[name="robots"]', "name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setLinkTag("canonical", canonicalUrl);

    // Open Graph / Social Media Meta (OG) with app favicon image integration
    const fullOgImage = ogImage.startsWith("http") ? ogImage : `${window.location.origin}${ogImage}`;
    setMetaTag('meta[property="og:title"]', "property", "og:title", title);
    setMetaTag('meta[property="og:description"]', "property", "og:description", description);
    setMetaTag('meta[property="og:type"]', "property", "og:type", ogType);
    setMetaTag('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMetaTag('meta[property="og:image"]', "property", "og:image", fullOgImage);
    setMetaTag('meta[property="og:image:type"]', "property", "og:image:type", "image/svg+xml");
    setMetaTag('meta[property="og:image:width"]', "property", "og:image:width", "1200");
    setMetaTag('meta[property="og:image:height"]', "property", "og:image:height", "630");
    setMetaTag('meta[property="og:site_name"]', "property", "og:site_name", "Zotion Workspace");

    // Twitter Card Meta
    setMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMetaTag('meta[name="twitter:site"]', "name", "twitter:site", "@zotion_app");
    setMetaTag('meta[name="twitter:creator"]', "name", "twitter:creator", "@zotion_app");
    setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", fullOgImage);

    // GEO Meta Tags (Geographic & Regional Local SEO Optimization)
    setMetaTag('meta[name="geo.region"]', "name", "geo.region", geoRegion);
    setMetaTag('meta[name="geo.placename"]', "name", "geo.placename", geoPlacename);
    setMetaTag('meta[name="geo.position"]', "name", "geo.position", geoPosition);
    setMetaTag('meta[name="ICBM"]', "name", "ICBM", icbm);

    // AEO (Answer Engine Optimization for AI Search / Perplexity / ChatGPT Search)
    setMetaTag('meta[name="ai-engine-target"]', "name", "ai-engine-target", "Answer-Engine-Optimization");
    setMetaTag('meta[name="entity:type"]', "name", "entity:type", "SoftwareApplication, WorkspacePlatform");
    setMetaTag('meta[name="entity:name"]', "name", "entity:name", "Zotion");

    // Structured Data JSON-LD (Schema.org for AEO & Search Engines)
    const jsonLdData: any = [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Zotion",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, Windows, macOS, iOS, Android",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": description,
        "image": fullOgImage,
        "url": canonicalUrl,
        "author": {
          "@type": "Organization",
          "name": "Zotion Inc.",
          "url": "https://zotion.app",
          "logo": `${window.location.origin}/logo.svg`,
          "sameAs": [
            "https://github.com/zotion-app",
            "https://x.com/zotion_app",
            "https://linkedin.com/company/zotion",
            "https://youtube.com/@zotion",
            "https://discord.gg/zotion",
            "https://instagram.com/zotionapp",
            "https://reddit.com/r/zotion",
            "https://facebook.com/zotionapp",
            "https://threads.net/@zotionapp"
          ]
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Zotion Workspace",
        "url": canonicalUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${window.location.origin}/documents?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ];

    if (faqSchema && faqSchema.length > 0) {
      jsonLdData.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqSchema.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      });
    }

    let scriptElement = document.querySelector('#zotion-jsonld-schema') as HTMLScriptElement;
    if (!scriptElement) {
      scriptElement = document.createElement("script");
      scriptElement.id = "zotion-jsonld-schema";
      scriptElement.type = "application/ld+json";
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify(jsonLdData);

  }, [title, description, keywords, canonicalUrl, ogImage, ogType, geoRegion, geoPlacename, geoPosition, icbm, author, faqSchema]);

  return null;
};
