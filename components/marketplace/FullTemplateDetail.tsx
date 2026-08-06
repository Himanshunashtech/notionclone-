"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Star,
  Share2,
  Download,
  Sparkles,
  SlidersHorizontal,
  MessageSquarePlus,
} from "lucide-react";
import { MarketplaceTemplate } from "./types";
import { ReviewModal, ReviewData } from "./ReviewModal";

/* ═══════════════════════════ INITIAL REVIEWS SEED DATA ═══════════════════════════ */

const INITIAL_REVIEWS_DATA: Record<string, ReviewData[]> = {
  "bug-tracker": [
    {
      id: "rev-1",
      templateId: "bug-tracker",
      userName: "Joe Almeida",
      userAvatar: "J",
      rating: 5,
      title: "It's great",
      comment: "Very well put together and easy to use. Still figuring out all the features, but happy with it so far.",
      createdAt: "Jun 2, 2026",
    },
    {
      id: "rev-2",
      templateId: "bug-tracker",
      userName: "Sarah Chen",
      userAvatar: "S",
      rating: 5,
      title: "Indispensable for our engineering team",
      comment: "Replaced our old Jira board with this Notion template. Custom views saved us hours of setup time.",
      createdAt: "May 28, 2026",
    },
    {
      id: "rev-3",
      templateId: "bug-tracker",
      userName: "Alex Rivera",
      userAvatar: "A",
      rating: 4,
      title: "Solid bug tracking workflow",
      comment: "Love the quick stats and new bug templates. Easy to fill out and customize.",
      createdAt: "May 15, 2026",
    },
    {
      id: "rev-4",
      templateId: "bug-tracker",
      userName: "David Miller",
      userAvatar: "D",
      rating: 5,
      title: "Clean and efficient",
      comment: "Super easy to fill out and customize. Helped our dev team stay organized during our last sprint.",
      createdAt: "May 10, 2026",
    },
  ],
};

const DEFAULT_FALLBACK_REVIEWS: ReviewData[] = [
  {
    id: "rev-fb-1",
    templateId: "default",
    userName: "Elena Rostova",
    userAvatar: "E",
    rating: 5,
    title: "Best template setup!",
    comment: "Extremely intuitive and well designed. Saves hours of workspace architecture work.",
    createdAt: "Jul 12, 2026",
  },
  {
    id: "rev-fb-2",
    templateId: "default",
    userName: "Marcus Vance",
    userAvatar: "M",
    rating: 5,
    title: "Highly recommended",
    comment: "Clear layout, great custom views, and seamless to import into our company workspace.",
    createdAt: "Jul 5, 2026",
  },
];

interface FullTemplateDetailProps {
  tmpl: MarketplaceTemplate;
  isDark: boolean;
  onBack: () => void;
  onAdd: () => void;
  allTemplates: MarketplaceTemplate[];
  onSelectTemplate: (id: string) => void;
}

export const FullTemplateDetail: React.FC<FullTemplateDetailProps> = ({
  tmpl,
  isDark,
  onBack,
  onAdd,
  allTemplates,
  onSelectTemplate,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "highest" | "lowest">("newest");
  const [reviews, setReviews] = useState<ReviewData[]>(() => {
    return INITIAL_REVIEWS_DATA[tmpl.id] || DEFAULT_FALLBACK_REVIEWS;
  });

  const images = [tmpl.previewImage, "/marketplace/hero.png"];

  // Compute dynamic rating stats
  const totalRatings = reviews.length;
  const avgRatingNum = useMemo(() => {
    if (!reviews.length) return tmpl.stats.rating;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews, tmpl.stats.rating]);

  const starPercentages = useMemo(() => {
    if (!reviews.length) return [
      { stars: 5, pct: "85%" },
      { stars: 4, pct: "10%" },
      { stars: 3, pct: "3%" },
      { stars: 2, pct: "1%" },
      { stars: 1, pct: "1%" },
    ];
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5;
      counts[star]++;
    });
    return [5, 4, 3, 2, 1].map((s) => ({
      stars: s,
      pct: `${Math.round((counts[s as 1 | 2 | 3 | 4 | 5] / reviews.length) * 100)}%`,
    }));
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sortOrder === "highest") {
      return list.sort((a, b) => b.rating - a.rating);
    } else if (sortOrder === "lowest") {
      return list.sort((a, b) => a.rating - b.rating);
    }
    return list;
  }, [reviews, sortOrder]);

  const handleAddReview = (newReview: ReviewData) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0f0f0f] text-neutral-100" : "bg-white text-neutral-900"} px-4 sm:px-8 py-6 max-w-7xl mx-auto`}>
      {/* ─── REVIEW MODAL ─── */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        templateId={tmpl.id}
        templateTitle={tmpl.title}
        isDark={isDark}
        onSubmitReview={handleAddReview}
      />

      {/* ─── TOP BAR ─── */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200/80 dark:border-neutral-800 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-x-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
        <div className="flex items-center gap-x-2 text-xs text-neutral-400 dark:text-neutral-500 font-medium">
          <span>Templates</span>
          <ChevronRight className="w-3 h-3" />
          <span className="capitalize">{tmpl.category[0] || "General"}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{tmpl.title}</span>
        </div>
      </div>

      {/* ─── HERO HEADER ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 items-start">
        {/* Left: Info & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-x-2.5">
            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-neutral-300 overflow-hidden">
              {tmpl.creator.avatar}
            </div>
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {tmpl.creator.name}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {tmpl.title}
          </h1>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tmpl.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onAdd}
              className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-sm font-bold transition-all shadow-md flex items-center gap-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add template</span>
            </button>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm font-semibold transition-all flex items-center gap-x-2"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Leave a review</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied!");
              }}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Share template"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Large Screenshot Preview & Thumbnail Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-2 shadow-2xl overflow-hidden">
            <img
              src={images[activeImageIndex]}
              alt={tmpl.title}
              className="w-full rounded-xl object-cover shadow-sm transition-all duration-300 max-h-[480px]"
            />
          </div>

          {/* Thumbnails */}
          <div className="flex items-center gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`relative w-28 h-18 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === i
                  ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md scale-105"
                  : "border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100"
                  }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── STATS & METRICS BAR ─── */}
      <div className="border-y border-neutral-200/80 dark:border-neutral-800 py-6 mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center">
          {/* Creator Profile */}
          <div className="flex items-center gap-x-3">
            <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-neutral-300">
              {tmpl.creator.avatar}
            </div>
            <div>
              <p className="text-xs font-bold">{tmpl.creator.name}</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{tmpl.creator.templateCount} templates</p>
            </div>
          </div>

          {/* Ranking */}
          <div>
            <p className="text-xs font-bold">#14 in Engineering</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Ranking</p>
          </div>

          {/* Rating */}
          <div>
            <p className="text-xs font-bold flex items-center gap-x-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{avgRatingNum}</span>
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{totalRatings} ratings</p>
          </div>

          {/* Downloads */}
          <div>
            <p className="text-xs font-bold flex items-center gap-x-1">
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>{tmpl.stats.uses}+</span>
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Downloads</p>
          </div>

          {/* Version Update */}
          <div>
            <p className="text-xs font-bold">8 weeks ago</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Version update</p>
          </div>

          {/* Languages */}
          <div>
            <p className="text-xs font-bold">EN</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Languages</p>
          </div>
        </div>
      </div>

      {/* ─── ABOUT SECTION ─── */}
      <div className="space-y-4 mb-12">
        <h2 className="text-2xl font-bold">About</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          Easily manage the bugs for your products and projects with this {tmpl.title} Notion template. With an intuitive and easy-to-use interface, you can track, prioritize, and squash your bugs in no time.
        </p>

        <div className="pt-3 space-y-2 text-sm">
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">The template includes:</p>
          <div className="space-y-2 pl-1">
            <div className="flex items-center gap-x-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
              <span className="text-neutral-700 dark:text-neutral-300">Custom Views for the different bug states</span>
            </div>
            <div className="flex items-center gap-x-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
              <span className="text-neutral-700 dark:text-neutral-300">Weekly and All Time Quick Stats</span>
            </div>
            <div className="flex items-center gap-x-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
              <span className="text-neutral-700 dark:text-neutral-300">Easy to fill out New Bug Template</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RATINGS & REVIEWS SECTION ─── */}
      <div className="space-y-6 mb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Ratings & reviews</h2>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold transition-all shadow-sm flex items-center gap-x-1.5"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Write a review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Rating Summary */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-baseline gap-x-2">
              <span className="text-5xl font-black">{avgRatingNum}</span>
              <span className="text-sm font-medium text-neutral-400">/ 5</span>
            </div>
            <p className="text-xs text-neutral-400">Based on {totalRatings} ratings</p>

            <div className="space-y-1.5 pt-4 max-w-xs">
              {starPercentages.map((r) => (
                <div key={r.stars} className="flex items-center gap-x-2 text-[11px] text-neutral-400">
                  <div className="flex items-center gap-x-0.5 w-16">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-2.5 h-2.5 ${i < r.stars ? "fill-amber-400 text-amber-400" : "text-neutral-200 dark:text-neutral-800"}`} />
                    ))}
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: r.pct }} />
                  </div>
                  <span className="w-8 text-right font-mono text-[10px]">{r.pct}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
              <span>All reviews ({sortedReviews.length})</span>
              <div className="flex items-center gap-x-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-transparent border-none text-xs font-semibold text-neutral-700 dark:text-neutral-300 outline-none cursor-pointer"
                >
                  <option value="newest" className="dark:bg-neutral-900">Sort: Newest</option>
                  <option value="highest" className="dark:bg-neutral-900">Sort: Highest Rating</option>
                  <option value="lowest" className="dark:bg-neutral-900">Sort: Lowest Rating</option>
                </select>
              </div>
            </div>

            {/* Rendered Reviews */}
            {sortedReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 space-y-2 shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">{rev.title}</h4>
                  <div className="flex items-center gap-x-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < rev.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-neutral-300 dark:text-neutral-700"
                          }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {rev.comment}
                </p>
                <div className="flex items-center gap-x-2 pt-1">
                  <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center justify-center">
                    {rev.userAvatar}
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {rev.userName} · {rev.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── DETAILS SECTION ─── */}
      <div className="space-y-6 mb-12">
        <h2 className="text-2xl font-bold">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Categories */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Categories</p>
            <div className="flex flex-wrap gap-2">
              {["Agile", "Bug Tracking", "Engineering", "Project Management", "Issue Tracking", "Ticketing", "Work"].map((catName) => {
                const isHighlighted = catName === "Engineering";
                return (
                  <span
                    key={catName}
                    className={`inline-flex items-center gap-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${isHighlighted
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-sm"
                      : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300"
                      }`}
                  >
                    {isHighlighted && <Sparkles className="w-3 h-3 text-blue-500" />}
                    {catName}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Creator Details */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Creator</p>
            <div className="flex items-center gap-x-3">
              <div className="w-11 h-11 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 text-sm">
                {tmpl.creator.avatar}
              </div>
              <div>
                <p className="text-sm font-bold">{tmpl.creator.name}</p>
                <p className="text-xs text-neutral-400">Last updated 8 weeks ago</p>
                <p className="text-xs text-neutral-400 underline hover:text-neutral-600 cursor-pointer pt-0.5">Terms and Conditions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER: MORE BY CREATOR ─── */}
      <div className="pt-8 border-t border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">More by {tmpl.creator.name}</h3>
          <button onClick={onBack} className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            Browse all
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {allTemplates
            .filter((t) => t.id !== tmpl.id)
            .slice(0, 3)
            .map((otherTmpl) => (
              <div
                key={otherTmpl.id}
                onClick={() => onSelectTemplate(otherTmpl.id)}
                className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 hover:shadow-lg transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{otherTmpl.icon}</span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    {otherTmpl.isFree ? "Free" : otherTmpl.price}
                  </span>
                </div>
                <h4 className="text-sm font-bold group-hover:text-blue-600 transition-colors">
                  {otherTmpl.title}
                </h4>
                <p className="text-xs text-neutral-500 line-clamp-2">{otherTmpl.description}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
