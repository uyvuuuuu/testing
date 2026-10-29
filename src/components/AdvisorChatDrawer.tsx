import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';
import { ChatMessage, LifeGoals, MonthlyFinancialSummary, PhysicalHealthRecord, MentalHealthRecord } from '../types/lifeData';

interface AdvisorChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  goals: LifeGoals;
  latestFinancial: MonthlyFinancialSummary;
  recentPhysical: PhysicalHealthRecord[];
  recentMental: MentalHealthRecord[];
}

export const AdvisorChatDrawer: React.FC<AdvisorChatDrawerProps> = ({
  isOpen,
  onClose,
  goals,
  latestFinancial,
  recentPhysical,
  recentMental,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Welcome to the Nexus Executive Advisory Console. I am monitoring your tri-pillar parameters in real time:\n\n• **Savings Pace**: $${latestFinancial.netSavings.toLocaleString()} / $${goals.monthlySavingsTarget.toLocaleString()} goal\n• **Sleep Equilibrium**: ${recentPhysical.slice(-7).reduce((a, b) => a + b.sleepHours, 0) / 7 > 0 ? (recentPhysical.slice(-7).reduce((a, b) => a + b.sleepHours, 0) / 7).toFixed(1) : 7.2}h / ${goals.nightlySleepTarget}h target\n• **Exercise Capacity**: ${recentPhysical.slice(-7).reduce((a, b) => a + b.exerciseMinutes, 0)}m / ${goals.weeklyExerciseTarget}m target\n\nHow can I assist your financial allocation, circadian recovery, or life runway strategy today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setInputPrompt('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const avgSleep = (recentPhysical.slice(-7).reduce((a, b) => a + b.sleepHours, 0) / 7).toFixed(1);
      const weeklyExercise = recentPhysical.slice(-7).reduce((a, b) => a + b.exerciseMinutes, 0);
      const avgSteps = Math.round(recentPhysical.slice(-7).reduce((a, b) => a + b.dailySteps, 0) / 7);
      const avgStress = (recentMental.slice(-7).reduce((a, b) => a + b.stressLevel, 0) / 7).toFixed(1);
      const deepWork = (recentMental.slice(-7).reduce((a, b) => a + b.deepWorkHours, 0) / 7).toFixed(1);

      const userContext = {
        goals,
        currentSavings: latestFinancial.netSavings,
        currentSleep: avgSleep,
        currentExercise: weeklyExercise,
        currentSteps: avgSteps,
        liquidNetWorth: latestFinancial.liquidNetWorth,
        runwayMonths: (latestFinancial.liquidNetWorth / latestFinancial.totalExpenses).toFixed(1),
        avgStress,
        deepWorkHours: deepWork,
        burnoutRisk: recentMental[recentMental.length - 1]?.burnoutRisk || 'Low',
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newThread.map((m) => ({ role: m.role, text: m.text })),
          userContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat API responded with status ${res.status}`);
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Analysis completed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error communicating with Gemini');
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'How can I hit a $3,500/mo savings target without increasing mental burnout?',
    'My sleep is averaging 7.2 hours. How can I reach my 7.5h goal with a busy schedule?',
    'Analyze the statistical connection between my stress level and discretionary spending.',
    'If I encounter a $10,000 unexpected expense, how will my runway be impacted?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-full bg-[#0E1524] border-l border-slate-800 flex flex-col justify-between shadow-2xl">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Nexus Intelligence Advisor</h3>
              <div className="text-[11px] text-slate-400 font-mono">gemini-3.8-flash · Real-Time Life Context</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <div className={`text-[10px] mt-1 font-mono ${isUser ? 'text-cyan-200' : 'text-slate-500'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
                Advisor is synthesizing your financial runway and biometric targets...
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-md text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-[#0B0F19]/50 overflow-x-auto">
          <div className="flex gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] text-slate-400 hover:text-cyan-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-md px-2.5 py-1 transition-colors whitespace-nowrap cursor-pointer text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-slate-800 bg-[#111827]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask about savings, sleep, burnout, or runway..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="p-2 text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
