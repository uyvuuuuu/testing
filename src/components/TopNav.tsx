import React from 'react';
import { User } from 'firebase/auth';
import { Cloud, Plus, Sparkles, RefreshCw, ExternalLink, Target } from 'lucide-react';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onOpenSignIn: () => void;
  onLogout: () => void;
  onOpenQuickLog: () => void;
  onOpenAdvisor: () => void;
  sheetUrl?: string | null;
  isSyncing: boolean;
  onSync: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenSignIn,
  onLogout,
  onOpenQuickLog,
  onOpenAdvisor,
  sheetUrl,
  isSyncing,
  onSync,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'goals', label: 'Goals' },
    { id: 'finances', label: 'Finances' },
    { id: 'physical', label: 'Physical Vitality' },
    { id: 'mental', label: 'Mental Wellbeing' },
    { id: 'correlations', label: 'Cross Correlations' },
    { id: 'scenarios', label: 'Scenario Studio' },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand title wordmark */}
      <div 
        onClick={() => setActiveTab('overview')} 
        className="flex items-center gap-3 shrink-0 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          Nexus Life Command
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-400">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                isActive
                  ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions & Workspace Sync */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Multi-turn Gemini Chatbot Button */}
        <button
          onClick={onOpenAdvisor}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-200 bg-cyan-950/80 border border-cyan-800/80 rounded-md hover:bg-cyan-900 transition-colors cursor-pointer whitespace-nowrap shadow-sm shadow-cyan-950"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Advisor</span>
        </button>

        <button
          onClick={onOpenQuickLog}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800/90 border border-slate-700/80 rounded-md hover:bg-slate-700 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Log Entry</span>
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onSync}
              disabled={isSyncing}
              title="Synchronize with Google Sheet"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-md hover:bg-emerald-900/50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Drive Synced</span>
            </button>

            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noreferrer"
                title="Open Master Ledger in Google Sheets"
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 border border-slate-700/60 rounded-md transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/40 rounded-md transition-colors cursor-pointer whitespace-nowrap"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenSignIn}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-md hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-cyan-900/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <Cloud className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden sm:inline">Connect Google Drive</span>
            <span className="sm:hidden">Connect</span>
          </button>
        )}
      </div>
    </header>
  );
};
