"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSheetsClient = getSheetsClient;
exports.checkSheetsHealth = checkSheetsHealth;
const googleapis_1 = require("googleapis");
function getSheetsClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    if (!clientId || !clientSecret || !refreshToken) {
        return null;
    }
    const oauth2Client = new googleapis_1.google.auth.OAuth2(clientId, clientSecret, process.env.APP_URL || 'http://localhost:3000');
    oauth2Client.setCredentials({
        refresh_token: refreshToken,
    });
    return googleapis_1.google.sheets({ version: 'v4', auth: oauth2Client });
}
async function checkSheetsHealth() {
    var _a, _b;
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
            details: `Headers found: ${((_b = (_a = res.data.values) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.join(', ')) || 'Empty sheet'}`,
        };
    }
    catch (err) {
        return {
            status: 'error',
            message: `Google Sheets connection failed: ${(err === null || err === void 0 ? void 0 : err.message) || 'Unknown error'}`,
            details: 'Verify Spreadsheet ID and permissions.',
        };
    }
}
//# sourceMappingURL=google-sheets.js.map