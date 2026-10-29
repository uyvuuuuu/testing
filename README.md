# Nexus Life Command

An executive intelligence command center that unifies personal finances, physical health, and mental wellbeing. Synchronizes with **Google Drive** and **Google Sheets**, visualizes cross-domain correlations, and runs predictive scenario forecasting powered by **Google Gemini AI**.

---

## Key Features

- **Google Drive & Sheets Integration**:
  - Connects using client-side Firebase Auth with Google Provider (least-privilege scopes: `drive.file` and `spreadsheets`).
  - Automatically checks or creates a dedicated **"Nexus Life Master Ledger"** spreadsheet in the user's Google Drive with formatted tabs for `Finances`, `Physical_Health`, and `Mental_Health`.
  - 1-click direct link to open the spreadsheet in Google Drive / Google Sheets.
  - Append new records seamlessly through the in-app Quick Log modal.

- **Tri-Pillar Executive Operations Console**:
  - **Financial Workspace**: Liquid net worth trajectory curve, monthly cashflow waterfall diagram (Gross Inflows → Fixed Obligations → Variable Outflows → Retained Capital), savings rate analysis, and transaction ledger.
  - **Physical Vitality Workspace**: Nightly sleep duration vs. resting heart rate & HRV dual-axis synchrony chart, 5-axis Physical Vitality Radar diagram (Sleep Quality, Cardio Efficiency, HRV Recovery, Movement, and Training Consistency).
  - **Mental Wellbeing Workspace**: Daily stress vs. cognitive energy trajectory, deep work focus vs. shallow work distribution, burnout risk diagnostic gauges, and qualitative reflections journal.

- **Cross-Domain Correlation Engine**:
  - Interactive scatter plot with linear regression fit lines analyzing cross-domain feedback loops.
  - Calculates statistical Pearson correlation coefficients (e.g. *Stress vs. Impulse Spending* at $+0.72$, *Sleep Deficit vs. Deep Work Focus* at $+0.68$, and *Movement vs. Next-Day Cognitive Energy* at $+0.79$).

- **Predictive Scenario Studio (Powered by Gemini 3.8 Flash)**:
  - Real-time mathematical modeling with interactive sliders for income adjustment ($-100\%$ to $+100\%$), expense variance ($-50\%$ to $+100\%$), immediate lump-sum shocks, and scenario duration.
  - 24-month projected runway curve comparing baseline trajectory against simulated scenarios.
  - Quick presets for major life events (*6-Month Unpaid Sabbatical*, *Economic Shock*, *Career Pivot*, *Medical Emergency*, *Relocation Upgrade*).
  - **AI Deep Simulation**: Server-side endpoint powered by `@google/genai` (`gemini-3.8-flash`) generating strategic executive verdicts, milestone forecasts, physiological impact trends, and tactical action plans.

- **Goals & Milestone Tracking**:
  - Define custom targets for monthly savings, nightly sleep, weekly workout minutes, daily steps, and stress ceilings.
  - Real-time progress bars displayed across the Goals workspace and directly on the Executive HUD.

- **Multi-Turn Gemini AI Advisor**:
  - Conversational executive advisor drawer with full context of your financial runway, biometrics, and active targets.
  - Quick prompt recommendations and scrollable message thread.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion
- **Backend / API**: Node.js, Express, tsx
- **AI / LLM**: `@google/genai` SDK with `gemini-3.8-flash`
- **Authentication & Workspace**: Firebase Auth (Google Sign-In), Google Drive API v3, Google Sheets API v4
- **Tooling**: Vite 8

---

## Project Structure

```
├── firebase-applet-config.json # Firebase configuration for Google OAuth
├── index.html                  # HTML entry point
├── metadata.json               # Applet capabilities & metadata
├── package.json                # Dependencies and scripts
├── server.ts                   # Express server with Vite middleware & Gemini AI routes
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite + Tailwind build configuration
└── src/
    ├── App.tsx                 # Main application dashboard controller
    ├── main.tsx                # React client entry point
    ├── index.css               # Global Tailwind CSS styles
    ├── types/
    │   └── lifeData.ts         # TypeScript definitions for all life domains & goals
    ├── lib/
    │   ├── firebase.ts         # Client-side Firebase Google Auth & token management
    │   └── googleSheets.ts     # Google Drive & Sheets API interactions
    ├── data/
    │   └── sampleLifeData.ts   # Baseline calibrated dataset for immediate offline preview
    └── components/
        ├── TopNav.tsx              # Top Bar navigation & sync controls
        ├── ExecutiveHUD.tsx        # Tri-pillar HUD cards & active goal progress bars
        ├── GoalsWorkspace.tsx      # Target settings & milestone tracking
        ├── FinancialWorkspace.tsx  # Net worth curve, cashflow waterfall, ledger
        ├── PhysicalWorkspace.tsx   # Sleep vs HR synchrony, 5-axis vitality radar
        ├── MentalWorkspace.tsx     # Stress vs energy curve, burnout diagnostics
        ├── CorrelationWorkspace.tsx# Cross-domain scatter plots & Pearson matrix
        ├── ScenarioStudio.tsx      # Interactive runway sliders & Gemini AI simulator
        ├── QuickLogModal.tsx       # Fast entry modal with Google Sheets sync
        ├── GoogleSyncModal.tsx     # Google Drive connection modal
        └── AdvisorChatDrawer.tsx   # Multi-turn Gemini AI conversational assistant
```

---

## Getting Started

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
GEMINI_API_KEY="your-google-gemini-api-key"
PORT=3000
```
> Obtain an API key from [Google AI Studio](https://aistudio.google.com/).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## How to Push this Code to GitHub

If you want to initialize and push this codebase to your own GitHub repository:

```bash
# 1. Initialize git in the project root
git init

# 2. Add all files (respects .gitignore)
git add .

# 3. Create your initial commit
git commit -m "Initial commit: Nexus Life Command dashboard"

# 4. Set the default branch to main
git branch -M main

# 5. Add your GitHub remote repository URL (create an empty repository on GitHub first)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push code to GitHub
git push -u origin main
```
