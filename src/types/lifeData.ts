export interface FinancialRecord {
  id: string;
  date: string; // YYYY-MM-DD
  category: 'Income' | 'Housing' | 'Food & Dining' | 'Transportation' | 'Healthcare' | 'Personal & Discretionary' | 'Investments';
  description: string;
  type: 'income' | 'fixed_expense' | 'variable_expense';
  amount: number;
}

export interface MonthlyFinancialSummary {
  month: string; // YYYY-MM
  income: number;
  fixedExpenses: number;
  variableExpenses: number;
  totalExpenses: number;
  netSavings: number;
  liquidNetWorth: number;
}

export interface PhysicalHealthRecord {
  id: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  sleepQualityScore: number; // 0 - 100
  restingHeartRate: number; // BPM
  hrv: number; // Heart Rate Variability in ms
  activeCalories: number;
  dailySteps: number;
  exerciseMinutes: number;
}

export interface MentalHealthRecord {
  id: string;
  date: string; // YYYY-MM-DD
  stressLevel: number; // 1 - 10
  deepWorkHours: number;
  energyRating: number; // 1 - 10
  moodValence: 'Great' | 'Good' | 'Neutral' | 'Low' | 'Stressed';
  burnoutRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  notes: string;
}

export interface LifeGoals {
  monthlySavingsTarget: number; // e.g. $3,000 / month
  nightlySleepTarget: number; // e.g. 7.5 hours / night
  weeklyExerciseTarget: number; // e.g. 180 minutes / week
  dailyStepsTarget: number; // e.g. 8,500 steps / day
  maxStressCeiling: number; // e.g. <= 4.5 / 10
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ScenarioInput {
  name: string;
  description: string;
  incomeChangePercent: number; // e.g. -100 for unpaid sabbatical, -20 for pay cut
  expenseChangePercent: number; // e.g. -25 for frugal pivot, +30 for lifestyle upgrade
  lumpSum: number; // e.g. -15000 for emergency or +20000 for severance
  durationMonths: number;
  targetStressGoal: number; // e.g. reduce stress by -3
}

export interface ScenarioForecastResult {
  executiveSummary: string;
  resilienceRating: 'High' | 'Moderate' | 'Vulnerable';
  projectedRunwayMonths: number;
  runwayChangeVsBaseline: string;
  physicalHealthForecast: {
    projectedSleepScore: string;
    cardiovascularTrend: string;
    physicalRiskFactors: string[];
  };
  mentalHealthForecast: {
    projectedStressScore: number;
    burnoutTrajectory: string;
    cognitiveFocusImpact: string;
  };
  monthlyProjections: {
    month: number;
    projectedLiquidAssets: number;
    projectedNetCashflow: number;
    estimatedStress: number;
    statusMilestone: string;
  }[];
  actionableRecommendations: string[];
}
