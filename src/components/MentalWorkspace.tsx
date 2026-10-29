import React, { useState } from 'react';
import { MentalHealthRecord } from '../types/lifeData';
import { Brain, Zap, Target, AlertTriangle, ShieldCheck, Smile } from 'lucide-react';

interface MentalWorkspaceProps {
  records: MentalHealthRecord[];
  onOpenQuickLog: () => void;
}

export const MentalWorkspace: React.FC<MentalWorkspaceProps> = ({
  records,
  onOpenQuickLog,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const recent = records.slice(-14);
  const latest = records[records.length - 1];

  const avgStress = (recent.reduce((a, b) => a + b.stressLevel, 0) / (recent.length || 1)).toFixed(1);
  const avgEnergy = (recent.reduce((a, b) => a + b.energyRating, 0) / (recent.length || 1)).toFixed(1);
  const avgDeepWork = (recent.reduce((a, b) => a + b.deepWorkHours, 0) / (recent.length || 1)).toFixed(1);

  // SVG Chart math for Stress vs Energy
  const chartWidth = 580;
  const chartHeight = 220;
  const padX = 35;
  const padY = 25;

  const stressPoints = recent.map((r, i) => {
    const x = padX + (i / (recent.length - 1)) * (chartWidth - padX * 2);
    const y = chartHeight - padY - (r.stressLevel / 10) * (chartHeight - padY * 2);
    return { x, y, val: r.stressLevel, data: r };
  });

  const energyPoints = recent.map((r, i) => {
    const x = padX + (i / (recent.length - 1)) * (chartWidth - padX * 2);
    const y = chartHeight - padY - (r.energyRating / 10) * (chartHeight - padY * 2);
    return { x, y, val: r.energyRating, data: r };
  });

  const stressD = stressPoints.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');
  const energyD = energyPoints.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');

  return (
    <div className="space-y-6">
      {/* Top Mental Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span>Average Stress Index (14D)</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">{avgStress} <span className="text-sm font-normal text-slate-400">/ 10</span></div>
          <div className="text-xs text-slate-400 mt-1">Status: <strong className="text-emerald-400">Manageable Load</strong></div>
        </div>

        <div className="p-4 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Subjective Cognitive Energy</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-300">{avgEnergy} <span className="text-sm font-normal text-slate-400">/ 10</span></div>
          <div className="text-xs text-slate-400 mt-1">Peak mental clarity window</div>
        </div>

        <div className="p-4 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Deep Work Focus</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-300">{avgDeepWork} <span className="text-sm font-normal text-slate-400">hrs/day</span></div>
          <div className="text-xs text-slate-400 mt-1">Flow state capacity</div>
        </div>

        <div className="p-4 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Burnout Risk</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{latest?.burnoutRisk || 'Low'}</div>
          <div className="text-xs text-slate-400 mt-1">Psychological runway: <strong className="text-slate-200">Resilient</strong></div>
        </div>
      </div>

      {/* Main Row: Stress vs Energy Curve + Burnout Zone Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Stress vs Energy Trendline */}
        <div className="lg:col-span-7 p-5 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Stress Level vs. Cognitive Energy Trajectory</h2>
              <div className="text-xs text-slate-400">Notice inverse correlation: high stress days depress cognitive stamina</div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-0.5 bg-indigo-500"></span> Stress (1-10)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-0.5 bg-amber-500"></span> Energy (1-10)
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[500px]">
              {/* Threshold zone: High Stress (> 7) */}
              <rect x={padX} y={padY} width={chartWidth - padX * 2} height={(chartHeight - padY * 2) * 0.3} fill="#EF4444" fillOpacity="0.06" />

              {/* Gridlines */}
              {[0, 0.3, 0.7, 1].map((r, i) => {
                const y = padY + r * (chartHeight - padY * 2);
                const val = Math.round(10 - r * 10);
                return (
                  <g key={i}>
                    <line x1={padX} y1={y} x2={chartWidth - padX} y2={y} stroke="#1E293B" strokeDasharray="3 3" />
                    <text x={padX - 6} y={y + 3} textAnchor="end" fill="#64748B" fontSize="9" className="font-mono">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Stress Line */}
              <path d={stressD} fill="none" stroke="#818CF8" strokeWidth="2.5" />
              {stressPoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIdx === i ? '5' : '3'}
                  fill="#0B0F19"
                  stroke="#818CF8"
                  strokeWidth="2"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}

              {/* Energy Line */}
              <path d={energyD} fill="none" stroke="#F59E0B" strokeWidth="2.5" />
              {energyPoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIdx === i ? '5' : '3'}
                  fill="#0B0F19"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}

              {/* X-axis dates */}
              {recent.map((rec, idx) => {
                const x = padX + (idx / (recent.length - 1)) * (chartWidth - padX * 2);
                return (
                  <text key={idx} x={x} y={chartHeight - 6} textAnchor="middle" fill="#64748B" fontSize="9" className="font-mono">
                    {rec.date.slice(8)}
                  </text>
                );
              })}
            </svg>
          </div>

          {hoveredIdx !== null && recent[hoveredIdx] && (
            <div className="mt-3 p-2.5 bg-slate-900 border border-slate-800 rounded-md flex items-center justify-between text-xs text-slate-300 font-mono">
              <span>Date: {recent[hoveredIdx].date}</span>
              <span className="text-indigo-400">Stress: {recent[hoveredIdx].stressLevel}/10</span>
              <span className="text-amber-400">Energy: {recent[hoveredIdx].energyRating}/10</span>
              <span className="text-cyan-400">Deep Work: {recent[hoveredIdx].deepWorkHours}h</span>
            </div>
          )}
        </div>

        {/* Right: Cognitive Focus & Burnout Matrix */}
        <div className="lg:col-span-5 p-5 bg-[#111827]/80 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Deep Work & Burnout Diagnostics</h2>
            <div className="text-xs text-slate-400 mb-4">Capacity to maintain high-value creative and analytical flow</div>

            <div className="space-y-4">
              {/* Daily Focus Distribution */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Deep Work vs Shallow Work Ratio</span>
                  <span className="font-mono text-cyan-300 font-bold">{avgDeepWork}h / 8h (48%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-cyan-500 h-full" style={{ width: '48%' }} title="Deep Work Focus"></div>
                  <div className="bg-slate-700 h-full" style={{ width: '52%' }} title="Meetings & Admin"></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Deep Flow: {avgDeepWork}h</span>
                  <span>Target: &gt; 3.5h/day</span>
                </div>
              </div>

              {/* Stress Zone Analysis */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                <div className="text-xs text-slate-300 font-medium mb-2">Stress Distribution (Past 14 Days)</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-emerald-950/30 border border-emerald-800/40 rounded-md">
                    <div className="text-emerald-400 font-bold font-mono">9 Days</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Low (1-4)</div>
                  </div>
                  <div className="p-2 bg-amber-950/30 border border-amber-800/40 rounded-md">
                    <div className="text-amber-400 font-bold font-mono">4 Days</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Moderate (5-7)</div>
                  </div>
                  <div className="p-2 bg-rose-950/30 border border-rose-800/40 rounded-md">
                    <div className="text-rose-400 font-bold font-mono">1 Day</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Peak Crunch (8+)</div>
                  </div>
                </div>
              </div>

              {/* Behavioral Insight */}
              <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-lg text-xs text-slate-300">
                <strong className="text-indigo-300 block mb-1">Cognitive Reserve Analysis:</strong>
                High energy ratings directly coincide with 8k+ daily steps and prior night sleep &gt; 7.5 hours. Sprint stress dissipates quickly when weekend recovery boundaries are maintained.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Burnout Prevention: <strong className="text-emerald-400">Optimal</strong></span>
            <span aria-hidden="true">·</span>
            <span>Recovery Score: <strong className="text-white font-mono">86 / 100</strong></span>
          </div>
        </div>
      </div>

      {/* Mental Reflections History Table */}
      <div className="p-5 bg-[#111827]/80 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Daily Mental Wellbeing Journal</h2>
            <div className="text-xs text-slate-400">Synchronized with Google Sheets `Mental_Health` tab</div>
          </div>
          <button
            onClick={onOpenQuickLog}
            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            Add Mental Entry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-sans">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Stress</th>
                <th className="py-2 px-3">Energy</th>
                <th className="py-2 px-3">Deep Work</th>
                <th className="py-2 px-3">Mood</th>
                <th className="py-2 px-3">Burnout Risk</th>
                <th className="py-2 px-3 font-sans">Reflection & Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.slice(-8).reverse().map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 tabular-nums">{rec.date}</td>
                  <td className="py-2.5 px-3 text-indigo-300 font-bold tabular-nums">{rec.stressLevel} / 10</td>
                  <td className="py-2.5 px-3 text-amber-300 font-bold tabular-nums">{rec.energyRating} / 10</td>
                  <td className="py-2.5 px-3 text-cyan-300 tabular-nums">{rec.deepWorkHours}h</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">{rec.moodValence}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`font-semibold ${rec.burnoutRisk === 'High' ? 'text-rose-400' : rec.burnoutRisk === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {rec.burnoutRisk}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans truncate max-w-xs">{rec.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
