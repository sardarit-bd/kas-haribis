'use client';

import { useState } from 'react';

type AnalyticsData = {
  month: string;
  visitors: number;
  submissions: number;
};

const MONTHLY_DATA: AnalyticsData[] = [
  { month: 'Jan', visitors: 1200, submissions: 45 },
  { month: 'Feb', visitors: 1900, submissions: 68 },
  { month: 'Mar', visitors: 1500, submissions: 52 },
  { month: 'Apr', visitors: 2400, submissions: 94 },
  { month: 'May', visitors: 3100, submissions: 120 },
  { month: 'Jun', visitors: 2800, submissions: 110 },
  { month: 'Jul', visitors: 3600, submissions: 142 },
  { month: 'Aug', visitors: 4200, submissions: 185 },
];

export function ActivityTrendChart() {
  const [activePoint, setActivePoint] = useState<AnalyticsData | null>(
    MONTHLY_DATA[MONTHLY_DATA.length - 1],
  );

  const maxVisitors = Math.max(...MONTHLY_DATA.map((d) => d.visitors));
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = 30;

  // Generate SVG path for smooth line chart
  const points = MONTHLY_DATA.map((d, index) => {
    const x =
      padding + (index * (svgWidth - padding * 2)) / (MONTHLY_DATA.length - 1);
    const y =
      svgHeight -
      padding -
      (d.visitors / maxVisitors) * (svgHeight - padding * 2);
    return { x, y, data: d };
  });

  const linePath = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    svgHeight - padding
  } L ${points[0].x} ${svgHeight - padding} Z`;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            Platform Traffic & Submissions Trend
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly visitors and service request volume
          </p>
        </div>

        {activePoint && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <span className="font-bold text-slate-800">
              {activePoint.month}:
            </span>
            <span className="text-slate-600">
              <strong className="text-slate-900">{activePoint.visitors.toLocaleString()}</strong> visits
            </span>
            <span className="text-slate-600">
              <strong className="text-amber-700">{activePoint.submissions}</strong> requests
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          <defs>
            <linearGradient id="gradientAreaLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = padding + ratio * (svgHeight - padding * 2);
            return (
              <line
                key={idx}
                x1={padding}
                y1={y}
                x2={svgWidth - padding}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#gradientAreaLight)" />

          {/* Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={activePoint?.month === pt.data.month ? 6 : 4}
                className="cursor-pointer transition-all duration-150"
                fill={activePoint?.month === pt.data.month ? '#d97706' : '#ffffff'}
                stroke="#0f172a"
                strokeWidth="2.5"
                onMouseEnter={() => setActivePoint(pt.data)}
              />
              <text
                x={pt.x}
                y={svgHeight - 8}
                textAnchor="middle"
                fill="#64748b"
                fontSize="11"
                className="font-sans font-medium select-none"
              >
                {pt.data.month}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function CategoryDistributionBarChart({
  submissions,
  banks,
  questions,
  donations,
}: {
  submissions: number;
  banks: number;
  questions: number;
  donations: number;
}) {
  const items = [
    { label: 'Submissions', count: submissions || 24, color: 'bg-blue-600', barColor: '#2563eb' },
    { label: 'Bank Directory', count: banks || 18, color: 'bg-emerald-600', barColor: '#059669' },
    { label: 'Bais Horaah Questions', count: questions || 35, color: 'bg-amber-600', barColor: '#d97706' },
    { label: 'Donations & Receipts', count: donations || 12, color: 'bg-purple-600', barColor: '#9333ea' },
  ];

  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">
          Activity Distribution
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 mb-6">
          Volume share by platform feature
        </p>

        {/* Progress Bar Stack */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5 mb-6 border border-slate-200/60">
          {items.map((item) => {
            const pct = (item.count / total) * 100;
            return (
              <div
                key={item.label}
                style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: item.barColor }}
                className="h-full transition-all duration-300"
                title={`${item.label}: ${item.count} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Legend List */}
        <div className="space-y-3">
          {items.map((item) => {
            const pct = ((item.count / total) * 100).toFixed(1);
            return (
              <div
                key={item.label}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-slate-700 font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{item.count}</span>
                  <span className="text-slate-400 font-mono w-10 text-right">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Total Records Processed</span>
        <span className="font-bold text-slate-900 text-sm">{total}</span>
      </div>
    </div>
  );
}
