import {
  FinancialRecord,
  MonthlyFinancialSummary,
  PhysicalHealthRecord,
  MentalHealthRecord,
} from '../types/lifeData';

export const INITIAL_MONTHLY_SUMMARIES: MonthlyFinancialSummary[] = [
  {
    month: '2026-05',
    income: 7600,
    fixedExpenses: 3150,
    variableExpenses: 2400,
    totalExpenses: 5550,
    netSavings: 2050,
    liquidNetWorth: 72200,
  },
  {
    month: '2026-06',
    income: 7600,
    fixedExpenses: 3150,
    variableExpenses: 2100,
    totalExpenses: 5250,
    netSavings: 2350,
    liquidNetWorth: 74550,
  },
  {
    month: '2026-07',
    income: 8200,
    fixedExpenses: 3200,
    variableExpenses: 2650, // High stress month - sprint crunch
    totalExpenses: 5850,
    netSavings: 2350,
    liquidNetWorth: 76900,
  },
  {
    month: '2026-08',
    income: 7800,
    fixedExpenses: 3200,
    variableExpenses: 2800, // Travel & burnout recovery
    totalExpenses: 6000,
    netSavings: 1800,
    liquidNetWorth: 78700,
  },
  {
    month: '2026-09',
    income: 7800,
    fixedExpenses: 3200,
    variableExpenses: 1950,
    totalExpenses: 5150,
    netSavings: 2650,
    liquidNetWorth: 81350,
  },
  {
    month: '2026-10',
    income: 8400,
    fixedExpenses: 3250,
    variableExpenses: 2100,
    totalExpenses: 5350,
    netSavings: 3050,
    liquidNetWorth: 84400,
  },
];

export const INITIAL_FINANCIAL_RECORDS: FinancialRecord[] = [
  { id: 'f-1', date: '2026-10-27', category: 'Income', description: 'Consulting Retainer & Salary', type: 'income', amount: 4200 },
  { id: 'f-2', date: '2026-10-26', category: 'Housing', description: 'Apartment Lease & Building Service', type: 'fixed_expense', amount: 2400 },
  { id: 'f-3', date: '2026-10-25', category: 'Food & Dining', description: 'Organic Market & Meal Prep Batch', type: 'variable_expense', amount: 185 },
  { id: 'f-4', date: '2026-10-24', category: 'Investments', description: 'Index Fund DCA Automation', type: 'fixed_expense', amount: 1000 },
  { id: 'f-5', date: '2026-10-23', category: 'Healthcare', description: 'Physiotherapy & Sauna Session', type: 'variable_expense', amount: 120 },
  { id: 'f-6', date: '2026-10-22', category: 'Personal & Discretionary', description: 'Ergonomic Standing Desk Mat', type: 'variable_expense', amount: 89 },
  { id: 'f-7', date: '2026-10-20', category: 'Transportation', description: 'Metro Pass & EV Charging', type: 'fixed_expense', amount: 160 },
  { id: 'f-8', date: '2026-10-18', category: 'Food & Dining', description: 'Late Night Delivery (Stress Sprint)', type: 'variable_expense', amount: 64 },
];

// Generate 30 days of correlated daily records
export function generateRecentDailyRecords() {
  const physical: PhysicalHealthRecord[] = [];
  const mental: MentalHealthRecord[] = [];

  const baseDate = new Date('2026-10-28');

  // Specific correlation simulation patterns
  for (let i = 29; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Simulate cyclic stress waves (e.g. week 2 sprint, week 3 recovery)
    const isSprint = (i >= 12 && i <= 18);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    let stress = isSprint ? Math.floor(7 + Math.random() * 3) : Math.floor(3 + Math.random() * 3);
    if (isWeekend) stress = Math.max(2, stress - 2);

    // Physical correlates with stress
    const sleepHours = isSprint ? +(5.6 + Math.random() * 0.9).toFixed(1) : +(7.2 + Math.random() * 1.1).toFixed(1);
    const sleepQuality = isSprint ? Math.floor(58 + Math.random() * 15) : Math.floor(78 + Math.random() * 18);
    const restingHR = isSprint ? Math.floor(66 + Math.random() * 6) : Math.floor(58 + Math.random() * 5);
    const hrv = isSprint ? Math.floor(38 + Math.random() * 12) : Math.floor(62 + Math.random() * 18);
    const steps = isWeekend ? Math.floor(10500 + Math.random() * 3500) : isSprint ? Math.floor(5200 + Math.random() * 2000) : Math.floor(8200 + Math.random() * 2200);
    const activeCalories = Math.floor(steps * 0.045 + (isWeekend ? 300 : 150));
    const exerciseMinutes = isSprint ? (Math.random() > 0.6 ? 20 : 0) : (isWeekend ? 55 : 35);

    // Mental metrics
    const deepWorkHours = isSprint ? +(4.8 + Math.random() * 1.5).toFixed(1) : isWeekend ? 0.5 : +(3.2 + Math.random() * 1.2).toFixed(1);
    const energyRating = isSprint ? Math.floor(4 + Math.random() * 2) : Math.floor(7 + Math.random() * 2.5);
    const moodValence = stress >= 8 ? 'Stressed' : stress >= 6 ? 'Low' : energyRating >= 8 ? 'Great' : 'Good';
    const burnoutRisk = stress >= 8 && sleepHours < 6.5 ? 'High' : stress >= 6 ? 'Moderate' : 'Low';

    physical.push({
      id: `p-${i}`,
      date: dateStr,
      sleepHours,
      sleepQualityScore: sleepQuality,
      restingHeartRate: restingHR,
      hrv,
      activeCalories,
      dailySteps: steps,
      exerciseMinutes,
    });

    mental.push({
      id: `m-${i}`,
      date: dateStr,
      stressLevel: stress,
      deepWorkHours,
      energyRating,
      moodValence,
      burnoutRisk,
      notes: isSprint ? 'Intense roadmap release deadline' : isWeekend ? 'Rest, nature hike & deliberate unplug' : 'Balanced execution & steady flow state',
    });
  }

  return { physical, mental };
}

const { physical, mental } = generateRecentDailyRecords();
export const INITIAL_PHYSICAL_RECORDS = physical;
export const INITIAL_MENTAL_RECORDS = mental;
