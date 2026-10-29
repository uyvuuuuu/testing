import { FinancialRecord, PhysicalHealthRecord, MentalHealthRecord } from '../types/lifeData';

export interface LedgerSheetInfo {
  id: string;
  name: string;
  url: string;
  isNew: boolean;
}

const LEDGER_NAME = 'Nexus Life Master Ledger';

/**
 * Searches user's Google Drive for the Nexus Life Master Ledger.
 * If not found, creates it with formatted tabs and initial headers.
 */
export async function findOrCreateLifeLedger(accessToken: string): Promise<LedgerSheetInfo> {
  // 1. Search for existing file
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(
    LEDGER_NAME
  )}' and trashed=false&fields=files(id,name,webViewLink)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Drive search failed: ${searchRes.status} ${errText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    const existing = searchData.files[0];
    return {
      id: existing.id,
      name: existing.name,
      url: existing.webViewLink || `https://docs.google.com/spreadsheets/d/${existing.id}/edit`,
      isNew: false,
    };
  }

  // 2. Create new spreadsheet with 3 tabs
  const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  const createPayload = {
    properties: {
      title: LEDGER_NAME,
    },
    sheets: [
      {
        properties: {
          title: 'Finances',
          gridProperties: { rowCount: 100, columnCount: 7 },
        },
      },
      {
        properties: {
          title: 'Physical_Health',
          gridProperties: { rowCount: 100, columnCount: 8 },
        },
      },
      {
        properties: {
          title: 'Mental_Health',
          gridProperties: { rowCount: 100, columnCount: 7 },
        },
      },
    ],
  };

  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Spreadsheet creation failed: ${createRes.status} ${err}`);
  }

  const newSheet = await createRes.json();
  const spreadsheetId = newSheet.spreadsheetId;
  const webViewLink = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 3. Write initial headers
  await seedInitialHeaders(accessToken, spreadsheetId);

  return {
    id: spreadsheetId,
    name: LEDGER_NAME,
    url: webViewLink,
    isNew: true,
  };
}

/**
 * Seeds headers into the newly created Google Sheet
 */
async function seedInitialHeaders(accessToken: string, spreadsheetId: string) {
  const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;

  const body = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: 'Finances!A1:G1',
        values: [
          ['Date', 'Category', 'Description', 'Type', 'Amount', 'Currency', 'Notes'],
        ],
      },
      {
        range: 'Physical_Health!A1:H1',
        values: [
          [
            'Date',
            'Sleep_Hours',
            'Sleep_Quality_Score',
            'Resting_Heart_Rate_BPM',
            'HRV_ms',
            'Active_Calories',
            'Daily_Steps',
            'Exercise_Minutes',
          ],
        ],
      },
      {
        range: 'Mental_Health!A1:G1',
        values: [
          [
            'Date',
            'Stress_Level_1_to_10',
            'Deep_Work_Hours',
            'Energy_Rating_1_to_10',
            'Mood_Valence',
            'Burnout_Risk',
            'Reflections_Notes',
          ],
        ],
      },
    ],
  };

  await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

/**
 * Appends a new financial record to the sheet
 */
export async function appendFinancialToSheet(
  accessToken: string,
  spreadsheetId: string,
  record: FinancialRecord
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Finances!A:G:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [[record.date, record.category, record.description, record.type, record.amount, 'USD', '']],
    }),
  });
  if (!res.ok) throw new Error(`Failed to append financial record: ${await res.text()}`);
  return res.json();
}

/**
 * Appends a new physical biometric record to the sheet
 */
export async function appendPhysicalToSheet(
  accessToken: string,
  spreadsheetId: string,
  record: PhysicalHealthRecord
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Physical_Health!A:H:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [
        [
          record.date,
          record.sleepHours,
          record.sleepQualityScore,
          record.restingHeartRate,
          record.hrv,
          record.activeCalories,
          record.dailySteps,
          record.exerciseMinutes,
        ],
      ],
    }),
  });
  if (!res.ok) throw new Error(`Failed to append physical record: ${await res.text()}`);
  return res.json();
}

/**
 * Appends a new mental health record to the sheet
 */
export async function appendMentalToSheet(
  accessToken: string,
  spreadsheetId: string,
  record: MentalHealthRecord
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Mental_Health!A:G:append?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [
        [
          record.date,
          record.stressLevel,
          record.deepWorkHours,
          record.energyRating,
          record.moodValence,
          record.burnoutRisk,
          record.notes,
        ],
      ],
    }),
  });
  if (!res.ok) throw new Error(`Failed to append mental record: ${await res.text()}`);
  return res.json();
}

/**
 * Reads existing rows from user's sheet
 */
export async function fetchLedgerData(accessToken: string, spreadsheetId: string) {
  const ranges = ['Finances!A2:G200', 'Physical_Health!A2:H200', 'Mental_Health!A2:G200'];
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges.map(encodeURIComponent).join('&ranges=')}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to read ledger sheets: ${await res.text()}`);
  }

  const data = await res.json();
  const valueRanges = data.valueRanges || [];

  const financesRows = valueRanges[0]?.values || [];
  const physicalRows = valueRanges[1]?.values || [];
  const mentalRows = valueRanges[2]?.values || [];

  return {
    financesRows,
    physicalRows,
    mentalRows,
  };
}
