import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  INITIAL_MONTHLY_SUMMARIES,
  INITIAL_FINANCIAL_RECORDS,
  INITIAL_PHYSICAL_RECORDS,
  INITIAL_MENTAL_RECORDS,
} from './data/sampleLifeData';
import {
  FinancialRecord,
  MonthlyFinancialSummary,
  PhysicalHealthRecord,
  MentalHealthRecord,
  LifeGoals,
} from './types/lifeData';
import { initAuth, googleSignIn, logout as fbLogout } from './lib/firebase';
import {
  findOrCreateLifeLedger,
  fetchLedgerData,
  appendFinancialToSheet,
  appendPhysicalToSheet,
  appendMentalToSheet,
  LedgerSheetInfo,
} from './lib/googleSheets';

import { TopNav } from './components/TopNav';
import { ExecutiveHUD } from './components/ExecutiveHUD';
import { GoalsWorkspace } from './components/GoalsWorkspace';
import { FinancialWorkspace } from './components/FinancialWorkspace';
import { PhysicalWorkspace } from './components/PhysicalWorkspace';
import { MentalWorkspace } from './components/MentalWorkspace';
import { CorrelationWorkspace } from './components/CorrelationWorkspace';
import { ScenarioStudio } from './components/ScenarioStudio';
import { QuickLogModal } from './components/QuickLogModal';
import { GoogleSyncModal } from './components/GoogleSyncModal';
import { AdvisorChatDrawer } from './components/AdvisorChatDrawer';

import { Compass, Sparkles, Target, Sliders, ArrowRight, MessageSquareText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Application Data State
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlyFinancialSummary[]>(INITIAL_MONTHLY_SUMMARIES);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(INITIAL_FINANCIAL_RECORDS);
  const [physicalRecords, setPhysicalRecords] = useState<PhysicalHealthRecord[]>(INITIAL_PHYSICAL_RECORDS);
  const [mentalRecords, setMentalRecords] = useState<MentalHealthRecord[]>(INITIAL_MENTAL_RECORDS);

  // User Goals State
  const [goals, setGoals] = useState<LifeGoals>({
    monthlySavingsTarget: 3000,
    nightlySleepTarget: 7.5,
    weeklyExerciseTarget: 180,
    dailyStepsTarget: 8500,
    maxStressCeiling: 4.5,
  });

  // Auth & Sync State
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [sheetInfo, setSheetInfo] = useState<LedgerSheetInfo | null>(null);

  // Modals & Drawers
  const [isQuickLogOpen, setIsQuickLogOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (authedUser, token) => {
        setUser(authedUser);
        setAccessToken(token);
        syncWithDriveAndSheets(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setSheetInfo(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync / Create Master Ledger in Google Drive
  const syncWithDriveAndSheets = async (token: string) => {
    setIsSyncing(true);
    try {
      const info = await findOrCreateLifeLedger(token);
      setSheetInfo(info);

      if (!info.isNew) {
        try {
          const { financesRows, physicalRows, mentalRows } = await fetchLedgerData(token, info.id);
          if (financesRows.length > 0) {
            const parsedFinances: FinancialRecord[] = financesRows.map((row: any, idx: number) => ({
              id: `sheet-f-${idx}`,
              date: row[0] || '2026-10-28',
              category: row[1] || 'Personal & Discretionary',
              description: row[2] || 'Ledger Entry',
              type: row[3] || 'variable_expense',
              amount: parseFloat(row[4]) || 0,
            }));
            if (parsedFinances.length > 0) setFinancialRecords(parsedFinances);
          }

          if (physicalRows.length > 0) {
            const parsedPhysical: PhysicalHealthRecord[] = physicalRows.map((row: any, idx: number) => ({
              id: `sheet-p-${idx}`,
              date: row[0] || '2026-10-28',
              sleepHours: parseFloat(row[1]) || 7,
              sleepQualityScore: parseInt(row[2]) || 80,
              restingHeartRate: parseInt(row[3]) || 60,
              hrv: parseInt(row[4]) || 60,
              activeCalories: parseInt(row[5]) || 400,
              dailySteps: parseInt(row[6]) || 8000,
              exerciseMinutes: parseInt(row[7]) || 30,
            }));
            if (parsedPhysical.length > 0) setPhysicalRecords(parsedPhysical);
          }

          if (mentalRows.length > 0) {
            const parsedMental: MentalHealthRecord[] = mentalRows.map((row: any, idx: number) => ({
              id: `sheet-m-${idx}`,
              date: row[0] || '2026-10-28',
              stressLevel: parseInt(row[1]) || 5,
              deepWorkHours: parseFloat(row[2]) || 3,
              energyRating: parseInt(row[3]) || 6,
              moodValence: row[4] || 'Good',
              burnoutRisk: row[5] || 'Low',
              notes: row[6] || '',
            }));
            if (parsedMental.length > 0) setMentalRecords(parsedMental);
          }
        } catch (e) {
          console.warn('Could not read existing sheet rows, using current data', e);
        }
      }
    } catch (err) {
      console.error('Drive/Sheets sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        await syncWithDriveAndSheets(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      alert('Sign-in cancelled or failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fbLogout();
    setUser(null);
    setAccessToken(null);
    setSheetInfo(null);
  };

  // Add records & sync to Google Sheets
  const handleAddFinancial = async (record: FinancialRecord) => {
    setFinancialRecords((prev) => [record, ...prev]);

    const latest = { ...monthlySummaries[monthlySummaries.length - 1] };
    if (record.type === 'income') {
      latest.income += record.amount;
      latest.netSavings += record.amount;
      latest.liquidNetWorth += record.amount;
    } else if (record.type === 'fixed_expense') {
      latest.fixedExpenses += record.amount;
      latest.totalExpenses += record.amount;
      latest.netSavings -= record.amount;
      latest.liquidNetWorth -= record.amount;
    } else {
      latest.variableExpenses += record.amount;
      latest.totalExpenses += record.amount;
      latest.netSavings -= record.amount;
      latest.liquidNetWorth -= record.amount;
    }
    setMonthlySummaries((prev) => [...prev.slice(0, -1), latest]);

    if (accessToken && sheetInfo) {
      await appendFinancialToSheet(accessToken, sheetInfo.id, record);
    }
  };

  const handleAddPhysical = async (record: PhysicalHealthRecord) => {
    setPhysicalRecords((prev) => [...prev, record]);
    if (accessToken && sheetInfo) {
      await appendPhysicalToSheet(accessToken, sheetInfo.id, record);
    }
  };

  const handleAddMental = async (record: MentalHealthRecord) => {
    setMentalRecords((prev) => [...prev, record]);
    if (accessToken && sheetInfo) {
      await appendMentalToSheet(accessToken, sheetInfo.id, record);
    }
  };

  const latestMonthly = monthlySummaries[monthlySummaries.length - 1];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Bar Contract */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenSignIn={() => setIsSyncModalOpen(true)}
        onLogout={handleLogout}
        onOpenQuickLog={() => setIsQuickLogOpen(true)}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        sheetUrl={sheetInfo?.url}
        isSyncing={isSyncing}
        onSync={() => accessToken && syncWithDriveAndSheets(accessToken)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Contextual Banner if using local demo data */}
        {!user && (
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>
                <strong>Interactive Mode:</strong> Displaying calibrated life analytics with sample financial and biometric data.
              </span>
            </div>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="px-3 py-1 font-semibold text-cyan-300 hover:text-white bg-cyan-950/70 border border-cyan-800/60 rounded-md transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
            >
              Connect Your Google Drive &amp; Sheets
            </button>
          </div>
        )}

        {/* Tab 1: Executive Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Tri-Pillar Real-Time HUD with Active Goals Progress Bars */}
            <ExecutiveHUD
              latestFinancial={latestMonthly}
              recentPhysical={physicalRecords}
              recentMental={mentalRecords}
              goals={goals}
              onNavigateTab={setActiveTab}
            />

            {/* Quick Strategic Life Balance Summary Banner */}
            <div className="p-6 bg-gradient-to-r from-[#111827] via-[#131D33] to-[#111827] border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Holistic Life Equilibrium</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  15.8 Months Liquid Runway · Sympathetic Balance · Manageable Stress
                </h1>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your current financial surplus of <strong className="text-emerald-400 font-mono">${latestMonthly.netSavings.toLocaleString()}/mo</strong> is tracking at <strong className="text-cyan-300 font-mono">{Math.round((latestMonthly.netSavings / goals.monthlySavingsTarget) * 100)}%</strong> of your ${goals.monthlySavingsTarget.toLocaleString()} goal. Average sleep is <strong className="text-cyan-300 font-mono">7.2h</strong> (target: {goals.nightlySleepTarget}h), with exercise at <strong className="text-amber-300 font-mono">{physicalRecords.slice(-7).reduce((acc: number, curr) => acc + curr.exerciseMinutes, 0)} min</strong> (target: {goals.weeklyExerciseTarget}m).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => setActiveTab('goals')}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span>Configure Goals</span>
                </button>

                <button
                  onClick={() => setActiveTab('scenarios')}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all shadow-md shadow-cyan-950 cursor-pointer whitespace-nowrap"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Simulate Life Event</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Side-by-side Highlights: Financial Snapshot + Cross Correlations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <div className="p-5 bg-[#111827]/80 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white">Financial Pillar Snapshot</h3>
                    <button
                      onClick={() => setActiveTab('finances')}
                      className="text-xs text-cyan-400 hover:underline cursor-pointer"
                    >
                      View Workspace →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                      <div className="text-slate-400">Liquid Net Worth</div>
                      <div className="text-lg font-bold font-mono text-white mt-0.5">${latestMonthly.liquidNetWorth.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                      <div className="text-slate-400">Current Monthly Burn</div>
                      <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">${latestMonthly.totalExpenses.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300">
                    <strong className="text-white block mb-1">Liquidity Runway:</strong>
                    At your current monthly fixed outflow of ${latestMonthly.fixedExpenses.toLocaleString()} and variable budget of ${latestMonthly.variableExpenses.toLocaleString()}, you possess over 15 months of total operational independence.
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="p-5 bg-[#111827]/80 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white">Vitality &amp; Mind Correlation</h3>
                    <button
                      onClick={() => setActiveTab('correlations')}
                      className="text-xs text-cyan-400 hover:underline cursor-pointer"
                    >
                      Explore Correlations →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                      <div className="text-slate-400">Stress vs. Impulse Spend</div>
                      <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">+0.72 (High)</div>
                    </div>
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                      <div className="text-slate-400">Sleep vs. Deep Focus</div>
                      <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">+0.68 (Direct)</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300">
                    <strong className="text-white block mb-1">Key Empirical Takeaway:</strong>
                    Spikes in delivery and retail expenses coincide with weeks where stress exceeds 7/10 and sleep dips below 6.5 hours. Preserving physical boundaries directly protects monthly capital retention.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Goals Workspace */}
        {activeTab === 'goals' && (
          <GoalsWorkspace
            goals={goals}
            onUpdateGoals={setGoals}
            latestFinancial={latestMonthly}
            recentPhysical={physicalRecords}
            recentMental={mentalRecords}
          />
        )}

        {/* Tab 3: Financial Workspace */}
        {activeTab === 'finances' && (
          <FinancialWorkspace
            monthlySummaries={monthlySummaries}
            records={financialRecords}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
          />
        )}

        {/* Tab 4: Physical Health Workspace */}
        {activeTab === 'physical' && (
          <PhysicalWorkspace
            records={physicalRecords}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
          />
        )}

        {/* Tab 5: Mental Health Workspace */}
        {activeTab === 'mental' && (
          <MentalWorkspace
            records={mentalRecords}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
          />
        )}

        {/* Tab 6: Cross-Domain Correlations */}
        {activeTab === 'correlations' && (
          <CorrelationWorkspace
            financialRecords={financialRecords}
            physicalRecords={physicalRecords}
            mentalRecords={mentalRecords}
          />
        )}

        {/* Tab 7: Scenario Studio */}
        {activeTab === 'scenarios' && (
          <ScenarioStudio
            latestFinancial={latestMonthly}
            recentPhysical={physicalRecords}
            recentMental={mentalRecords}
          />
        )}
      </main>

      {/* Floating Gemini AI Advisor Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsAdvisorOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-full shadow-xl shadow-cyan-950/60 transition-all transform hover:scale-105 cursor-pointer border border-cyan-400/30"
        >
          <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
          <span>Ask AI Advisor</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 bg-[#0B0F19] text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>Nexus Life Command</span>
          <span aria-hidden="true">·</span>
          <span>Google Drive &amp; Sheets Intelligence</span>
        </div>
        <div className="flex items-center gap-4">
          <span>AI Model: <strong className="text-slate-400 font-mono">gemini-3.8-flash</strong></span>
          <span aria-hidden="true">·</span>
          <span>All metrics stored in user-owned Drive ledger</span>
        </div>
      </footer>

      {/* Quick Log Modal */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onAddFinancial={handleAddFinancial}
        onAddPhysical={handleAddPhysical}
        onAddMental={handleAddMental}
      />

      {/* Google Sync Modal */}
      <GoogleSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        sheetInfo={sheetInfo}
        isSyncing={isSyncing}
        onForceSync={() => accessToken && syncWithDriveAndSheets(accessToken)}
      />

      {/* Multi-Turn Gemini Advisor Chat Drawer */}
      <AdvisorChatDrawer
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        goals={goals}
        latestFinancial={latestMonthly}
        recentPhysical={physicalRecords}
        recentMental={mentalRecords}
      />
    </div>
  );
}
