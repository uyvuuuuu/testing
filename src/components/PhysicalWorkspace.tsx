import React, { useState } from 'react';
import { PhysicalHealthRecord } from '../types/lifeData';
import { HeartPulse, Moon, Flame, Footprints, Activity } from 'lucide-react';

interface PhysicalWorkspaceProps {
  records: PhysicalHealthRecord[];
  onOpenQuickLog: () => void;
}

export const PhysicalWorkspace: React.FC<PhysicalWorkspaceProps> = ({
  records,
  onOpenQuickLog,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take last 14 days for chart
  const recent = records.slice(-14);
  const latest = records[records.length - 1];

  // Radar scores (0 - 100)
  const avgSleepScore = Math.round(recent.reduce((a, b) => a + b.sleepQualityScore, 0) / (recent.length || 1));
  const avgRHR = Math.round(recent.reduce((a, b) => a + b.restingHeartRate, 0) / (recent.length || 1));
  const cardioScore = Math.min(100, Math.max(20, Math.round(((85 - avgRHR) / 30) * 100)));

  const avgHRV = Math.round(recent.reduce((a, b) => a + b.hrv, 0) / (recent.length || 1));
  const recoveryScore = Math.min(100, Math.max(25, Math.round((avgHRV / 75) * 100)));

  const avgSteps = Math.round(recent.reduce((a, b) => a + b.dailySteps, 0) / (recent.length || 1));
  const movementScore = Math.min(100, Math.max(20, Math.round((avgSteps / 10000) * 100)));

  const avgExercise = Math.round(recent.reduce((a, b) => a + b.exerciseMinutes, 0) / (recent.length || 1));
  const trainingScore = Math.min(100, Math.max(15, Math.round((avgExercise / 45) * 100)));

  const radarMetrics = [
    { label: 'Sleep Quality', value: avgSleepScore },
    { label: 'Cardio Efficiency', value: cardioScore },
    { label: 'HRV Recovery', value: recoveryScore },
    { label: 'Daily Movement', value: movementScore },
    { label: 'Training Consistency', value: trainingScore },
  ];

  // Radar Math (Pentagon)
  const centerX = 150;
  const centerY = 140;
  const radius = 90;

  const getCoordinates = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  const radarPolygonPoints = radarMetrics
    .map((m, idx) => {
      const { x, y } = getCoordinates(m.value, idx, radarMetrics.length);
      return `${x},${y}`;
    })
    .join(' ');

  // Biometric Synchrony Chart Math (14 days)
  const chartWidth = 580;
  const chartHeight = 200;
  const padX = 35;
  const padY = 25;

  const maxSleep = 9;
  const minSleep = 4;
  const maxHR = 80;
  const minHR = 50;

  return (
    <div className="space-y-6">
      {/* Top Biometric Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
            <Moon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nightly Sleep Duration</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">{latest?.sleepHours || 7.2} <span className="text-sm font-normal text-slate-400">hrs</span></div>
          <div className="text-xs text-slate-400 mt-1">Sleep Score: <strong className="text-cyan-400 font-mono">{latest?.sleepQualityScore || 82}%</strong></div>
        </div>

        <div className="p-4 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>Resting Heart Rate</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-300">{latest?.restingHeartRate || 60} <span className="text-sm font-normal text-slate-400">BPM</span></div>
          <div className="text-xs text-slate-400 mt-1">Baseline: <strong className="text-slate-200 font-mono">58 - 63 BPM (Athletic)</strong></div>
        </div>

        <div className="p-4 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Heart Rate Variability (HRV)</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-300">{latest?.hrv || 64} <span className="text-sm font-normal text-slate-400">ms</span></div>
          <div className="text-xs text-slate-400 mt-1">Autonomic state: <strong className="text-emerald-400">Sympathetic Balance</strong></div>
        </div>

        <div className="p-4 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
            <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            <span>Daily Movement</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">{latest?.dailySteps.toLocaleString() || '8,420'} <span className="text-sm font-normal text-slate-400">steps</span></div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">{latest?.activeCalories || 480} kcal active burn</div>
        </div>
      </div>

      {/* Main Row: Synchrony Chart + 5-Axis Spider Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sleep vs Resting HR Synchrony Curve */}
        <div className="lg:col-span-7 p-5 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Sleep Duration vs. Resting Heart Rate Synchrony</h2>
              <div className="text-xs text-slate-400">Notice lower resting HR on consecutive nights with &gt; 7.2h sleep</div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 bg-cyan-500 rounded-sm"></span> Sleep (hrs)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-0.5 bg-rose-500"></span> Resting HR (BPM)
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[500px]">
              {/* Background horizontal lines */}
              {[0, 0.5, 1].map((r, i) => {
                const y = padY + r * (chartHeight - padY * 2);
                return <line key={i} x1={padX} y1={y} x2={chartWidth - padX} y2={y} stroke="#1E293B" strokeDasharray="3 3" />;
              })}

              {/* Bars: Sleep Hours */}
              {recent.map((rec, idx) => {
                const x = padX + (idx / (recent.length - 1)) * (chartWidth - padX * 2);
                const barWidth = 14;
                const sleepRatio = (rec.sleepHours - minSleep) / (maxSleep - minSleep);
                const barHeight = Math.max(10, sleepRatio * (chartHeight - padY * 2));
                const y = chartHeight - padY - barHeight;

                return (
                  <g key={idx} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
                    <rect
                      x={x - barWidth / 2}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="3"
                      fill={hoveredIndex === idx ? '#22D3EE' : '#0891B2'}
                      fillOpacity={hoveredIndex === idx ? '0.9' : '0.45'}
                    />
                    <text x={x} y={chartHeight - 8} textAnchor="middle" fill="#64748B" fontSize="9" className="font-mono">
                      {rec.date.slice(8)}
                    </text>
                  </g>
                );
              })}

              {/* Line: Resting Heart Rate */}
              {(() => {
                const hrPoints = recent.map((rec, idx) => {
                  const x = padX + (idx / (recent.length - 1)) * (chartWidth - padX * 2);
                  const hrRatio = (rec.restingHeartRate - minHR) / (maxHR - minHR);
                  const y = chartHeight - padY - hrRatio * (chartHeight - padY * 2);
                  return { x, y, rhr: rec.restingHeartRate };
                });

                const lineD = hrPoints.reduce((acc, curr, idx) => {
                  return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
                }, '');

                return (
                  <g>
                    <path d={lineD} fill="none" stroke="#F43F5E" strokeWidth="2.5" />
                    {hrPoints.map((pt, i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r={hoveredIndex === i ? '5' : '3'} fill="#0B0F19" stroke="#F43F5E" strokeWidth="2" />
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>

          {hoveredIndex !== null && recent[hoveredIndex] && (
            <div className="mt-3 p-2.5 bg-slate-900 border border-slate-800 rounded-md flex items-center justify-between text-xs text-slate-300 font-mono">
              <span>Date: {recent[hoveredIndex].date}</span>
              <span className="text-cyan-400">Sleep: {recent[hoveredIndex].sleepHours}h ({recent[hoveredIndex].sleepQualityScore}%)</span>
              <span className="text-rose-400">Resting HR: {recent[hoveredIndex].restingHeartRate} BPM</span>
              <span className="text-amber-400">HRV: {recent[hoveredIndex].hrv} ms</span>
            </div>
          )}
        </div>

        {/* Right: 5-Axis Vitality Spider Radar Diagram */}
        <div className="lg:col-span-5 p-5 bg-[#111827]/80 border border-slate-800 rounded-xl flex flex-col justify-between items-center">
          <div className="w-full text-left mb-2">
            <h2 className="text-base font-semibold text-white">Physical Vitality Radar Diagram</h2>
            <div className="text-xs text-slate-400">5-factor composite physiological balance index</div>
          </div>

          <div className="relative w-[300px] h-[280px]">
            <svg viewBox="0 0 300 280" className="w-full h-full">
              {/* Background concentric pentagons (25%, 50%, 75%, 100%) */}
              {[25, 50, 75, 100].map((level, i) => {
                const pts = radarMetrics
                  .map((_, idx) => {
                    const { x, y } = getCoordinates(level, idx, radarMetrics.length);
                    return `${x},${y}`;
                  })
                  .join(' ');
                return <polygon key={i} points={pts} fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray={level === 100 ? '0' : '2 2'} />;
              })}

              {/* Axis Spoke Lines */}
              {radarMetrics.map((_, idx) => {
                const { x, y } = getCoordinates(100, idx, radarMetrics.length);
                return <line key={idx} x1={centerX} y1={centerY} x2={x} y2={y} stroke="#1E293B" strokeWidth="1" />;
              })}

              {/* Data Area Polygon */}
              <polygon points={radarPolygonPoints} fill="#F59E0B" fillOpacity="0.3" stroke="#F59E0B" strokeWidth="2.5" />

              {/* Data Points & Labels */}
              {radarMetrics.map((m, idx) => {
                const pt = getCoordinates(m.value, idx, radarMetrics.length);
                const labelCoord = getCoordinates(120, idx, radarMetrics.length);
                return (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#0B0F19" stroke="#F59E0B" strokeWidth="2" />
                    <text
                      x={labelCoord.x}
                      y={labelCoord.y}
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="9"
                      className="font-medium"
                    >
                      {m.label} ({m.value}%)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Overall Vitality: <strong className="text-amber-400 font-mono">{Math.round((avgSleepScore + cardioScore + recoveryScore + movementScore + trainingScore) / 5)} / 100</strong></span>
            <span aria-hidden="true">·</span>
            <span>Cardiovascular Rank: <strong className="text-white">Top 15%</strong></span>
          </div>
        </div>
      </div>

      {/* Biometric Log Table */}
      <div className="p-5 bg-[#111827]/80 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Biometric Log History</h2>
            <div className="text-xs text-slate-400">Synchronized with Google Sheets `Physical_Health` tab</div>
          </div>
          <button
            onClick={onOpenQuickLog}
            className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            Add Biometric Entry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-sans">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Sleep</th>
                <th className="py-2 px-3">Resting HR</th>
                <th className="py-2 px-3">HRV</th>
                <th className="py-2 px-3">Steps</th>
                <th className="py-2 px-3">Active Burn</th>
                <th className="py-2 px-3">Workout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 tabular-nums">
              {records.slice(-8).reverse().map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400">{rec.date}</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-bold">{rec.sleepHours}h ({rec.sleepQualityScore}%)</td>
                  <td className="py-2.5 px-3 text-slate-200">{rec.restingHeartRate} BPM</td>
                  <td className="py-2.5 px-3 text-amber-300">{rec.hrv} ms</td>
                  <td className="py-2.5 px-3 text-slate-200">{rec.dailySteps.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-slate-400">{rec.activeCalories} kcal</td>
                  <td className="py-2.5 px-3 text-emerald-400">{rec.exerciseMinutes > 0 ? `${rec.exerciseMinutes} min` : 'Rest Day'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
