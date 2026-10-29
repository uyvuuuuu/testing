import React, { useState } from 'react';
import { MonthlyFinancialSummary, FinancialRecord } from '../types/lifeData';
import { TrendingUp, Layers, ArrowDownRight, ArrowUpRight, Filter, Search } from 'lucide-react';

interface FinancialWorkspaceProps {
  monthlySummaries: MonthlyFinancialSummary[];
  records: FinancialRecord[];
  onOpenQuickLog: () => void;
}

export const FinancialWorkspace: React.FC<FinancialWorkspaceProps> = ({
  monthlySummaries,
  records,
  onOpenQuickLog,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyFinancialSummary | null>(null);

  const latest = monthlySummaries[monthlySummaries.length - 1];
  const previous = monthlySummaries[monthlySummaries.length - 2] || latest;
  const netWorthGrowth = latest.liquidNetWorth - previous.liquidNetWorth;
  const savingsRate = Math.round((latest.netSavings / latest.income) * 100);

  // Filter records
  const filteredRecords = records.filter((rec) => {
    const matchesFilter = selectedFilter === 'all' || rec.category.toLowerCase().includes(selectedFilter.toLowerCase());
    const matchesSearch = searchQuery === '' || rec.description.toLowerCase().includes(searchQuery.toLowerCase()) || rec.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // SVG Chart math for Net Worth curve
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 30;

  const minWorth = Math.min(...monthlySummaries.map((m) => m.liquidNetWorth)) * 0.95;
  const maxWorth = Math.max(...monthlySummaries.map((m) => m.liquidNetWorth)) * 1.05;

  const points = monthlySummaries.map((m, idx) => {
    const x = paddingX + (idx / (monthlySummaries.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((m.liquidNetWorth - minWorth) / (maxWorth - minWorth)) * (chartHeight - paddingY * 2);
    return { x, y, data: m };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="space-y-6">
      {/* Top Financial KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">Liquid Net Worth</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">${latest.liquidNetWorth.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">+${netWorthGrowth.toLocaleString()} vs prior month</span>
          </div>
        </div>

        <div className="p-4 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">Monthly Inflow (Income)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-300">${latest.income.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Recurring consulting & salary</div>
        </div>

        <div className="p-4 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">Total Monthly Burn</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-300">${latest.totalExpenses.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">
            Fixed ${latest.fixedExpenses.toLocaleString()} + Variable ${latest.variableExpenses.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">Net Savings Rate</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">{savingsRate}%</div>
          <div className="text-xs text-slate-400 mt-1 font-mono tabular-nums">+${latest.netSavings.toLocaleString()} retained surplus</div>
        </div>
      </div>

      {/* Main Row: Net Worth Curve + Cashflow Waterfall Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Net Worth Trajectory Chart */}
        <div className="lg:col-span-7 p-5 bg-[#111827]/80 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Liquid Net Worth & Capital Trajectory</h2>
              <div className="text-xs text-slate-400">Monthly progression of accessible capital reserves</div>
            </div>
            {hoveredPoint ? (
              <div className="text-right">
                <span className="text-xs font-mono text-cyan-400 font-bold">${hoveredPoint.liquidNetWorth.toLocaleString()}</span>
                <span className="text-xs text-slate-500 ml-1.5">({hoveredPoint.month})</span>
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-400">Hover for details</div>
            )}
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[500px]">
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal gridlines */}
              {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                const y = paddingY + ratio * (chartHeight - paddingY * 2);
                const val = Math.round(maxWorth - ratio * (maxWorth - minWorth));
                return (
                  <g key={idx}>
                    <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#1E293B" strokeDasharray="3 3" />
                    <text x={paddingX - 6} y={y + 3} textAnchor="end" fill="#64748B" fontSize="10" className="font-mono">
                      ${Math.round(val / 1000)}k
                    </text>
                  </g>
                );
              })}

              {/* Area & Line */}
              <path d={areaD} fill="url(#netWorthGrad)" />
              <path d={pathD} fill="none" stroke="#06B6D4" strokeWidth="2.5" />

              {/* Interactive Points */}
              {points.map((pt, idx) => (
                <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt.data)} onMouseLeave={() => setHoveredPoint(null)}>
                  <circle cx={pt.x} cy={pt.y} r={hoveredPoint?.month === pt.data.month ? '6' : '3.5'} fill="#0B0F19" stroke="#06B6D4" strokeWidth="2" />
                  <text x={pt.x} y={chartHeight - 10} textAnchor="middle" fill="#64748B" fontSize="10" className="font-mono">
                    {pt.data.month.slice(5)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Right: Cashflow Breakdown & Waterfall Diagram */}
        <div className="lg:col-span-5 p-5 bg-[#111827]/80 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Monthly Cashflow Waterfall Diagram</h2>
            <div className="text-xs text-slate-400 mb-5">Current month flow from gross inflow to retained liquid surplus</div>

            <div className="space-y-4">
              {/* Inflow */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-cyan-400 font-medium">1. Gross Inflow</span>
                  <span className="font-mono text-white font-bold">${latest.income.toLocaleString()} (100%)</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Fixed Expenses */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">2. Fixed Outflows (Housing, Insurance, Debt)</span>
                  <span className="font-mono text-amber-300 font-bold">-${latest.fixedExpenses.toLocaleString()} ({Math.round((latest.fixedExpenses / latest.income) * 100)}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(latest.fixedExpenses / latest.income) * 100}%` }}></div>
                </div>
              </div>

              {/* Variable Expenses */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">3. Discretionary & Lifestyle (Dining, Leisure)</span>
                  <span className="font-mono text-rose-300 font-bold">-${latest.variableExpenses.toLocaleString()} ({Math.round((latest.variableExpenses / latest.income) * 100)}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(latest.variableExpenses / latest.income) * 100}%` }}></div>
                </div>
              </div>

              {/* Retained Surplus */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-medium">4. Net Retained Capital Surplus</span>
                  <span className="font-mono text-emerald-400 font-bold">+${latest.netSavings.toLocaleString()} ({savingsRate}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${savingsRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-6 text-xs text-slate-400 flex items-center justify-between">
            <span>Capital Efficiency: <strong className="text-emerald-400">Exceptional</strong></span>
            <span aria-hidden="true">·</span>
            <span>Runway Horizon: <strong className="text-white font-mono">{(latest.liquidNetWorth / latest.totalExpenses).toFixed(1)} months</strong></span>
          </div>
        </div>
      </div>

      {/* Ledger & Transactions Table */}
      <div className="p-5 bg-[#111827]/80 border border-slate-800 rounded-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Financial Transaction Ledger</h2>
            <div className="text-xs text-slate-400">Synced directly with Google Sheets `Finances` tab</div>
          </div>

          {/* Search and Category Filter controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
              {['all', 'Housing', 'Food', 'Investments'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedFilter === cat ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenQuickLog}
              className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              Add Entry
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredRecords.map((rec) => {
                const isIncome = rec.type === 'income';
                return (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 tabular-nums">{rec.date}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-sans font-medium">{rec.description}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">{rec.category}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">
                      {isIncome ? 'Inflow' : rec.type === 'fixed_expense' ? 'Fixed Expense' : 'Variable Expense'}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold tabular-nums ${isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {isIncome ? `+$${rec.amount.toLocaleString()}` : `-$${rec.amount.toLocaleString()}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
