"use client";

import React, { useState, useMemo } from "react";
import { Doc } from "@/lib/supabase-db";
import { DatabaseConfig, DatabaseProperty, parseDatabaseRow } from "./database-utils";
import { BarChart3, PieChart, Info, TrendingUp, Presentation, CircleDot, Calculator, Layers } from "lucide-react";

interface ChartViewProps {
  documentId: string;
  config: DatabaseConfig;
  subpages: Doc<"documents">[];
  preview?: boolean;
}

export const ChartView = ({ config, subpages, preview = false }: ChartViewProps) => {
  // Find properties that can be charted
  const chartableProperties = useMemo(() => {
    return config.properties;
  }, [config.properties]);

  // Default to first property
  const [selectedPropId, setSelectedPropId] = useState<string>(() => {
    const firstSelect = config.properties.find((p) => ["select", "checkbox", "number"].includes(p.type));
    if (firstSelect) return firstSelect.id;
    return chartableProperties[0]?.id || "name";
  });

  const [chartType, setChartType] = useState<"pie" | "donut" | "bar">("pie");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const selectedProperty = useMemo(() => {
    return config.properties.find((p) => p.id === selectedPropId);
  }, [config.properties, selectedPropId]);

  // Process data for the selected property
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};

    subpages.forEach((page) => {
      const row = parseDatabaseRow(page.content);
      const val = selectedProperty ? row.values[selectedProperty.id] : page.title;

      if (!selectedProperty || selectedProperty.type === "text") {
        const itemVal = val || page.title || "Untitled";
        counts[itemVal] = (counts[itemVal] || 0) + 1;
      } else if (selectedProperty.type === "checkbox") {
        const isChecked = val === "true" ? "Checked" : "Unchecked";
        counts[isChecked] = (counts[isChecked] || 0) + 1;
      } else if (selectedProperty.type === "select" && val) {
        counts[val] = (counts[val] || 0) + 1;
      } else if (selectedProperty.type === "multiselect" && val) {
        val.split(",").forEach((item) => {
          const trimmed = item.trim();
          if (trimmed) {
            counts[trimmed] = (counts[trimmed] || 0) + 1;
          }
        });
      } else if (selectedProperty.type === "number" && val) {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          counts[page.title || "Untitled"] = num;
        }
      } else if (val) {
        counts[val] = (counts[val] || 0) + 1;
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
      "#06b6d4", // cyan
      "#f97316", // orange
    ];

    return Object.entries(counts).map(([label, value], idx) => ({
      label,
      value,
      color: colors[idx % colors.length],
    }));
  }, [selectedProperty, subpages]);

  // Aggregate stats for number columns or categorical counts
  const stats = useMemo(() => {
    let sum = 0;
    let count = 0;
    let min = Infinity;
    let max = -Infinity;
    const valuesList: number[] = [];

    if (selectedProperty?.type === "number") {
      subpages.forEach((page) => {
        const row = parseDatabaseRow(page.content);
        const val = row.values[selectedProperty.id];
        if (val) {
          const num = parseFloat(val);
          if (!isNaN(num)) {
            sum += num;
            count++;
            valuesList.push(num);
            if (num < min) min = num;
            if (num > max) max = num;
          }
        }
      });
    } else {
      chartData.forEach((d) => {
        sum += d.value;
        count++;
        valuesList.push(d.value);
        if (d.value < min) min = d.value;
        if (d.value > max) max = d.value;
      });
    }

    return {
      sum: count > 0 ? (selectedProperty?.type === "number" ? parseFloat(sum.toFixed(2)) : sum) : 0,
      avg: count > 0 ? parseFloat((sum / count).toFixed(2)) : 0,
      min: min !== Infinity ? min : 0,
      max: max !== -Infinity ? max : 0,
      count: subpages.length,
    };
  }, [selectedProperty, subpages, chartData]);

  const totalSum = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  // --- SVG Pie / Donut Chart calculation helper ---
  const pieSlices = useMemo(() => {
    if ((chartType !== "pie" && chartType !== "donut") || totalSum === 0) return [];

    let accumulatedAngle = 0;
    return chartData.map((data) => {
      const percentage = (data.value / totalSum) * 100;
      const angle = (data.value / totalSum) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      // Coordinate math
      const radStart = ((startAngle - 90) * Math.PI) / 180;
      const radEnd = ((accumulatedAngle - 90) * Math.PI) / 180;

      const outerR = 85;
      const innerR = chartType === "donut" ? 50 : 0;

      const x1 = 100 + outerR * Math.cos(radStart);
      const y1 = 100 + outerR * Math.sin(radStart);
      const x2 = 100 + outerR * Math.cos(radEnd);
      const y2 = 100 + outerR * Math.sin(radEnd);

      const x3 = 100 + innerR * Math.cos(radEnd);
      const y3 = 100 + innerR * Math.sin(radEnd);
      const x4 = 100 + innerR * Math.cos(radStart);
      const y4 = 100 + innerR * Math.sin(radStart);

      const largeArc = angle > 180 ? 1 : 0;
      
      let pathData = "";
      if (chartType === "donut") {
        pathData = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
      } else {
        pathData = `M 100 100 L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      }

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
            Analytics & Visual Charts
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visualize your database records, distributions, and statistical aggregates
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Select Property */}
          <div className="flex items-center gap-x-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Property:</span>
            <select
              value={selectedPropId}
              onChange={(e) => setSelectedPropId(e.target.value)}
              className="text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-100/70 dark:bg-neutral-800 px-3 py-1.5 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {chartableProperties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
              <option value="name">Title (name)</option>
            </select>
          </div>

          {/* Toggle Chart View */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 border border-neutral-200/60 dark:border-neutral-700">
            <button
              onClick={() => setChartType("pie")}
              className={`flex items-center gap-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                chartType === "pie"
                  ? "bg-white dark:bg-neutral-700 shadow-xs text-blue-600 dark:text-blue-400"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              title="Pie Chart"
            >
              <PieChart className="h-3.5 w-3.5" />
              <span>Pie</span>
            </button>
            <button
              onClick={() => setChartType("donut")}
              className={`flex items-center gap-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                chartType === "donut"
                  ? "bg-white dark:bg-neutral-700 shadow-xs text-blue-600 dark:text-blue-400"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              title="Donut Chart"
            >
              <CircleDot className="h-3.5 w-3.5" />
              <span>Donut</span>
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`flex items-center gap-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                chartType === "bar"
                  ? "bg-white dark:bg-neutral-700 shadow-xs text-blue-600 dark:text-blue-400"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Bar</span>
            </button>
          </div>
        </div>
      </div>

      {subpages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Info className="h-8 w-8 text-neutral-400 mb-2" />
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">No records found</p>
          <p className="text-xs text-muted-foreground mt-0.5">Add page rows to visualize database metrics</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Info className="h-8 w-8 text-neutral-400 mb-2" />
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">No chartable data</p>
          <p className="text-xs text-muted-foreground mt-0.5">Select a property with data values</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main SVG Chart Panel */}
          <div className="lg:col-span-2 flex flex-col justify-between border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/40 dark:bg-neutral-900/20 p-6 min-h-[320px] relative overflow-hidden">
            {chartType === "bar" ? (
              /* SVG / HTML Bar Chart representation */
              <div className="w-full flex flex-col justify-between h-[280px]">
                <div className="flex-1 flex items-end gap-x-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                  {chartData.map((data, idx) => {
                    const maxVal = Math.max(...chartData.map((d) => d.value), 1);
                    const barHeightPercent = (data.value / maxVal) * 88;
                    const percentVal = totalSum > 0 ? ((data.value / totalSum) * 100).toFixed(1) : 0;
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {/* Interactive Tooltip */}
                        <div
                          className={`absolute -top-12 bg-neutral-900 text-white dark:bg-neutral-800 text-xs py-1.5 px-3 rounded-lg shadow-xl pointer-events-none transition-all duration-150 border border-neutral-700 whitespace-nowrap z-30 ${
                            hoveredIndex === idx ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-1"
                          }`}
                        >
                          <span className="font-bold">{data.label}</span>: {data.value} ({percentVal}%)
                        </div>

                        {/* Bar Value on top when hovered */}
                        <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 mb-1 opacity-80 group-hover:opacity-100">
                          {data.value}
                        </span>

                        {/* Bar */}
                        <div
                          className="w-full rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-xs"
                          style={{
                            height: `${Math.max(barHeightPercent, 6)}%`,
                            backgroundColor: data.color,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Labels */}
                <div className="flex justify-between gap-x-3 pt-3 text-[10px] text-muted-foreground select-none overflow-hidden">
                  {chartData.map((data, idx) => (
                    <span key={idx} className="flex-1 text-center truncate font-semibold" title={data.label}>
                      {data.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              /* SVG Pie & Donut Chart representation */
              <div className="relative flex items-center justify-center w-full max-w-[300px] h-[300px] mx-auto">
                <svg viewBox="0 0 200 200" className="w-full h-full select-none drop-shadow-md">
                  {pieSlices.map((slice, idx) => (
                    <path
                      key={idx}
                      d={slice.pathData}
                      fill={slice.color}
                      className="transition-all duration-300 cursor-pointer origin-center stroke-white dark:stroke-neutral-900 stroke-2"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{
                        transform: hoveredIndex === idx ? "scale(1.05)" : "scale(1)",
                        transformOrigin: "100px 100px",
                      }}
                    />
                  ))}
                </svg>

                {/* Center Badge / Tooltip */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-neutral-900 rounded-full w-[115px] h-[115px] m-auto border border-neutral-200 dark:border-neutral-800 shadow-xl text-center p-2.5 select-none transition-all duration-200">
                  {hoveredIndex !== null ? (
                    <>
                      <span className="text-[10px] text-muted-foreground font-bold truncate max-w-full">
                        {pieSlices[hoveredIndex].label}
                      </span>
                      <span className="text-base font-black text-neutral-850 dark:text-white mt-0.5">
                        {pieSlices[hoveredIndex].percentage}%
                      </span>
                      <span className="text-[9px] text-neutral-500 font-medium">
                        ({pieSlices[hoveredIndex].value} count)
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Total</span>
                      <span className="text-xl font-black text-neutral-850 dark:text-white mt-0.5">{totalSum}</span>
                      <span className="text-[9px] text-neutral-500 font-medium">items</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Statistical Aggregates & Legend Panel */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 flex flex-col justify-between space-y-4 bg-white dark:bg-neutral-900">
            
            {/* Statistical Aggregates */}
            <div className="space-y-3">
              <div className="flex items-center gap-x-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <Calculator className="h-3.5 w-3.5 text-blue-500" />
                <span>Statistical Aggregates</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-neutral-100/70 dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-700">
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">SUM</div>
                  <div className="text-base font-black text-neutral-850 dark:text-white mt-0.5">{stats.sum}</div>
                </div>
                <div className="bg-neutral-100/70 dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-700">
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">AVERAGE</div>
                  <div className="text-base font-black text-neutral-850 dark:text-white mt-0.5">{stats.avg}</div>
                </div>
                <div className="bg-neutral-100/70 dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-700">
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">MIN</div>
                  <div className="text-base font-black text-neutral-850 dark:text-white mt-0.5">{stats.min}</div>
                </div>
                <div className="bg-neutral-100/70 dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-700">
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">MAX</div>
                  <div className="text-base font-black text-neutral-850 dark:text-white mt-0.5">{stats.max}</div>
                </div>
              </div>
            </div>

            {/* Legend & Value Breakdown */}
            <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 pr-1 scrollbar-thin">
              <div className="flex items-center gap-x-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                <span>Value Breakdown</span>
              </div>
              {chartData.map((data, idx) => {
                const percentVal = totalSum > 0 ? ((data.value / totalSum) * 100).toFixed(1) : 0;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs p-2 rounded-lg transition-colors cursor-pointer border border-transparent ${
                      hoveredIndex === idx
                        ? "bg-neutral-100/80 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-850"
                    }`}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="flex items-center gap-x-2.5 truncate max-w-[70%]">
                      <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: data.color }} />
                      <span className="font-semibold truncate text-neutral-800 dark:text-neutral-200">{data.label}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-neutral-850 dark:text-white">{data.value}</span>
                      <span className="text-[10px] text-neutral-400 font-medium ml-1.5">({percentVal}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-neutral-100/70 dark:bg-neutral-800/80 p-3 rounded-xl border border-neutral-200/70 dark:border-neutral-700 text-[10px] flex gap-x-2 text-neutral-500 dark:text-neutral-400">
              <TrendingUp className="h-4 w-4 shrink-0 text-blue-500" />
              <span>Hover elements to view interactive details. Aggregates update live as database values change.</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

