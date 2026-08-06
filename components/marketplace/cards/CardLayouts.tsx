import React from "react";
import { Star, Download, Plus } from "lucide-react";
import { MarketplaceTemplate } from "../types";

export interface CardProps {
  tmpl: MarketplaceTemplate;
  isDark: boolean;
  onAdd: () => void;
  onPreview: () => void;
}

/* ═══════════════════════════ SHARED SUB-COMPONENTS ═══════════════════════ */

export const CreatorBadge = ({
  creator,
  isDark,
}: {
  creator: MarketplaceTemplate["creator"];
  isDark: boolean;
}) => (
  <div className="flex items-center gap-2 mt-3">
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${isDark ? "bg-white/15 text-white/70" : "bg-gray-200 text-gray-600"}`}
    >
      {creator.avatar}
    </div>
    <div>
      <p className={`text-[11px] font-medium ${isDark ? "text-white/70" : "text-gray-700"}`}>{creator.name}</p>
      <p className={`text-[9px] ${isDark ? "text-white/30" : "text-gray-400"}`}>{creator.templateCount} templates</p>
    </div>
  </div>
);

export const StatsWidget = ({
  stats,
  isDark,
}: {
  stats: MarketplaceTemplate["stats"];
  isDark: boolean;
}) => (
  <div className="flex items-center gap-2">
    <span className={`text-[10px] flex items-center gap-0.5 ${isDark ? "text-amber-400" : "text-amber-600"}`}>
      <Star className="w-3 h-3 fill-current" /> {stats.rating}
    </span>
    <span className={`text-[10px] flex items-center gap-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}>
      <Download className="w-3 h-3" /> {stats.uses}
    </span>
  </div>
);

export const CardActions = ({
  tmpl,
  isDark,
  onAdd,
  onPreview,
}: CardProps) => (
  <div
    className={`absolute bottom-0 left-0 right-0 flex items-center justify-end gap-2 px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${isDark ? "bg-gradient-to-t from-black/90 via-black/60 to-transparent" : "bg-gradient-to-t from-white/95 via-white/70 to-transparent"}`}
  >
    {tmpl.price && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors shadow-sm"
      >
        Buy for {tmpl.price}
      </button>
    )}
    {!tmpl.price && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-colors shadow-sm flex items-center gap-1"
      >
        <Plus className="w-3.5 h-3.5" /> Add
      </button>
    )}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onPreview();
      }}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors border border-neutral-200 dark:border-neutral-700"
    >
      Preview
    </button>
  </div>
);

/* ═══════════════════════════ CARD LAYOUT COMPONENTS ═══════════════════════ */

export const SplitLeftCard = ({ tmpl, isDark, onAdd, onPreview }: CardProps) => (
  <div
    className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] min-h-[440px] flex flex-col justify-between h-full ${isDark ? `bg-gradient-to-br ${tmpl.accentFrom} ${tmpl.accentTo} ${tmpl.accentBorder}` : `bg-gradient-to-br ${tmpl.lightAccentFrom} ${tmpl.lightAccentTo} ${tmpl.lightAccentBorder}`}`}
  >
    <div className="flex flex-col md:flex-row flex-1">
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <span className={`text-xs font-mono tracking-wider ${isDark ? "text-white/30" : "text-gray-400"}`}>01</span>
          <h3 className={`text-xl font-bold mt-2 ${isDark ? "text-white" : "text-gray-900"}`}>{tmpl.title}</h3>
          <p className={`text-sm mt-3 leading-relaxed ${isDark ? "text-white/60" : "text-gray-500"}`}>{tmpl.description}</p>
        </div>
        <CreatorBadge creator={tmpl.creator} isDark={isDark} />
      </div>
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className={`rounded-xl overflow-hidden border ${isDark ? "border-white/10" : "border-black/5"} shadow-lg w-full h-56`}>
          <img src={tmpl.previewImage} alt={tmpl.title} className="w-full h-full object-cover object-top" />
        </div>
      </div>
    </div>
    <CardActions tmpl={tmpl} isDark={isDark} onAdd={onAdd} onPreview={onPreview} />
  </div>
);

export const SplitRightCard = ({ tmpl, isDark, onAdd, onPreview }: CardProps) => (
  <div
    className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] min-h-[440px] flex flex-col justify-between h-full ${isDark ? `bg-gradient-to-br ${tmpl.accentFrom} ${tmpl.accentTo} ${tmpl.accentBorder}` : `bg-gradient-to-br ${tmpl.lightAccentFrom} ${tmpl.lightAccentTo} ${tmpl.lightAccentBorder}`}`}
  >
    <div className="flex flex-col md:flex-row-reverse flex-1">
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <span className={`text-xs font-mono tracking-wider ${isDark ? "text-white/30" : "text-gray-400"}`}>10</span>
          <h3 className={`text-xl font-bold mt-2 ${isDark ? "text-white" : "text-gray-900"}`}>{tmpl.title}</h3>
          <p className={`text-sm mt-3 leading-relaxed ${isDark ? "text-white/60" : "text-gray-500"}`}>{tmpl.description}</p>
        </div>
        <CreatorBadge creator={tmpl.creator} isDark={isDark} />
      </div>
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className={`rounded-xl overflow-hidden border ${isDark ? "border-white/10" : "border-black/5"} shadow-lg w-full h-56`}>
          <img src={tmpl.previewImage} alt={tmpl.title} className="w-full h-full object-cover object-top" />
        </div>
      </div>
    </div>
    <CardActions tmpl={tmpl} isDark={isDark} onAdd={onAdd} onPreview={onPreview} />
  </div>
);

export const FullWidthCard = ({ tmpl, isDark, onAdd, onPreview }: CardProps) => (
  <div
    className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.005] min-h-[440px] flex flex-col justify-between h-full ${isDark ? `bg-gradient-to-br ${tmpl.accentFrom} ${tmpl.accentTo} ${tmpl.accentBorder}` : `bg-gradient-to-br ${tmpl.lightAccentFrom} ${tmpl.lightAccentTo} ${tmpl.lightAccentBorder}`}`}
  >
    <div className="px-5 pt-5">
      <div className={`rounded-xl overflow-hidden border ${isDark ? "border-white/10" : "border-black/5"} shadow-lg h-56`}>
        <img src={tmpl.previewImage} alt={tmpl.title} className="w-full h-full object-cover object-top" />
      </div>
    </div>
    <div className="p-5 flex-1 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{tmpl.icon}</span>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{tmpl.title}</h3>
          </div>
          <p className={`text-xs leading-relaxed mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>{tmpl.description}</p>
        </div>
        <StatsWidget stats={tmpl.stats} isDark={isDark} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <CreatorBadge creator={tmpl.creator} isDark={isDark} />
      </div>
    </div>
    <CardActions tmpl={tmpl} isDark={isDark} onAdd={onAdd} onPreview={onPreview} />
  </div>
);

export const NumberedCard = ({ tmpl, isDark, onAdd, onPreview }: CardProps) => (
  <div
    className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] min-h-[440px] flex flex-col justify-between h-full ${isDark ? `bg-gradient-to-br ${tmpl.accentFrom} ${tmpl.accentTo} ${tmpl.accentBorder}` : `bg-gradient-to-br ${tmpl.lightAccentFrom} ${tmpl.lightAccentTo} ${tmpl.lightAccentBorder}`}`}
  >
    <div className="flex flex-col md:flex-row flex-1">
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <span className={`text-4xl font-black tracking-tighter ${isDark ? "text-white/10" : "text-black/5"}`}>03</span>
          <h3 className={`text-xl font-bold mt-1 ${isDark ? "text-white" : "text-gray-900"}`}>{tmpl.title}</h3>
          <p className={`text-sm mt-3 leading-relaxed ${isDark ? "text-white/60" : "text-gray-500"}`}>{tmpl.description}</p>
        </div>
        <CreatorBadge creator={tmpl.creator} isDark={isDark} />
      </div>
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className={`rounded-xl overflow-hidden border ${isDark ? "border-white/10" : "border-black/5"} shadow-xl w-full h-56`}>
          <img src={tmpl.previewImage} alt={tmpl.title} className="w-full h-full object-cover object-top" />
        </div>
      </div>
    </div>
    <CardActions tmpl={tmpl} isDark={isDark} onAdd={onAdd} onPreview={onPreview} />
  </div>
);

export const CenteredCard = ({ tmpl, isDark, onAdd, onPreview }: CardProps) => (
  <div
    className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] min-h-[440px] flex flex-col justify-between h-full ${isDark ? `bg-gradient-to-br ${tmpl.accentFrom} ${tmpl.accentTo} ${tmpl.accentBorder}` : `bg-gradient-to-br ${tmpl.lightAccentFrom} ${tmpl.lightAccentTo} ${tmpl.lightAccentBorder}`}`}
  >
    <div className="text-center px-6 pt-6 pb-3">
      <span className={`text-xs font-mono tracking-wider ${isDark ? "text-white/30" : "text-gray-400"}`}>04</span>
      <h3 className={`text-2xl font-black tracking-tight mt-1 uppercase ${isDark ? "text-white" : "text-gray-900"}`}>{tmpl.title}</h3>
      <p className={`text-xs mt-2 ${isDark ? "text-white/50" : "text-gray-500"}`}>{tmpl.description}</p>
    </div>
    <div className="px-5 pb-5 flex-1">
      <div className={`rounded-xl overflow-hidden border ${isDark ? "border-white/10" : "border-black/5"} shadow-lg h-56`}>
        <img src={tmpl.previewImage} alt={tmpl.title} className="w-full h-full object-cover object-top" />
      </div>
    </div>
    <div className="px-5 pb-4 flex items-center justify-between">
      <CreatorBadge creator={tmpl.creator} isDark={isDark} />
      <StatsWidget stats={tmpl.stats} isDark={isDark} />
    </div>
    <CardActions tmpl={tmpl} isDark={isDark} onAdd={onAdd} onPreview={onPreview} />
  </div>
);

export const GridCardsCard = ({ tmpl, isDark, onAdd, onPreview }: CardProps) => (
  <div
    className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] min-h-[440px] flex flex-col justify-between h-full ${isDark ? `bg-gradient-to-br ${tmpl.accentFrom} ${tmpl.accentTo} ${tmpl.accentBorder}` : `bg-gradient-to-br ${tmpl.lightAccentFrom} ${tmpl.lightAccentTo} ${tmpl.lightAccentBorder}`}`}
  >
    <div className="p-5 pb-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{tmpl.icon}</span>
        <div>
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{tmpl.title}</h3>
          <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>{tmpl.creator.name} · {tmpl.creator.templateCount} templates</p>
        </div>
      </div>
    </div>
    <div className="px-5 pb-3">
      <div className="grid grid-cols-2 gap-2">
        {["Define goals", "Validate pricing", "Create landing", "Launch day"].map((item, i) => (
          <div
            key={i}
            className={`rounded-lg p-2 border text-[10px] font-medium ${isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-white/80 border-black/5 text-gray-600"}`}
          >
            <div className={`h-1 w-8 rounded-full mb-1 ${["bg-blue-400", "bg-green-400", "bg-amber-400", "bg-purple-400"][i]}`} />
            {item}
          </div>
        ))}
      </div>
    </div>
    <div className="px-5 pb-5 flex-1">
      <div className={`rounded-xl overflow-hidden border ${isDark ? "border-white/10" : "border-black/5"} shadow-lg h-56`}>
        <img src={tmpl.previewImage} alt={tmpl.title} className="w-full h-full object-cover object-top" />
      </div>
    </div>
    <CardActions tmpl={tmpl} isDark={isDark} onAdd={onAdd} onPreview={onPreview} />
  </div>
);

export const HorizontalCard = ({ tmpl, isDark, onAdd, onPreview }: CardProps) => (
  <div
    className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] min-h-[440px] flex flex-col justify-between h-full ${isDark ? `bg-gradient-to-br ${tmpl.accentFrom} ${tmpl.accentTo} ${tmpl.accentBorder}` : `bg-gradient-to-br ${tmpl.lightAccentFrom} ${tmpl.lightAccentTo} ${tmpl.lightAccentBorder}`}`}
  >
    <div className={`flex items-center gap-3 px-5 pt-5 pb-3`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDark ? "bg-white/10" : "bg-white shadow-sm"}`}>
        {tmpl.icon}
      </div>
      <div className="flex-1">
        <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{tmpl.title}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isDark ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>
            Calendar View
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isDark ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>
            Board View
          </span>
        </div>
      </div>
    </div>
    <p className={`text-xs px-5 pb-3 leading-relaxed ${isDark ? "text-white/50" : "text-gray-500"}`}>{tmpl.description}</p>
    <div className="px-5 pb-4 flex-1">
      <div className={`rounded-xl overflow-hidden border ${isDark ? "border-white/10" : "border-black/5"} shadow-lg h-56`}>
        <img src={tmpl.previewImage} alt={tmpl.title} className="w-full h-full object-cover object-top" />
      </div>
    </div>
    <div className="px-5 pb-4 flex items-center justify-between">
      <CreatorBadge creator={tmpl.creator} isDark={isDark} />
      <StatsWidget stats={tmpl.stats} isDark={isDark} />
    </div>
    <CardActions tmpl={tmpl} isDark={isDark} onAdd={onAdd} onPreview={onPreview} />
  </div>
);

export const StackedCard = ({ tmpl, isDark, onAdd, onPreview }: CardProps) => (
  <div
    className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] min-h-[440px] flex flex-col justify-between h-full ${isDark ? `bg-gradient-to-br ${tmpl.accentFrom} ${tmpl.accentTo} ${tmpl.accentBorder}` : `bg-gradient-to-br ${tmpl.lightAccentFrom} ${tmpl.lightAccentTo} ${tmpl.lightAccentBorder}`}`}
  >
    <div className="p-5 flex-1 flex flex-col justify-between">
      <div className="relative">
        <div className={`absolute -top-1 left-2 right-2 h-3 rounded-t-lg ${isDark ? "bg-white/5" : "bg-black/3"}`} />
        <div className={`absolute -top-0.5 left-1 right-1 h-2 rounded-t-lg ${isDark ? "bg-white/8" : "bg-black/5"}`} />
        <div className={`relative rounded-xl overflow-hidden border ${isDark ? "border-white/10" : "border-black/5"} shadow-xl h-56`}>
          <img src={tmpl.previewImage} alt={tmpl.title} className="w-full h-full object-cover object-top" />
        </div>
      </div>
    </div>
    <div className="px-5 pb-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{tmpl.icon}</span>
        <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{tmpl.title}</h3>
      </div>
      <p className={`text-xs leading-relaxed ${isDark ? "text-white/50" : "text-gray-500"}`}>{tmpl.description}</p>
    </div>
    <div className="px-5 pb-3 flex items-center gap-1.5">
      {["bg-pink-400", "bg-fuchsia-400", "bg-purple-400", "bg-violet-400", "bg-indigo-400"].map((c, i) => (
        <div key={i} className={`w-5 h-5 rounded-full ${c} ${isDark ? "ring-1 ring-white/10" : "ring-1 ring-black/5"}`} />
      ))}
      <span className={`text-[10px] ml-2 ${isDark ? "text-white/30" : "text-gray-400"}`}>+12 tokens</span>
    </div>
    <div className="px-5 pb-4 flex items-center justify-between">
      <CreatorBadge creator={tmpl.creator} isDark={isDark} />
      <StatsWidget stats={tmpl.stats} isDark={isDark} />
    </div>
    <CardActions tmpl={tmpl} isDark={isDark} onAdd={onAdd} onPreview={onPreview} />
  </div>
);

export const MagazineCard = ({ tmpl, isDark, onAdd, onPreview }: CardProps) => (
  <div
    className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] min-h-[440px] flex flex-col justify-between h-full ${isDark ? `bg-gradient-to-br ${tmpl.accentFrom} ${tmpl.accentTo} ${tmpl.accentBorder}` : `bg-gradient-to-br ${tmpl.lightAccentFrom} ${tmpl.lightAccentTo} ${tmpl.lightAccentBorder}`}`}
  >
    <div className="px-5 pt-5 pb-3 flex items-center gap-3">
      <span className="text-3xl">{tmpl.icon}</span>
      <div>
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{tmpl.title}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>⭐ {tmpl.stats.rating}</span>
          <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>📥 {tmpl.stats.uses} uses</span>
        </div>
      </div>
    </div>
    <div className="px-5 pb-3 space-y-2">
      {[
        { label: "Q1 Objective", pct: 85, color: "bg-blue-500" },
        { label: "Q2 Objective", pct: 45, color: "bg-emerald-500" },
        { label: "Q3 Objective", pct: 70, color: "bg-amber-500" },
      ].map((bar, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-0.5">
            <span className={`text-[10px] font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{bar.label}</span>
            <span className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-400"}`}>{bar.pct}%</span>
          </div>
          <div className={`h-1.5 rounded-full ${isDark ? "bg-white/10" : "bg-black/5"}`}>
            <div className={`h-full rounded-full ${bar.color} transition-all`} style={{ width: `${bar.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
    <div className="px-5 pb-4 flex-1">
      <div className={`rounded-xl overflow-hidden border ${isDark ? "border-white/10" : "border-black/5"} shadow-lg h-56`}>
        <img src={tmpl.previewImage} alt={tmpl.title} className="w-full h-full object-cover object-top" />
      </div>
    </div>
    <div className="px-5 pb-4">
      <CreatorBadge creator={tmpl.creator} isDark={isDark} />
    </div>
    <CardActions tmpl={tmpl} isDark={isDark} onAdd={onAdd} onPreview={onPreview} />
  </div>
);

export const MinimalCard = ({ tmpl, isDark, onAdd, onPreview }: CardProps) => (
  <div
    className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] min-h-[440px] flex flex-col justify-between h-full ${isDark ? `bg-gradient-to-br ${tmpl.accentFrom} ${tmpl.accentTo} ${tmpl.accentBorder}` : `bg-gradient-to-br ${tmpl.lightAccentFrom} ${tmpl.lightAccentTo} ${tmpl.lightAccentBorder}`}`}
  >
    <div className="p-6 flex-1 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${isDark ? "bg-white/10" : "bg-white shadow-sm"}`}>
            {tmpl.icon}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{tmpl.title}</h3>
            <p className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"}`}>{tmpl.creator.name} · {tmpl.stats.uses} uses</p>
          </div>
        </div>
        <p className={`text-sm leading-relaxed ${isDark ? "text-white/60" : "text-gray-500"}`}>{tmpl.description}</p>
      </div>
      <div className={`mt-4 rounded-xl border overflow-hidden shadow-lg h-56 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5"}`}>
        <img src={tmpl.previewImage} alt={tmpl.title} className="w-full h-full object-cover object-top" />
      </div>
    </div>
    <div className="px-6 pb-5 flex items-center justify-between">
      <CreatorBadge creator={tmpl.creator} isDark={isDark} />
      <StatsWidget stats={tmpl.stats} isDark={isDark} />
    </div>
    <CardActions tmpl={tmpl} isDark={isDark} onAdd={onAdd} onPreview={onPreview} />
  </div>
);
