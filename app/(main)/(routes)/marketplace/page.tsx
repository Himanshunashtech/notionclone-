"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useMarketplace } from "@/hooks/useMarketplace";
import {
  Search,
  Star,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  Users,
  Heart,
} from "lucide-react";

import { MarketplaceTemplate } from "@/components/marketplace/types";
import { TEMPLATES, CATEGORIES } from "@/components/marketplace/templatesData";
import { TemplateCard } from "@/components/marketplace/cards/TemplateCard";
import { FullTemplateDetail } from "@/components/marketplace/FullTemplateDetail";

const MarketplacePage = () => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const {
    activeTab,
    activeCategory,
    searchQuery,
    previewTemplateId,
    setActiveTab,
    setActiveCategory,
    setSearchQuery,
    setPreviewTemplateId,
  } = useMarketplace();

  const create = useMutation(api.documents.create);
  const updateDocument = useMutation(api.documents.update);

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* Filter templates */
  const filteredTemplates = useMemo(() => {
    let list = TEMPLATES;
    if (activeCategory !== "all") {
      list = list.filter((t) => t.category.includes(activeCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.creator.name.toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const previewTemplate = previewTemplateId
    ? TEMPLATES.find((t) => t.id === previewTemplateId)
    : null;

  /* Handle "Add" */
  const handleAdd = async (tmpl: MarketplaceTemplate) => {
    let title = tmpl.title;
    // Avoid clashing with teamspace reserved names
    if (["Projects", "Meetings", "Docs", "Tasks", "Goals"].includes(title)) {
      title = `My ${title}`;
    }

    const promise = (async () => {
      const config = JSON.parse(tmpl.dbConfig);

      if (config.isMultiDatabase && Array.isArray(config.childDatabases)) {
        // Create root parent document
        const parentId = await create({ title });
        await updateDocument({
          id: parentId,
          icon: tmpl.icon || "📞",
        });

        // Create each child database page (e.g., CALLS, CLIENTS)
        for (const childDb of config.childDatabases) {
          const childTitle = childDb.title || "Database";
          const childIcon = childDb.icon || "📞";
          const dbConf = childDb.dbConfig || {};
          const initialRows = dbConf.initialRows || [];

          const cleanChildConfig = { ...dbConf };
          delete cleanChildConfig.initialRows;

          const childDbId = await create({
            title: childTitle,
            parentDocument: parentId,
          });

          await updateDocument({
            id: childDbId,
            icon: childIcon,
            content: JSON.stringify(cleanChildConfig, null, 2),
          });

          // Populate initial rows for child database
          if (Array.isArray(initialRows) && initialRows.length > 0) {
            for (const row of initialRows) {
              const rowTitle = row.title || "Untitled";
              const rowData = { ...row };
              delete rowData.title;

              const rowId = await create({
                title: rowTitle,
                parentDocument: childDbId,
              });

              await updateDocument({
                id: rowId,
                icon: childIcon,
                content: JSON.stringify({ values: rowData }, null, 2),
              });
            }
          }
        }

        setPreviewTemplateId(null);
        router.push(`/documents/${parentId}`);
        return;
      }

      // Single database creation flow
      const initialRows = config.initialRows || [];
      const cleanConfig = { ...config };
      delete cleanConfig.initialRows;

      const parentId = await create({ title });
      await updateDocument({
        id: parentId,
        icon: tmpl.icon,
        content: JSON.stringify(cleanConfig, null, 2),
      });

      // Create child documents for each initial row
      if (Array.isArray(initialRows) && initialRows.length > 0) {
        for (const row of initialRows) {
          const rowTitle = row.title || "Untitled";
          const rowData = { ...row };
          delete rowData.title;

          const rowId = await create({
            title: rowTitle,
            parentDocument: parentId,
          });

          await updateDocument({
            id: rowId,
            icon: tmpl.icon || "🐞",
            content: JSON.stringify({ values: rowData }, null, 2),
          });
        }
      }

      setPreviewTemplateId(null);
      router.push(`/documents/${parentId}`);
    })();

    toast.promise(promise, {
      loading: "Creating from template...",
      success: "Template added! 🎉",
      error: "Failed to add template.",
    });
  };

  /* ──── TABS ──── */
  const tabs = [
    { id: "discover" as const, label: "Discover", icon: Sparkles },
    { id: "templates" as const, label: "Templates", icon: Zap },
    { id: "popular" as const, label: "Popular", icon: TrendingUp },
    { id: "new" as const, label: "New", icon: Star },
  ];

  /* ─── RENDER FULL TEMPLATE DETAIL PAGE IF SELECTED ─── */
  if (previewTemplate) {
    return (
      <FullTemplateDetail
        tmpl={previewTemplate}
        isDark={isDark}
        onBack={() => setPreviewTemplateId(null)}
        onAdd={() => handleAdd(previewTemplate)}
        allTemplates={TEMPLATES}
        onSelectTemplate={(id) => setPreviewTemplateId(id)}
      />
    );
  }

  return (
    <div className={`min-h-full ${isDark ? "bg-[#0f0f0f]" : "bg-gray-50/50"}`}>
      {/* ─── TOP HEADER BAR ─── */}
      <div className={`sticky top-0 z-50 backdrop-blur-xl ${isDark ? "bg-[#0f0f0f]/80 border-b border-white/5" : "bg-white/80 border-b border-gray-200/60"}`}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Tabs */}
            <div className="flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? isDark
                        ? "bg-white/10 text-white"
                        : "bg-gray-900 text-white"
                      : isDark
                        ? "text-white/40 hover:text-white/70 hover:bg-white/5"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {/* Search */}
            <div className={`relative w-64 ${isDark ? "" : ""}`}>
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-gray-400"}`} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm border transition-colors ${isDark
                  ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 focus:bg-white/8"
                  : "bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
                  } outline-none`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ─── HERO BANNER ─── */}
        <div
          className={`relative rounded-2xl overflow-hidden mb-8 ${isDark ? "bg-gradient-to-r from-violet-950 via-indigo-950 to-blue-950 border border-white/10" : "bg-gradient-to-r from-violet-100 via-indigo-100 to-blue-100 border border-violet-200/60"}`}
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1 p-8 md:p-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className={`w-5 h-5 ${isDark ? "text-violet-400" : "text-violet-600"}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-violet-400" : "text-violet-600"}`}>
                  Template Marketplace
                </span>
              </div>
              <h1 className={`text-3xl md:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Build faster with <br />
                <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  premium templates
                </span>
              </h1>
              <p className={`text-sm mt-3 max-w-md leading-relaxed ${isDark ? "text-white/50" : "text-gray-600"}`}>
                Discover official templates crafted by Zotion Team. One click to add to your workspace.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <button className="text-sm font-bold px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-all shadow-md flex items-center gap-1.5">
                  Browse All <ArrowRight className="w-4 h-4" />
                </button>
                <div className={`flex items-center gap-1.5 text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>
                  <Users className="w-3.5 h-3.5" />
                  <span>Made by Zotion Team</span>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 md:p-6">
              <div className="rounded-xl overflow-hidden shadow-2xl">
                <img src="/marketplace/hero.png" alt="Marketplace" className="w-full h-48 md:h-64 object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── CATEGORY PILLS ─── */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border ${isActive
                  ? isDark
                    ? "bg-white/15 border-white/20 text-white shadow-lg"
                    : "bg-gray-900 border-gray-900 text-white shadow-lg"
                  : isDark
                    ? "bg-white/5 border-white/8 text-white/50 hover:bg-white/10 hover:text-white/70"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ─── TEMPLATE GRID ─── */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-gray-800"}`}>
            {activeCategory === "all" ? "All Templates" : CATEGORIES.find((c) => c.id === activeCategory)?.label}
            <span className={`ml-2 text-xs font-normal ${isDark ? "text-white/30" : "text-gray-400"}`}>
              ({filteredTemplates.length})
            </span>
          </h2>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className={`text-center py-16 rounded-xl border ${isDark ? "bg-white/5 border-white/8" : "bg-white border-gray-200"}`}>
            <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>No templates found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            {filteredTemplates.map((tmpl) => (
              <div key={tmpl.id} className="relative">
                {/* Like button */}
                <button
                  onClick={() => toggleLike(tmpl.id)}
                  className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-200 ${likedIds.has(tmpl.id)
                    ? "bg-red-500/20 text-red-400"
                    : isDark
                      ? "bg-white/10 text-white/30 hover:text-white/60"
                      : "bg-gray-100 text-gray-400 hover:text-gray-600"
                    }`}
                >
                  <Heart className={`w-4 h-4 ${likedIds.has(tmpl.id) ? "fill-current" : ""}`} />
                </button>
                {/* Free / Paid badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${tmpl.isFree
                      ? isDark
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-green-100 text-green-700 border border-green-200"
                      : isDark
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                  >
                    {tmpl.isFree ? "Free" : tmpl.price}
                  </span>
                </div>
                <TemplateCard
                  tmpl={tmpl}
                  isDark={isDark}
                  onAdd={() => handleAdd(tmpl)}
                  onPreview={() => setPreviewTemplateId(tmpl.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
