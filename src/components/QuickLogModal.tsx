import React, { useState } from 'react';
import { X, DollarSign, HeartPulse, Brain, Check, Loader2 } from 'lucide-react';
import { FinancialRecord, PhysicalHealthRecord, MentalHealthRecord } from '../types/lifeData';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFinancial: (rec: FinancialRecord) => Promise<void>;
  onAddPhysical: (rec: PhysicalHealthRecord) => Promise<void>;
  onAddMental: (rec: MentalHealthRecord) => Promise<void>;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onAddFinancial,
  onAddPhysical,
  onAddMental,
}) => {
  const [activeTab, setActiveTab] = useState<'financial' | 'physical' | 'mental'>('financial');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Financial Form
  const [finDate, setFinDate] = useState<string>(todayStr);
  const [finCategory, setFinCategory] = useState<FinancialRecord['category']>('Food & Dining');
  const [finDesc, setFinDesc] = useState<string>('');
  const [finType, setFinType] = useState<FinancialRecord['type']>('variable_expense');
  const [finAmount, setFinAmount] = useState<string>('');

  // Physical Form
  const [phyDate, setPhyDate] = useState<string>(todayStr);
  const [phySleep, setPhySleep] = useState<string>('7.5');
  const [phyQuality, setPhyQuality] = useState<string>('85');
  const [phyRHR, setPhyRHR] = useState<string>('59');
  const [phyHRV, setPhyHRV] = useState<string>('65');
  const [phySteps, setPhySteps] = useState<string>('8500');
  const [phyCalories, setPhyCalories] = useState<string>('450');
  const [phyExercise, setPhyExercise] = useState<string>('30');

  // Mental Form
  const [menDate, setMenDate] = useState<string>(todayStr);
  const [menStress, setMenStress] = useState<string>('4');
  const [menDeepWork, setMenDeepWork] = useState<string>('4.0');
  const [menEnergy, setMenEnergy] = useState<string>('7');
  const [menMood, setMenMood] = useState<MentalHealthRecord['moodValence']>('Good');
  const [menBurnout, setMenBurnout] = useState<MentalHealthRecord['burnoutRisk']>('Low');
  const [menNotes, setMenNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      if (activeTab === 'financial') {
        const amountNum = parseFloat(finAmount);
        if (isNaN(amountNum) || amountNum <= 0) throw new Error('Please enter a valid amount');
        const newRecord: FinancialRecord = {
          id: `f-${Date.now()}`,
          date: finDate,
          category: finCategory,
          description: finDesc.trim() || `${finCategory} Entry`,
          type: finType,
          amount: amountNum,
        };
        await onAddFinancial(newRecord);
        setFinDesc('');
        setFinAmount('');
      } else if (activeTab === 'physical') {
        const newRecord: PhysicalHealthRecord = {
          id: `p-${Date.now()}`,
          date: phyDate,
          sleepHours: parseFloat(phySleep) || 7,
          sleepQualityScore: parseInt(phyQuality) || 80,
          restingHeartRate: parseInt(phyRHR) || 60,
          hrv: parseInt(phyHRV) || 60,
          dailySteps: parseInt(phySteps) || 8000,
          activeCalories: parseInt(phyCalories) || 400,
          exerciseMinutes: parseInt(phyExercise) || 0,
        };
        await onAddPhysical(newRecord);
      } else {
        const newRecord: MentalHealthRecord = {
          id: `m-${Date.now()}`,
          date: menDate,
          stressLevel: parseInt(menStress) || 5,
          deepWorkHours: parseFloat(menDeepWork) || 3,
          energyRating: parseInt(menEnergy) || 6,
          moodValence: menMood,
          burnoutRisk: menBurnout,
          notes: menNotes.trim() || 'Daily check-in completed.',
        };
        await onAddMental(newRecord);
        setMenNotes('');
      }

      setSuccessMessage('Successfully recorded and synced!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Error adding entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg p-6 bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Quick Log Entry</h3>
        <p className="text-xs text-slate-400 mb-4">
          Append records to your active session and directly to your connected Google Sheet.
        </p>

        {/* Tab switchers */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('financial')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'financial' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
            <span>Finances</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('physical')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'physical' ? 'bg-amber-950 text-amber-300 border border-amber-800/60 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-amber-400" />
            <span>Physical</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mental')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'mental' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span>Mental</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'financial' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={finDate}
                    onChange={(e) => setFinDate(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Type</label>
                  <select
                    value={finType}
                    onChange={(e) => setFinType(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                  >
                    <option value="variable_expense">Variable Discretionary</option>
                    <option value="fixed_expense">Fixed Obligation</option>
                    <option value="income">Gross Inflow / Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Category</label>
                <select
                  value={finCategory}
                  onChange={(e) => setFinCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Housing">Housing</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Healthcare">Healthcare & Wellness</option>
                  <option value="Personal & Discretionary">Personal & Discretionary</option>
                  <option value="Investments">Investments</option>
                  <option value="Income">Income / Retainer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="120.00"
                    value={finAmount}
                    onChange={(e) => setFinAmount(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Grocery restock"
                    value={finDesc}
                    onChange={(e) => setFinDesc(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'physical' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={phyDate}
                    onChange={(e) => setPhyDate(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Sleep Duration (hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={phySleep}
                    onChange={(e) => setPhySleep(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Sleep Score (%)</label>
                  <input
                    type="number"
                    value={phyQuality}
                    onChange={(e) => setPhyQuality(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Resting HR (BPM)</label>
                  <input
                    type="number"
                    value={phyRHR}
                    onChange={(e) => setPhyRHR(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">HRV (ms)</label>
                  <input
                    type="number"
                    value={phyHRV}
                    onChange={(e) => setPhyHRV(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Daily Steps</label>
                  <input
                    type="number"
                    value={phySteps}
                    onChange={(e) => setPhySteps(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Active Calories</label>
                  <input
                    type="number"
                    value={phyCalories}
                    onChange={(e) => setPhyCalories(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Workout (min)</label>
                  <input
                    type="number"
                    value={phyExercise}
                    onChange={(e) => setPhyExercise(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'mental' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={menDate}
                    onChange={(e) => setMenDate(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Stress Level (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={menStress}
                    onChange={(e) => setMenStress(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Deep Work (hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={menDeepWork}
                    onChange={(e) => setMenDeepWork(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Energy (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={menEnergy}
                    onChange={(e) => setMenEnergy(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Mood Valence</label>
                  <select
                    value={menMood}
                    onChange={(e) => setMenMood(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                  >
                    <option value="Great">Great</option>
                    <option value="Good">Good</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Low">Low</option>
                    <option value="Stressed">Stressed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Reflections &amp; Context</label>
                <textarea
                  rows={2}
                  placeholder="Notes on sleep, work sprint, or cognitive focus..."
                  value={menNotes}
                  onChange={(e) => setMenNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white"
                />
              </div>
            </>
          )}

          {successMessage && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-800 rounded-md text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
