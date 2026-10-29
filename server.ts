import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google Gemini API on server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Scenario prediction endpoint
app.post('/api/predict-scenario', async (req, res) => {
  try {
    const { baseline, scenario } = req.body;

    if (!baseline || !scenario) {
      return res.status(400).json({ error: 'Missing baseline or scenario data' });
    }

    const prompt = `
You are an elite personal financial analyst, biometric physiologist, and mental resilience advisor.
Analyze the following baseline personal metrics and proposed scenario change to project future financial runway, physical stamina, and mental burnout risks over a 24-month horizon.

BASELINE METRICS:
- Liquid Net Worth: $${baseline.liquidNetWorth}
- Monthly Inflow / Income: $${baseline.monthlyIncome}
- Monthly Fixed Expenses: $${baseline.monthlyFixedExpenses}
- Monthly Variable Expenses: $${baseline.monthlyVariableExpenses}
- Current Monthly Burn: $${baseline.monthlyFixedExpenses + baseline.monthlyVariableExpenses}
- Average Sleep Duration: ${baseline.avgSleep} hours/night
- Resting Heart Rate: ${baseline.restingHR} BPM
- Average Daily Steps: ${baseline.avgSteps}
- Baseline Stress Level: ${baseline.stressLevel}/10
- Daily Deep Work Focus: ${baseline.deepWorkHours} hours
- Current Burnout Risk: ${baseline.burnoutRisk}

PROPOSED LIFE SCENARIO:
- Scenario Title: ${scenario.name}
- Income Change: ${scenario.incomeChangePercent}%
- Expense Change: ${scenario.expenseChangePercent}%
- Immediate Lump-Sum Outflow / Inflow: $${scenario.lumpSum}
- Duration of Scenario: ${scenario.durationMonths} months
- Notes / Context: ${scenario.description || 'General life transition test'}

Generate a thorough, realistic analytical forecast. Account for the interconnected reality that financial anxiety triggers sleep disruption and cognitive fatigue, while sustained sabbaticals or lower expense loads can drastically boost mental focus and cardiovascular health.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an objective executive intelligence coach providing mathematically grounded financial runway projections and holistic physical/mental wellbeing forecasts.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: '2-3 sentence strategic executive synthesis of the compound scenario.',
            },
            resilienceRating: {
              type: Type.STRING,
              description: 'Vulnerable, Moderate, or High resilience rating.',
            },
            projectedRunwayMonths: {
              type: Type.NUMBER,
              description: 'Calculated financial runway in months under this scenario (e.g., 18 or 99 if cashflow positive).',
            },
            runwayChangeVsBaseline: {
              type: Type.STRING,
              description: 'E.g. +6 months, -8 months, or Indefinite.',
            },
            physicalHealthForecast: {
              type: Type.OBJECT,
              properties: {
                projectedSleepScore: { type: Type.STRING, description: 'Projected sleep quality trend and score' },
                cardiovascularTrend: { type: Type.STRING, description: 'Projected resting HR and HRV trajectory' },
                physicalRiskFactors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Key physical health risks or benefits to monitor',
                },
              },
              required: ['projectedSleepScore', 'cardiovascularTrend', 'physicalRiskFactors'],
            },
            mentalHealthForecast: {
              type: Type.OBJECT,
              properties: {
                projectedStressScore: { type: Type.NUMBER, description: 'Expected stress level on 1-10 scale' },
                burnoutTrajectory: { type: Type.STRING, description: 'Decreasing, Stable, or Elevated risk' },
                cognitiveFocusImpact: { type: Type.STRING, description: 'Impact on deep work capacity and clarity' },
              },
              required: ['projectedStressScore', 'burnoutTrajectory', 'cognitiveFocusImpact'],
            },
            monthlyProjections: {
              type: Type.ARRAY,
              description: 'Sample trajectory milestones at Month 1, 3, 6, 12, 18, 24',
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.NUMBER },
                  projectedLiquidAssets: { type: Type.NUMBER },
                  projectedNetCashflow: { type: Type.NUMBER },
                  estimatedStress: { type: Type.NUMBER },
                  statusMilestone: { type: Type.STRING },
                },
                required: ['month', 'projectedLiquidAssets', 'projectedNetCashflow', 'estimatedStress', 'statusMilestone'],
              },
            },
            actionableRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 tactical recommendations balancing finances, physical habits, and mental preservation.',
            },
          },
          required: [
            'executiveSummary',
            'resilienceRating',
            'projectedRunwayMonths',
            'runwayChangeVsBaseline',
            'physicalHealthForecast',
            'mentalHealthForecast',
            'monthlyProjections',
            'actionableRecommendations',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Scenario prediction error:', error);
    return res.status(500).json({
      error: 'Failed to generate scenario projection',
      details: error.message || String(error),
    });
  }
});

// Multi-turn Gemini chatbot endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const systemInstruction = `You are the Nexus Life Intelligence Advisor, an elite executive coach, personal CFO, and biometric performance scientist.
You have real-time access to the user's dashboard data and targets:
- Monthly Savings Target: $${userContext?.goals?.monthlySavingsTarget ?? 3000} (Current Net Savings: $${userContext?.currentSavings ?? 3050})
- Nightly Sleep Target: ${userContext?.goals?.nightlySleepTarget ?? 7.5}h (Current 7D Avg: ${userContext?.currentSleep ?? 7.2}h)
- Weekly Exercise Target: ${userContext?.goals?.weeklyExerciseTarget ?? 180} min (Current: ${userContext?.currentExercise ?? 195} min)
- Daily Steps Target: ${userContext?.goals?.dailyStepsTarget ?? 8500} steps (Current: ${userContext?.currentSteps ?? 8420})
- Liquid Net Worth: $${userContext?.liquidNetWorth ?? 84400}
- Liquid Financial Runway: ${userContext?.runwayMonths ?? 15.8} months
- Baseline Stress Level: ${userContext?.avgStress ?? 4.5}/10
- Deep Work Capacity: ${userContext?.deepWorkHours ?? 3.8}h/day
- Burnout Risk: ${userContext?.burnoutRisk ?? 'Low'}

Your persona:
- Sharp, strategic, objective, empathetic yet disciplined.
- Connect the dots across financial freedom, cardiovascular health, and cognitive clarity.
- Provide actionable, structured guidance (with bullet points or quantitative metrics where relevant).
- Avoid generic pleasantries, filler phrases, or empty motivation. Speak like a trusted executive strategist.`;

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      reply: chatResponse.text || 'I analyzed your parameters. Let us focus on maintaining your savings rate and expanding your deep sleep window.',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Failed to generate chat response',
      details: error.message || String(error),
    });
  }
});

// Production static serving or Vite middleware
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Nexus Life Command server running at http://0.0.0.0:${PORT}`);
});
