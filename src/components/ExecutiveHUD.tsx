import React from 'react';
import { MonthlyFinancialSummary, PhysicalHealthRecord, MentalHealthRecord, LifeGoals } from '../types/lifeData';
import { DollarSign, HeartPulse, Brain, Target, ArrowUpRight, CheckCircle2, TrendingUp } from 'lucide-react';

interface ExecutiveHUDProps {
  latestFinancial: MonthlyFinancialSummary;
  recentPhysical: PhysicalHealthRecord[];
  recentMental: MentalHealthRecord[];
  goals: LifeGoals;
  onNavigateTab: (tab: string) => void;
}

export const ExecutiveHUD: React.FC<ExecutiveHUDProps> = ({
  latestFinancial,
  recentPhysical,
  recentMental,
  goals,
  onNavigateTab,
}) => {
  // Compute recent 7-day averages
  const last7Physical = recentPhysical.slice(-7);
  const avgSleep = +(last7Physical.reduce((acc, curr) => acc + curr.sleepHours, 0) / (last7Physical.length || 1)).toFixed(1);
  const avgRestingHR = Math.round(last7Physical.reduce((acc, curr) => acc + curr.restingHeartRate, 0) / (last7Physical.length || 1));
  const avgHRV = Math.round(last7Physical.reduce((acc, curr) => acc + curr.hrv, 0) / (last7Physical.length || 1));
  const weeklyExercise = last7Physical.reduce((acc, curr) => acc + curr.exerciseMinutes, 0);

  const last7Mental = recentMental.slice(-7);
  const avgStress = (last7Mental.reduce((acc, curr) => acc + curr.stressLevel, 0) / (last7Mental.length || 1)).toFixed(1);
  const avgDeepWork = (last7Mental.reduce((acc, curr) => acc + curr.deepWorkHours, 0) / (last7Mental.length || 1)).toFixed(1);

  // Financial Runway calculation
  const monthlyBurn = latestFinancial.totalExpenses;
  const liquidRunwayMonths = monthlyBurn > 0 ? (latestFinancial.liquidNetWorth / monthlyBurn).toFixed(1) : '99+';

  // Physical Stamina composite score (0 - 100)
  const staminaScore = Math.min(100, Math.max(20, Math.round((Number(avgSleep) / 8) * 40 + (avgHRV / 70) * 35 + ((80 - avgRestingHR) / 25) * 25)));

  // Mental Resilience index (0 - 100)
  const mentalScore = Math.min(100, Math.max(15, Math.round(((10 - Number(avgStress)) / 10) * 60 + (Number(avgDeepWork) / 5) * 40)));

  // Goals calculations
  const savingsProgress = Math.min(150, Math.round((latestFinancial.netSavings / goals.monthlySavingsTarget) * 100));
  const sleepProgress = Math.min(150, Math.round((avgSleep / goals.nightlySleepTarget) * 100));
  const exerciseProgress = Math.min(150, Math.round((weeklyExercise / goals.weeklyExerciseTarget) * 100));

  return (
    <div className="space-y-4">
      {/* 3 Main Executive Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Financial Runway & Liquidity */}
        <div 
          onClick={() => onNavigateTab('finances')}
          className="group relative p-5 bg-[#111827]/80 hover:bg-[#141E33] border border-slate-800 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>Financial Runway & Net Worth</span>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-400 flex items-center gap-1 group-hover:text-cyan-300 transition-colors">
              Details <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                ${latestFinancial.liquidNetWorth.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Liquid Capital Reserves
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-mono tabular-nums text-cyan-300">
                {liquidRunwayMonths} <span className="text-xs font-normal text-slate-400">mo</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Runway @ Current Burn
              </div>
            </div>
          </div>

          {/* Embedded Savings Target Progress Bar */}
          <div className="my-2.5 pt-2 border-t border-slate-800/60">
            <div className="flex justify-between text-[11px] mb-1 font-mono">
              <span className="text-slate-400 font-sans">Monthly Savings Goal</span>
              <span className={savingsProgress >= 100 ? 'text-emerald-400 font-bold' : 'text-cyan-300'}>
                ${latestFinancial.netSavings.toLocaleString()} / ${goals.monthlySavingsTarget.toLocaleString()} ({savingsProgress}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${savingsProgress >= 100 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                style={{ width: `${Math.min(100, savingsProgress)}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Inflow: <strong className="font-mono text-slate-200">${latestFinancial.income.toLocaleString()}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Burn: <strong className="font-mono text-slate-200">${latestFinancial.totalExpenses.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Card 2: Physical Health & Biometrics */}
        <div 
          onClick={() => onNavigateTab('physical')}
          className="group relative p-5 bg-[#111827]/80 hover:bg-[#141E33] border border-slate-800 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <HeartPulse className="w-4 h-4 text-amber-400" />
              <span>Physical Stamina Index</span>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-400 flex items-center gap-1 group-hover:text-amber-300 transition-colors">
              Details <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-300">
                {staminaScore}<span className="text-sm font-normal text-slate-400"> / 100</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Recovery & Cardio Stamina
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-mono tabular-nums text-white">
                {avgSleep} <span className="text-xs font-normal text-slate-400">hrs</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Avg Sleep (7D)
              </div>
            </div>
          </div>

          {/* Embedded Sleep Goal Progress Bar */}
          <div className="my-2.5 pt-2 border-t border-slate-800/60">
            <div className="flex justify-between text-[11px] mb-1 font-mono">
              <span className="text-slate-400 font-sans">Nightly Sleep Goal</span>
              <span className={sleepProgress >= 95 ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                {avgSleep}h / {goals.nightlySleepTarget}h ({sleepProgress}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${sleepProgress >= 95 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(100, sleepProgress)}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Resting HR: <strong className="font-mono text-slate-200">{avgRestingHR} bpm</strong></span>
            <span aria-hidden="true">·</span>
            <span>HRV: <strong className="font-mono text-slate-200">{avgHRV} ms</strong></span>
          </div>
        </div>

        {/* Card 3: Mental Well-Being & Cognitive Focus */}
        <div 
          onClick={() => onNavigateTab('mental')}
          className="group relative p-5 bg-[#111827]/80 hover:bg-[#141E33] border border-slate-800 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Mental Recovery & Resilience</span>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-400 flex items-center gap-1 group-hover:text-indigo-300 transition-colors">
              Details <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div>
              <div className="text-2xl font-bold font-mono tabular-nums text-indigo-300">
                {mentalScore}<span className="text-sm font-normal text-slate-400"> / 100</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Cognitive Equilibrium
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-mono tabular-nums text-white">
                {avgStress} <span className="text-xs font-normal text-slate-400">/ 10</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Avg Stress Level (7D)
              </div>
            </div>
          </div>

          {/* Embedded Weekly Exercise Goal Progress Bar */}
          <div className="my-2.5 pt-2 border-t border-slate-800/60">
            <div className="flex justify-between text-[11px] mb-1 font-mono">
              <span className="text-slate-400 font-sans">Weekly Workout Target</span>
              <span className={exerciseProgress >= 100 ? 'text-emerald-400 font-bold' : 'text-indigo-300'}>
                {weeklyExercise}m / {goals.weeklyExerciseTarget}m ({exerciseProgress}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${exerciseProgress >= 100 ? 'bg-emerald-400' : 'bg-indigo-400'}`}
                style={{ width: `${Math.min(100, exerciseProgress)}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Deep Focus: <strong className="font-mono text-slate-200">{avgDeepWork}h/day</strong></span>
            <span aria-hidden="true">·</span>
            <span>Burnout Risk: <strong className="font-mono text-slate-200">{recentMental[recentMental.length - 1]?.burnoutRisk || 'Low'}</strong></span>
          </div>
        </div>
      </div>

      {/* Dedicated Executive Goals Progress Strip */}
      <div className="p-4 bg-[#111827]/90 border border-slate-800 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Active Goals Progress Bar Strip</h3>
          </div>
          <button
            onClick={() => onNavigateTab('goals')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1"
          >
            <span>Configure Targets</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Savings Bar */}
          <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-lg">
            <div className="flex justify-between items-baseline text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Monthly Savings</span>
              <span className="font-mono text-cyan-300 font-bold">
                ${latestFinancial.netSavings.toLocaleString()} <span className="text-slate-500 font-normal">/ ${goals.monthlySavingsTarget.toLocaleString()}</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-300 ${savingsProgress >= 100 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                style={{ width: `${Math.min(100, savingsProgress)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>{savingsProgress >= 100 ? 'Target Exceeded' : `$${(goals.monthlySavingsTarget - latestFinancial.netSavings).toLocaleString()} remaining`}</span>
              <span className={savingsProgress >= 100 ? 'text-emerald-400 font-bold' : ''}>{savingsProgress}% achieved</span>
            </div>
          </div>

          {/* Sleep Bar */}
          <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-lg">
            <div className="flex justify-between items-baseline text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Nightly Sleep</span>
              <span className="font-mono text-amber-300 font-bold">
                {avgSleep}h <span className="text-slate-500 font-normal">/ {goals.nightlySleepTarget}h</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-300 ${sleepProgress >= 95 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(100, sleepProgress)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>{avgSleep >= goals.nightlySleepTarget ? 'Circadian Optimal' : `${(goals.nightlySleepTarget - avgSleep).toFixed(1)}h nightly deficit`}</span>
              <span className={sleepProgress >= 95 ? 'text-emerald-400 font-bold' : ''}>{sleepProgress}% achieved</span>
            </div>
          </div>

          {/* Exercise Bar */}
          <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-lg">
            <div className="flex justify-between items-baseline text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Weekly Exercise</span>
              <span className="font-mono text-indigo-300 font-bold">
                {weeklyExercise}m <span className="text-slate-500 font-normal">/ {goals.weeklyExerciseTarget}m</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-300 ${exerciseProgress >= 100 ? 'bg-emerald-400' : 'bg-indigo-400'}`}
                style={{ width: `${Math.min(100, exerciseProgress)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>{weeklyExercise >= goals.weeklyExerciseTarget ? 'Aerobic Capacity Reached' : `${goals.weeklyExerciseTarget - weeklyExercise} min remaining`}</span>
              <span className={exerciseProgress >= 100 ? 'text-emerald-400 font-bold' : ''}>{exerciseProgress}% achieved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
