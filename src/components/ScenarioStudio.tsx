import React, { useState } from 'react';
import { MonthlyFinancialSummary, PhysicalHealthRecord, MentalHealthRecord, ScenarioInput, ScenarioForecastResult } from '../types/lifeData';
import { Sliders, Sparkles, TrendingDown, TrendingUp, AlertCircle, CheckCircle2, Shield, Loader2, ArrowRight } from 'lucide-react';

interface ScenarioStudioProps {
  latestFinancial: MonthlyFinancialSummary;
  recentPhysical: PhysicalHealthRecord[];
  recentMental: MentalHealthRecord[];
}

export const ScenarioStudio: React.FC<ScenarioStudioProps> = ({
  latestFinancial,
  recentPhysical,
  recentMental,
}) => {
  // Scenario state
  const [scenarioName, setScenarioName] = useState<string>('6-Month Sabbatical');
  const [incomeChangePercent, setIncomeChangePercent] = useState<number>(-100);
  const [expenseChangePercent, setExpenseChangePercent] = useState<number>(-20);
  const [lumpSum, setLumpSum] = useState<number>(-3000);
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [notes, setNotes] = useState<string>('Unpaid pause to travel, recharge nervous system, and develop independent projects.');

  // AI forecasting state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [forecastResult, setForecastResult] = useState<ScenarioForecastResult | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);

  // Mathematical calculations in real-time
  const baselineIncome = latestFinancial.income;
  const baselineFixed = latestFinancial.fixedExpenses;
  const baselineVariable = latestFinancial.variableExpenses;
  const baselineBurn = baselineFixed + baselineVariable;
  const currentNetWorth = latestFinancial.liquidNetWorth;

  const scenarioIncome = Math.max(0, baselineIncome * (1 + incomeChangePercent / 100));
  const scenarioBurn = Math.max(800, baselineBurn * (1 + expenseChangePercent / 100));
  const scenarioNetCashflow = scenarioIncome - scenarioBurn;

  // Real-time runway math
  let simulatedRunwayMonths: number;
  if (scenarioNetCashflow >= 0) {
    simulatedRunwayMonths = 99; // Cashflow positive
  } else {
    const netAssetsAfterLumpSum = Math.max(0, currentNetWorth + lumpSum);
    simulatedRunwayMonths = +(netAssetsAfterLumpSum / Math.abs(scenarioNetCashflow)).toFixed(1);
  }

  const baselineRunway = baselineBurn > 0 ? +(currentNetWorth / baselineBurn).toFixed(1) : 99;

  // Preset Handlers
  const applyPreset = (preset: {
    name: string;
    incomeDelta: number;
    expenseDelta: number;
    lump: number;
    duration: number;
    desc: string;
  }) => {
    setScenarioName(preset.name);
    setIncomeChangePercent(preset.incomeDelta);
    setExpenseChangePercent(preset.expenseDelta);
    setLumpSum(preset.lump);
    setDurationMonths(preset.duration);
    setNotes(preset.desc);
    setForecastResult(null);
  };

  // 24-Month simulation points for the curve
  const monthsHorizon = 24;
  const baselineProjection: number[] = [];
  const scenarioProjection: number[] = [];

  let curBaseNW = currentNetWorth;
  let curScenNW = currentNetWorth + lumpSum;

  for (let m = 0; m <= monthsHorizon; m++) {
    baselineProjection.push(Math.round(curBaseNW));
    scenarioProjection.push(Math.max(0, Math.round(curScenNW)));

    // advance month
    curBaseNW += (baselineIncome - baselineBurn);

    // Apply scenario parameters during duration, then return to baseline
    if (m < durationMonths) {
      curScenNW += (scenarioIncome - scenarioBurn);
    } else {
      curScenNW += (baselineIncome - baselineBurn);
    }
  }

  // Curve geometry
  const chartWidth = 600;
  const chartHeight = 220;
  const padX = 40;
  const padY = 25;

  const allVals = [...baselineProjection, ...scenarioProjection];
  const minVal = Math.min(0, ...allVals);
  const maxVal = Math.max(...allVals) * 1.1;

  const baselinePoints = baselineProjection.map((val, idx) => {
    const x = padX + (idx / monthsHorizon) * (chartWidth - padX * 2);
    const y = chartHeight - padY - ((val - minVal) / (maxVal - minVal || 1)) * (chartHeight - padY * 2);
    return { x, y, val };
  });

  const scenarioPoints = scenarioProjection.map((val, idx) => {
    const x = padX + (idx / monthsHorizon) * (chartWidth - padX * 2);
    const y = chartHeight - padY - ((val - minVal) / (maxVal - minVal || 1)) * (chartHeight - padY * 2);
    return { x, y, val };
  });

  const baselineD = baselinePoints.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');
  const scenarioD = scenarioPoints.reduce((acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`), '');

  // Run AI simulation
  const handleRunAiForecast = async () => {
    setIsSimulating(true);
    setForecastError(null);

    try {
      const avgSleep = recentPhysical.reduce((a, b) => a + b.sleepHours, 0) / (recentPhysical.length || 1);
      const avgRestingHR = recentPhysical.reduce((a, b) => a + b.restingHeartRate, 0) / (recentPhysical.length || 1);
      const avgSteps = recentPhysical.reduce((a, b) => a + b.dailySteps, 0) / (recentPhysical.length || 1);
      const avgStress = recentMental.reduce((a, b) => a + b.stressLevel, 0) / (recentMental.length || 1);
      const avgDeepWork = recentMental.reduce((a, b) => a + b.deepWorkHours, 0) / (recentMental.length || 1);

      const payload = {
        baseline: {
          liquidNetWorth: currentNetWorth,
          monthlyIncome: baselineIncome,
          monthlyFixedExpenses: baselineFixed,
          monthlyVariableExpenses: baselineVariable,
          avgSleep: +avgSleep.toFixed(1),
          restingHR: Math.round(avgRestingHR),
          avgSteps: Math.round(avgSteps),
          stressLevel: +avgStress.toFixed(1),
          deepWorkHours: +avgDeepWork.toFixed(1),
          burnoutRisk: recentMental[recentMental.length - 1]?.burnoutRisk || 'Low',
        },
        scenario: {
          name: scenarioName,
          incomeChangePercent,
          expenseChangePercent,
          lumpSum,
          durationMonths,
          description: notes,
        },
      };

      const res = await fetch('/api/predict-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`AI forecast failed with code ${res.status}`);
      }

      const data: ScenarioForecastResult = await res.json();
      setForecastResult(data);
    } catch (err: any) {
      console.error(err);
      setForecastError(err.message || 'Simulation error');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Preset Pills */}
      <div className="p-5 bg-[#111827]/80 border border-slate-800 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Predictive Scenario Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white">Financial Runway & Life Event Simulation</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Model life events—from unpaid sabbaticals to sudden income shocks—and see how runway, sleep quality, and mental burnout react in real-time.
            </p>
          </div>

          <button
            onClick={handleRunAiForecast}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-lg hover:from-cyan-500 hover:to-indigo-500 transition-all shadow-md shadow-cyan-900/30 cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating Scenario...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Run Gemini Deep AI Forecast</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 py-1 font-medium">Quick Presets:</span>
          {[
            {
              name: '6-Month Sabbatical',
              incomeDelta: -100,
              expenseDelta: -25,
              lump: -2500,
              duration: 6,
              desc: 'Unpaid sabbatical to rest, recharge, travel, and reboot mental clarity.',
            },
            {
              name: 'Economic Income Shock (-40%)',
              incomeDelta: -40,
              expenseDelta: -10,
              lump: 0,
              duration: 12,
              desc: 'Contract reduction or market downturn forcing tighter variable budget.',
            },
            {
              name: 'Career Transition / Bootstrap',
              incomeDelta: -80,
              expenseDelta: -30,
              lump: -5000,
              duration: 18,
              desc: 'Bootstrapping new venture with minimal salary and lean lifestyle.',
            },
            {
              name: 'Medical / Life Emergency',
              incomeDelta: -20,
              expenseDelta: 10,
              lump: -15000,
              duration: 4,
              desc: 'Unplanned medical expense and short leave of absence.',
            },
            {
              name: 'Relocation & Lifestyle Upgrade',
              incomeDelta: 20,
              expenseDelta: 35,
              lump: -12000,
              duration: 24,
              desc: 'Higher compensation but significantly increased cost of living and lease deposit.',
            },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                scenarioName === preset.name
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controls & Real-Time Math Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Sliders */}
        <div className="lg:col-span-5 p-5 bg-[#111827]/80 border border-slate-800 rounded-xl space-y-5">
          <h3 className="text-base font-semibold text-white">Scenario Parameters</h3>

          {/* Income Delta Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-300 font-sans">Monthly Income Adjustment</span>
              <span className={incomeChangePercent >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {incomeChangePercent > 0 ? `+${incomeChangePercent}%` : `${incomeChangePercent}%`} (${Math.round(scenarioIncome).toLocaleString()}/mo)
              </span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              step="5"
              value={incomeChangePercent}
              onChange={(e) => setIncomeChangePercent(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-100% (No Income)</span>
              <span>Baseline</span>
              <span>+100% (Double)</span>
            </div>
          </div>

          {/* Expense Delta Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-300 font-sans">Monthly Expense Adjustment</span>
              <span className={expenseChangePercent <= 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {expenseChangePercent > 0 ? `+${expenseChangePercent}%` : `${expenseChangePercent}%`} (${Math.round(scenarioBurn).toLocaleString()}/mo)
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={expenseChangePercent}
              onChange={(e) => setExpenseChangePercent(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-50% (Extreme Frugality)</span>
              <span>Baseline</span>
              <span>+100% (High Luxury)</span>
            </div>
          </div>

          {/* Lump Sum Shock */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-300 font-sans">Immediate Outflow / Inflow Shock</span>
              <span className={lumpSum >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {lumpSum >= 0 ? `+$${lumpSum.toLocaleString()}` : `-$${Math.abs(lumpSum).toLocaleString()}`}
              </span>
            </div>
            <input
              type="range"
              min="-30000"
              max="30000"
              step="1000"
              value={lumpSum}
              onChange={(e) => setLumpSum(Number(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-$30k Emergency</span>
              <span>$0</span>
              <span>+$30k Windfall</span>
            </div>
          </div>

          {/* Duration in Months */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-300 font-sans">Scenario Duration Horizon</span>
              <span className="text-cyan-300 font-bold">{durationMonths} Months</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="1"
              value={durationMonths}
              onChange={(e) => setDurationMonths(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 Month</span>
              <span>12 Months (1 Year)</span>
              <span>24 Months</span>
            </div>
          </div>

          {/* Context Notes */}
          <div>
            <label className="text-xs text-slate-300 block mb-1">Scenario Strategic Context</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-md text-slate-200 focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Taking sabbatical, changing career, or buying property..."
            />
          </div>
        </div>

        {/* Right: Real-Time Runway Dashboard & 24-Month Projection Curve */}
        <div className="lg:col-span-7 p-5 bg-[#111827]/80 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Runway Projection &amp; Net Worth Curve</h3>
                <div className="text-xs text-slate-400">Comparing Current Baseline vs. Simulated Scenario trajectory</div>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-0.5 bg-slate-400"></span> Baseline
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-0.5 bg-cyan-400"></span> Scenario
                </span>
              </div>
            </div>

            {/* Metric Comparison Strip */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg mb-4">
              <div>
                <div className="text-[11px] text-slate-400">Simulated Monthly Cashflow</div>
                <div className={`text-lg font-bold font-mono tabular-nums ${scenarioNetCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {scenarioNetCashflow >= 0 ? `+$${Math.round(scenarioNetCashflow).toLocaleString()}` : `-$${Math.abs(Math.round(scenarioNetCashflow)).toLocaleString()}`}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Baseline: +${(baselineIncome - baselineBurn).toLocaleString()}</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Projected Runway</div>
                <div className="text-lg font-bold font-mono tabular-nums text-cyan-300">
                  {simulatedRunwayMonths >= 99 ? 'Indefinite' : `${simulatedRunwayMonths} mo`}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Baseline: {baselineRunway} mo</div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Runway Delta</div>
                <div className={`text-lg font-bold font-mono tabular-nums ${simulatedRunwayMonths >= baselineRunway ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {simulatedRunwayMonths >= baselineRunway ? `+${(simulatedRunwayMonths - baselineRunway).toFixed(1)} mo` : `-${(baselineRunway - simulatedRunwayMonths).toFixed(1)} mo`}
                </div>
                <div className="text-[10px] text-slate-500">Resilience status</div>
              </div>
            </div>

            {/* 24-Month SVG Projection Curve */}
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[500px]">
                {/* Horizontal reference lines */}
                {[0, 0.5, 1].map((r, i) => {
                  const y = padY + r * (chartHeight - padY * 2);
                  const val = Math.round(maxVal - r * (maxVal - minVal));
                  return (
                    <g key={i}>
                      <line x1={padX} y1={y} x2={chartWidth - padX} y2={y} stroke="#1E293B" strokeDasharray="3 3" />
                      <text x={padX - 6} y={y + 3} textAnchor="end" fill="#64748B" fontSize="9" className="font-mono">
                        ${Math.round(val / 1000)}k
                      </text>
                    </g>
                  );
                })}

                {/* Duration shade */}
                {durationMonths < monthsHorizon && (
                  <rect
                    x={padX}
                    y={padY}
                    width={((durationMonths / monthsHorizon) * (chartWidth - padX * 2))}
                    height={chartHeight - padY * 2}
                    fill="#06B6D4"
                    fillOpacity="0.05"
                  />
                )}

                {/* Baseline trajectory */}
                <path d={baselineD} fill="none" stroke="#64748B" strokeWidth="2" strokeDasharray="3 3" />

                {/* Scenario trajectory */}
                <path d={scenarioD} fill="none" stroke="#22D3EE" strokeWidth="2.5" />

                {/* X-axis months */}
                {[0, 6, 12, 18, 24].map((m) => {
                  const x = padX + (m / monthsHorizon) * (chartWidth - padX * 2);
                  return (
                    <text key={m} x={x} y={chartHeight - 6} textAnchor="middle" fill="#64748B" fontSize="9" className="font-mono">
                      M{m}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Terminal Reserves (M24): <strong className="text-white font-mono">${scenarioProjection[24].toLocaleString()}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Zero-Reserve Risk: <strong className={simulatedRunwayMonths < 6 ? 'text-rose-400' : 'text-emerald-400'}>{simulatedRunwayMonths < 6 ? 'Elevated' : 'Safe Buffer'}</strong></span>
          </div>
        </div>
      </div>

      {/* AI Simulation Forecast Section (Gemini 3.8 Flash Output) */}
      {forecastResult && (
        <div className="p-6 bg-gradient-to-b from-[#111827] to-[#0D1322] border border-cyan-800/60 rounded-xl shadow-xl shadow-cyan-950/20 space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white">Gemini AI Strategic Life Scenario Synthesis</h3>
                <div className="text-xs text-slate-400 font-mono">Model: gemini-3.8-flash · Comprehensive Multi-Horizon Impact</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Resilience Rating:</span>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md font-mono ${
                forecastResult.resilienceRating === 'High'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  : forecastResult.resilienceRating === 'Moderate'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                  : 'bg-rose-950 text-rose-300 border border-rose-800/60'
              }`}>
                {forecastResult.resilienceRating} Resilience
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-200 leading-relaxed">
            <strong className="text-cyan-400 block text-xs uppercase tracking-wider mb-1 font-sans">Executive Verdict:</strong>
            {forecastResult.executiveSummary}
          </div>

          {/* Health & Mental Forecast Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Physical Health Impact */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">Physical Health &amp; Vitality Forecast</h4>
              <div className="text-xs text-slate-300 space-y-1.5">
                <div><strong>Sleep Quality Trend:</strong> {forecastResult.physicalHealthForecast.projectedSleepScore}</div>
                <div><strong>Cardiovascular / HRV:</strong> {forecastResult.physicalHealthForecast.cardiovascularTrend}</div>
                <div>
                  <strong className="block mb-1">Key Physiological Markers:</strong>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                    {forecastResult.physicalHealthForecast.physicalRiskFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Mental Health Impact */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Mental Wellbeing &amp; Burnout Forecast</h4>
              <div className="text-xs text-slate-300 space-y-1.5">
                <div><strong>Projected Stress Score:</strong> <span className="font-mono text-cyan-300 font-bold">{forecastResult.mentalHealthForecast.projectedStressScore} / 10</span></div>
                <div><strong>Burnout Trajectory:</strong> {forecastResult.mentalHealthForecast.burnoutTrajectory}</div>
                <div><strong>Cognitive Focus Capacity:</strong> {forecastResult.mentalHealthForecast.cognitiveFocusImpact}</div>
              </div>
            </div>
          </div>

          {/* Strategic Action Recommendations */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">Tactical Action Recommendations</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {forecastResult.actionableRecommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-slate-800/40 rounded border border-slate-700/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Trajectory Table */}
          {forecastResult.monthlyProjections && forecastResult.monthlyProjections.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-sans">Simulated Milestone Roadmap</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-sans text-[11px]">
                      <th className="py-2 px-3">Horizon</th>
                      <th className="py-2 px-3">Projected Liquid Capital</th>
                      <th className="py-2 px-3">Monthly Cashflow</th>
                      <th className="py-2 px-3">Estimated Stress</th>
                      <th className="py-2 px-3 font-sans">Strategic Milestone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 tabular-nums">
                    {forecastResult.monthlyProjections.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 font-bold text-cyan-300">Month {p.month}</td>
                        <td className="py-2 px-3 text-white">${p.projectedLiquidAssets.toLocaleString()}</td>
                        <td className={`py-2 px-3 font-semibold ${p.projectedNetCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {p.projectedNetCashflow >= 0 ? `+$${p.projectedNetCashflow.toLocaleString()}` : `-$${Math.abs(p.projectedNetCashflow).toLocaleString()}`}
                        </td>
                        <td className="py-2 px-3 text-indigo-300">{p.estimatedStress} / 10</td>
                        <td className="py-2 px-3 font-sans text-slate-300">{p.statusMilestone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {forecastError && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Error running simulation: {forecastError}. Please verify your API key in Settings &gt; Secrets.</span>
        </div>
      )}
    </div>
  );
};
