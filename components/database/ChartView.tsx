"use client";

import React, { useState, useMemo } from "react";
import { Doc } from "@/lib/supabase-db";
import { DatabaseConfig, DatabaseProperty, parseDatabaseRow } from "./database-utils";
import { BarChart3, PieChart, Info, TrendingUp, Presentation } from "lucide-react";

interface ChartViewProps {
  documentId: string;
  config: DatabaseConfig;
  subpages: Doc<"documents">[];
  preview?: boolean;
}

export const ChartView = ({ config, subpages, preview = false }: ChartViewProps) => {
  // Find properties that can be charted
  const chartableProperties = useMemo(() => {
    return config.properties.filter(
      (p) => ["select", "multiselect", "checkbox", "number"].includes(p.type)
    );
  }, [config.properties]);

  // Default to first select/checkbox/number property
  const [selectedPropId, setSelectedPropId] = useState<string>(() => {
    const firstSelect = config.properties.find((p) => ["select", "checkbox"].includes(p.type));
    if (firstSelect) return firstSelect.id;
    return chartableProperties[0]?.id || "name";
  });

  const [chartType, setChartType] = useState<"pie" | "bar">("pie");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const selectedProperty = useMemo(() => {
    return config.properties.find((p) => p.id === selectedPropId);
  }, [config.properties, selectedPropId]);

  // Process data for the selected property
  const chartData = useMemo(() => {
    if (!selectedProperty) return [];

    const counts: Record<string, number> = {};
    let totalValid = 0;

    subpages.forEach((page) => {
      const row = parseDatabaseRow(page.content);
      const val = row.values[selectedProperty.id];

      if (selectedProperty.type === "checkbox") {
        const isChecked = val === "true" ? "Checked" : "Unchecked";
        counts[isChecked] = (counts[isChecked] || 0) + 1;
        totalValid++;
      } else if (selectedProperty.type === "select" && val) {
        counts[val] = (counts[val] || 0) + 1;
        totalValid++;
      } else if (selectedProperty.type === "multiselect" && val) {
        val.split(",").forEach((item) => {
          const trimmed = item.trim();
          if (trimmed) {
            counts[trimmed] = (counts[trimmed] || 0) + 1;
            totalValid++;
          }
        });
      } else if (selectedProperty.type === "number" && val) {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          counts[page.title || "Untitled"] = num;
          totalValid++;
        }
      }
    });

    // Format for charts
    const colors = [
      "#3b82f6", // blue
      "#10b981", // emerald
      "#f59e0b", // amber
      "#ef4444", // red
      "#8b5cf6", // violet
      "#ec4899", // pink
      "#14b8a6", // teal
      "#6366f1", // indigo
    ];

    return Object.entries(counts).map(([label, value], idx) => ({
      label,
      value,
      color: colors[idx % colors.length],
    }));
  }, [selectedProperty, subpages]);

  // Aggregate stats for number columns
  const numberStats = useMemo(() => {
    if (!selectedProperty || selectedProperty.type !== "number") return null;

    let sum = 0;
    let count = 0;
    let min = Infinity;
    let max = -Infinity;

    subpages.forEach((page) => {
      const row = parseDatabaseRow(page.content);
      const val = row.values[selectedProperty.id];
      if (val) {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          sum += num;
          count++;
          if (num < min) min = num;
          if (num > max) max = num;
        }
      }
    });

    return {
      sum: count > 0 ? sum : 0,
      avg: count > 0 ? parseFloat((sum / count).toFixed(2)) : 0,
      min: min !== Infinity ? min : 0,
      max: max !== -Infinity ? max : 0,
      count,
    };
  }, [selectedProperty, subpages]);

  const totalSum = useMemo(() => {
    if (selectedProperty?.type === "number") {
      return numberStats?.sum || 0;
    }
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData, selectedProperty, numberStats]);

  // --- SVG Pie Chart calculation helper ---
  const pieSlices = useMemo(() => {
    if (chartType !== "pie" || totalSum === 0) return [];

    let accumulatedAngle = 0;
    return chartData.map((data) => {
      const percentage = (data.value / totalSum) * 100;
      const angle = (data.value / totalSum) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      // Coordinate math
      const radStart = ((startAngle - 90) * Math.PI) / 180;
      const radEnd = ((accumulatedAngle - 90) * Math.PI) / 180;

      const x1 = 100 + 80 * Math.cos(radStart);
      const y1 = 100 + 80 * Math.sin(radStart);
      const x2 = 100 + 80 * Math.cos(radEnd);
      const y2 = 100 + 80 * Math.sin(radEnd);

      const largeArc = angle > 180 ? 1 : 0;
      const pathData = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return {
        ...data,
        percentage: percentage.toFixed(1),
        pathData,
      };
    });
  }, [chartData, chartType, totalSum]);

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs p-6 space-y-6">
      
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h3 className="text-base font-bold flex items-center gap-x-2">
            <Presentation className="h-5 w-5 text-blue-500" />
            Database Visual Analytics
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualize your records and aggregates based on selected properties
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Select Property */}
          <div className="flex items-center gap-x-1.5">
            <span className="text-xs font-medium text-neutral-500">Analyze:</span>
            <select
              value={selectedPropId}
              onChange={(e) => setSelectedPropId(e.target.value)}
              className="text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850 px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              {chartableProperties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
              <option value="name">Name (title)</option>
            </select>
          </div>

          {/* Toggle Pie / Bar */}
          {selectedProperty?.type !== "number" && (
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 border border-neutral-200/50 dark:border-neutral-750">
              <button
                onClick={() => setChartType("pie")}
                className={`p-1.5 rounded-md transition-all ${
                  chartType === "pie"
                    ? "bg-white dark:bg-neutral-700 shadow-xs text-blue-600 dark:text-blue-400"
                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                }`}
                title="Pie Chart"
              >
                <PieChart className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`p-1.5 rounded-md transition-all ${
                  chartType === "bar"
                    ? "bg-white dark:bg-neutral-700 shadow-xs text-blue-600 dark:text-blue-400"
                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                }`}
                title="Bar Chart"
              >
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {subpages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Info className="h-8 w-8 text-neutral-400 mb-2" />
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">No data to display</p>
          <p className="text-xs text-muted-foreground mt-0.5">Add rows with values to see charts</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Info className="h-8 w-8 text-neutral-400 mb-2" />
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">No chartable values found</p>
          <p className="text-xs text-muted-foreground mt-0.5">Please ensure some records have selected values</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Graphic Panel */}
          <div className="lg:col-span-2 flex items-center justify-center border border-neutral-100 dark:border-neutral-800/80 rounded-xl bg-neutral-50/30 dark:bg-neutral-900/10 p-6 min-h-[300px]">
            {selectedProperty?.type === "number" || chartType === "bar" ? (
              /* Bar Chart representation */
              <div className="w-full flex flex-col justify-between h-[280px]">
                <div className="flex-1 flex items-end gap-x-2 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                  {chartData.map((data, idx) => {
                    const maxVal = Math.max(...chartData.map((d) => d.value), 1);
                    const barHeightPercent = (data.value / maxVal) * 90; // scale to 90% max height
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center group relative cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {/* Tooltip */}
                        <div
                          className={`absolute -top-10 bg-neutral-950 text-white dark:bg-neutral-800 text-[10px] py-1 px-2 rounded-md shadow-lg pointer-events-none transition-all duration-150 ${
                            hoveredIndex === idx ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-1"
                          }`}
                          style={{ zIndex: 10 }}
                        >
                          <span className="font-semibold">{data.label}</span>: {data.value}
                        </div>

                        {/* Bar */}
                        <div
                          className="w-full rounded-t-md transition-all duration-300 hover:brightness-105 shadow-xs"
                          style={{
                            height: `${Math.max(barHeightPercent, 4)}%`,
                            backgroundColor: data.color,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Labels */}
                <div className="flex justify-between gap-x-2 pt-2 text-[9px] text-muted-foreground select-none overflow-hidden">
                  {chartData.map((data, idx) => (
                    <span key={idx} className="flex-1 text-center truncate font-medium" title={data.label}>
                      {data.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              /* SVG Pie Chart representation */
              <div className="relative flex items-center justify-center w-full max-w-[280px] h-[280px]">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90 select-none">
                  {pieSlices.map((slice, idx) => (
                    <path
                      key={idx}
                      d={slice.pathData}
                      fill={slice.color}
                      className="transition-all duration-300 cursor-pointer origin-center hover:scale-105 stroke-white dark:stroke-neutral-900 stroke-2"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{
                        transform: hoveredIndex === idx ? "scale(1.04)" : "scale(1)",
                      }}
                    />
                  ))}
                </svg>

                {/* Center text / Tooltip */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-full w-[110px] h-[110px] m-auto border border-neutral-100 dark:border-neutral-800 shadow-lg text-center p-2 select-none">
                  {hoveredIndex !== null ? (
                    <>
                      <span className="text-[10px] text-muted-foreground font-semibold truncate max-w-full">
                        {pieSlices[hoveredIndex].label}
                      </span>
                      <span className="text-base font-bold text-neutral-850 dark:text-white mt-0.5">
                        {pieSlices[hoveredIndex].percentage}%
                      </span>
                      <span className="text-[9px] text-neutral-400">
                        ({pieSlices[hoveredIndex].value} count)
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Total</span>
                      <span className="text-xl font-black text-neutral-850 dark:text-white mt-0.5">{totalSum}</span>
                      <span className="text-[9px] text-neutral-400">items</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stats & Legend Panel */}
          <div className="border border-neutral-100 dark:border-neutral-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            
            {/* Aggregate cards for numbers */}
            {selectedProperty?.type === "number" && numberStats ? (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Aggregates</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100/50 dark:border-blue-800/30">
                    <div className="text-[10px] text-blue-500 font-bold">SUM</div>
                    <div className="text-lg font-black text-blue-900 dark:text-blue-400 mt-0.5">{numberStats.sum}</div>
                  </div>
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100/50 dark:border-emerald-800/30">
                    <div className="text-[10px] text-emerald-500 font-bold">AVERAGE</div>
                    <div className="text-lg font-black text-emerald-900 dark:text-emerald-400 mt-0.5">{numberStats.avg}</div>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50">
                    <div className="text-[10px] text-neutral-400 font-bold">MIN</div>
                    <div className="text-lg font-black text-neutral-800 dark:text-neutral-300 mt-0.5">{numberStats.min}</div>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50">
                    <div className="text-[10px] text-neutral-400 font-bold">MAX</div>
                    <div className="text-lg font-black text-neutral-800 dark:text-neutral-300 mt-0.5">{numberStats.max}</div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Legend list */}
            <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2.5 pr-1 scrollbar-thin">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Data Distribution</div>
              {chartData.map((data, idx) => {
                const percentVal = totalSum > 0 ? ((data.value / totalSum) * 100).toFixed(1) : 0;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs p-2 rounded-lg transition-colors cursor-pointer ${
                      hoveredIndex === idx ? "bg-neutral-50 dark:bg-neutral-800" : ""
                    }`}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="flex items-center gap-x-2.5 truncate max-w-[70%]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
                      <span className="font-medium truncate text-neutral-800 dark:text-neutral-200">{data.label}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold">{data.value}</span>
                      {selectedProperty?.type !== "number" && (
                        <span className="text-[10px] text-muted-foreground ml-1.5">({percentVal}%)</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-850 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 text-[10px] flex gap-x-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 shrink-0 text-blue-500" />
              <span>Hover chart elements to view details. Values are recalculated in real time.</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
