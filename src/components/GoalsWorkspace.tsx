import React from 'react';
import { LifeGoals, MonthlyFinancialSummary, PhysicalHealthRecord, MentalHealthRecord } from '../types/lifeData';
import { Target, DollarSign, Moon, Dumbbell, Footprints, ShieldAlert, Sparkles, CheckCircle2, TrendingUp, Award } from 'lucide-react';

interface GoalsWorkspaceProps {
  goals: LifeGoals;
  onUpdateGoals: (newGoals: LifeGoals) => void;
  latestFinancial: MonthlyFinancialSummary;
  recentPhysical: PhysicalHealthRecord[];
  recentMental: MentalHealthRecord[];
}

export const GoalsWorkspace: React.FC<GoalsWorkspaceProps> = ({
  goals,
  onUpdateGoals,
  latestFinancial,
  recentPhysical,
  recentMental,
}) => {
  // Current performance metrics
  const currentSavings = latestFinancial.netSavings;
  const last7Physical = recentPhysical.slice(-7);
  const currentAvgSleep = +(last7Physical.reduce((a, b) => a + b.sleepHours, 0) / (last7Physical.length || 1)).toFixed(1);
  const currentWeeklyExercise = last7Physical.reduce((a, b) => a + b.exerciseMinutes, 0);
  const currentAvgSteps = Math.round(last7Physical.reduce((a, b) => a + b.dailySteps, 0) / (last7Physical.length || 1));
  const currentAvgStress = +(recentMental.slice(-7).reduce((a, b) => a + b.stressLevel, 0) / 7).toFixed(1);

  // Percentages towards targets
  const savingsPercent = Math.min(150, Math.round((currentSavings / goals.monthlySavingsTarget) * 100));
  const sleepPercent = Math.min(150, Math.round((currentAvgSleep / goals.nightlySleepTarget) * 100));
  const exercisePercent = Math.min(150, Math.round((currentWeeklyExercise / goals.weeklyExerciseTarget) * 100));
  const stepsPercent = Math.min(150, Math.round((currentAvgSteps / goals.dailyStepsTarget) * 100));

  // Preset goal profiles
  const applyPresetProfile = (preset: {
    name: string;
    savings: number;
    sleep: number;
    exercise: number;
    steps: number;
    stress: number;
  }) => {
    onUpdateGoals({
      monthlySavingsTarget: preset.savings,
      nightlySleepTarget: preset.sleep,
      weeklyExerciseTarget: preset.exercise,
      dailyStepsTarget: preset.steps,
      maxStressCeiling: preset.stress,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Preset Profiles */}
      <div className="p-5 bg-[#111827]/80 border border-slate-800 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Personal Targets &amp; Milestones</span>
            </div>
            <h2 className="text-xl font-bold text-white">Holistic Goal Architecture</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Calibrate your performance targets across monthly wealth accumulation, circadian sleep duration, cardiovascular training, and autonomic stress containment.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-lg">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400">Goals On Track: </span>
              <strong className="text-emerald-400 font-mono">
                {[savingsPercent >= 100, sleepPercent >= 95, exercisePercent >= 100, stepsPercent >= 95].filter(Boolean).length} / 4 Active
              </strong>
            </div>
          </div>
        </div>

        {/* Preset Profiles Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium py-1">Target Presets:</span>
          {[
            {
              name: 'Balanced Executive (Recommended)',
              savings: 3000,
              sleep: 7.5,
              exercise: 180,
              steps: 8500,
              stress: 4.5,
            },
            {
              name: 'Aggressive Capital Accumulator',
              savings: 4000,
              sleep: 7.0,
              exercise: 150,
              steps: 7500,
              stress: 5.5,
            },
            {
              name: 'Athletic Recovery & Longevity',
              savings: 2500,
              sleep: 8.2,
              exercise: 240,
              steps: 10000,
              stress: 3.5,
            },
            {
              name: 'High-Stress Burnout Shield',
              savings: 2200,
              sleep: 8.0,
              exercise: 180,
              steps: 9000,
              stress: 3.0,
            },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPresetProfile(preset)}
              className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Goal Progress Cards with Sliders and Detailed Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Goal 1: Monthly Savings Target */}
        <div className="p-5 bg-[#111827]/80 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4 shadow-lg shadow-black/20">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                <span>Monthly Savings Target</span>
              </div>
              <span className={`text-xs font-mono font-bold ${savingsPercent >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {savingsPercent}%
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <div>
                <div className="text-2xl font-bold font-mono text-white">${currentSavings.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Current Retained Surplus</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-cyan-300">${goals.monthlySavingsTarget.toLocaleString()}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Monthly Goal</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 mb-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  savingsPercent >= 100
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-sm shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                }`}
                style={{ width: `${Math.min(100, savingsPercent)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{savingsPercent >= 100 ? 'Goal Surpassed' : `$${(goals.monthlySavingsTarget - currentSavings).toLocaleString()} remaining`}</span>
              <span>Pace: {savingsPercent >= 100 ? '+101.6%' : `${savingsPercent}%`}</span>
            </div>
          </div>

          {/* Interactive Target Slider */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Adjust Savings Target</span>
              <span className="font-mono text-cyan-400 font-semibold">${goals.monthlySavingsTarget.toLocaleString()}/mo</span>
            </div>
            <input
              type="range"
              min="1000"
              max="6000"
              step="100"
              value={goals.monthlySavingsTarget}
              onChange={(e) => onUpdateGoals({ ...goals, monthlySavingsTarget: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>$1,000/mo</span>
              <span>$3,500/mo</span>
              <span>$6,000/mo</span>
            </div>
          </div>
        </div>

        {/* Goal 2: Nightly Sleep Target */}
        <div className="p-5 bg-[#111827]/80 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4 shadow-lg shadow-black/20">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>Nightly Sleep Target</span>
              </div>
              <span className={`text-xs font-mono font-bold ${sleepPercent >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {sleepPercent}%
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <div>
                <div className="text-2xl font-bold font-mono text-white">{currentAvgSleep} <span className="text-sm font-normal text-slate-400">hrs</span></div>
                <div className="text-[11px] text-slate-400 mt-0.5">7-Day Nightly Average</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-cyan-300">{goals.nightlySleepTarget} hrs</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Target Duration</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 mb-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  sleepPercent >= 95
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                    : 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                }`}
                style={{ width: `${Math.min(100, sleepPercent)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{currentAvgSleep >= goals.nightlySleepTarget ? 'Target Satisfied' : `${(goals.nightlySleepTarget - currentAvgSleep).toFixed(1)}h nightly deficit`}</span>
              <span>Pace: {sleepPercent}%</span>
            </div>
          </div>

          {/* Interactive Sleep Slider */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Adjust Sleep Target</span>
              <span className="font-mono text-cyan-400 font-semibold">{goals.nightlySleepTarget} hrs/night</span>
            </div>
            <input
              type="range"
              min="6.0"
              max="9.0"
              step="0.1"
              value={goals.nightlySleepTarget}
              onChange={(e) => onUpdateGoals({ ...goals, nightlySleepTarget: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>6.0h (Minimum)</span>
              <span>7.5h (Optimal)</span>
              <span>9.0h (Extended)</span>
            </div>
          </div>
        </div>

        {/* Goal 3: Weekly Exercise Target */}
        <div className="p-5 bg-[#111827]/80 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4 shadow-lg shadow-black/20">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Dumbbell className="w-4 h-4 text-amber-400" />
                <span>Weekly Exercise Target</span>
              </div>
              <span className={`text-xs font-mono font-bold ${exercisePercent >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {exercisePercent}%
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <div>
                <div className="text-2xl font-bold font-mono text-white">{currentWeeklyExercise} <span className="text-sm font-normal text-slate-400">min</span></div>
                <div className="text-[11px] text-slate-400 mt-0.5">Active Workout (7D)</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-amber-300">{goals.weeklyExerciseTarget} min</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Weekly Goal</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 mb-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  exercisePercent >= 100
                    ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-600 to-amber-400'
                }`}
                style={{ width: `${Math.min(100, exercisePercent)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{currentWeeklyExercise >= goals.weeklyExerciseTarget ? 'Target Achieved' : `${goals.weeklyExerciseTarget - currentWeeklyExercise} min to target`}</span>
              <span>Pace: {exercisePercent}%</span>
            </div>
          </div>

          {/* Interactive Exercise Slider */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Adjust Exercise Target</span>
              <span className="font-mono text-amber-400 font-semibold">{goals.weeklyExerciseTarget} min/week</span>
            </div>
            <input
              type="range"
              min="90"
              max="360"
              step="15"
              value={goals.weeklyExerciseTarget}
              onChange={(e) => onUpdateGoals({ ...goals, weeklyExerciseTarget: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>90m (Maintenance)</span>
              <span>180m (WHO Standard)</span>
              <span>360m (High Performance)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Target Strip: Daily Steps & Max Stress Threshold */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Steps */}
        <div className="p-5 bg-[#111827]/80 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Footprints className="w-4 h-4 text-emerald-400" />
              <span>Daily Movement Target</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{stepsPercent}%</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xl font-bold font-mono text-white">{currentAvgSteps.toLocaleString()} steps/day</div>
              <div className="text-[11px] text-slate-400">Recent 7-Day Average</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-emerald-400">{goals.dailyStepsTarget.toLocaleString()} steps</div>
              <div className="text-[11px] text-slate-400">Target</div>
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, stepsPercent)}%` }}></div>
          </div>

          <div className="pt-2 flex justify-between text-xs text-slate-400">
            <span>Cardiovascular baseline maintained</span>
            <span className="font-mono">{goals.dailyStepsTarget - currentAvgSteps > 0 ? `${(goals.dailyStepsTarget - currentAvgSteps).toLocaleString()} to target` : 'Exceeded'}</span>
          </div>
        </div>

        {/* Max Stress Ceiling */}
        <div className="p-5 bg-[#111827]/80 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>Maximum Stress Ceiling</span>
            </div>
            <span className={`text-xs font-mono font-bold ${currentAvgStress <= goals.maxStressCeiling ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currentAvgStress <= goals.maxStressCeiling ? 'Within Safe Ceiling' : 'Breached'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-xl font-bold font-mono text-white">{currentAvgStress} / 10</div>
              <div className="text-[11px] text-slate-400">Recent 7-Day Average</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-indigo-400">&le; {goals.maxStressCeiling} / 10</div>
              <div className="text-[11px] text-slate-400">Target Threshold</div>
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (currentAvgStress / 10) * 100)}%` }}></div>
          </div>

          <div className="pt-2 flex justify-between text-xs text-slate-400">
            <span>Autonomic preservation zone</span>
            <span className="font-mono">{currentAvgStress <= goals.maxStressCeiling ? 'Optimal cognitive capacity' : 'Stress dampening recommended'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
