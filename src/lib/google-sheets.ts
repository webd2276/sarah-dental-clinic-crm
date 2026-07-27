import { google } from 'googleapis';

export function getSheetsClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    process.env.APP_URL || 'http://localhost:3000'
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

export async function checkSheetsHealth() {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!sheets || !spreadsheetId) {
    return {
      status: 'pending',
      message: 'Google Sheets credentials or Spreadsheet ID not configured.',
      details: 'Set GOOGLE_SHEETS_SPREADSHEET_ID in environment variables.',
    };
  }

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:Z1',
    });

    return {
      status: 'connected',
      message: 'Google Sheets API connected and readable.',
      details: `Headers found: ${res.data.values?.[0]?.join(', ') || 'Empty sheet'}`,
    };
  } catch (err: any) {
    return {
      status: 'error',
      message: `Google Sheets connection failed: ${err?.message || 'Unknown error'}`,
      details: 'Verify Spreadsheet ID and permissions.',
    };
  }
}
