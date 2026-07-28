"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarClient = getCalendarClient;
exports.createCalendarEvent = createCalendarEvent;
exports.updateCalendarEvent = updateCalendarEvent;
exports.deleteCalendarEvent = deleteCalendarEvent;
exports.checkCalendarHealth = checkCalendarHealth;
const googleapis_1 = require("googleapis");
// Helper to get authorized Google Calendar client
function getCalendarClient() {
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
    return googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
}
async function createCalendarEvent(params) {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    if (!calendar) {
        console.warn('[Google Calendar] Missing credentials. Simulating event creation.');
        return { id: `gcal_sim_${Date.now()}`, simulated: true };
    }
    const duration = params.durationMinutes || 45;
    const startDateTime = new Date(`${params.startDate}T${params.startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);
    try {
        const response = await calendar.events.insert({
            calendarId,
            requestBody: {
                summary: params.summary,
                description: params.description || 'Booked via Sarah Dental Clinic CRM',
                start: {
                    dateTime: startDateTime.toISOString(),
                    timeZone: 'America/New_York',
                },
                end: {
                    dateTime: endDateTime.toISOString(),
                    timeZone: 'America/New_York',
                },
            },
        });
        return { id: response.data.id || `gcal_${Date.now()}`, simulated: false };
    }
    catch (err) {
        console.error('[Google Calendar Error]', (err === null || err === void 0 ? void 0 : err.message) || err);
        // Fallback so Supabase write is never blocked
        return { id: `gcal_err_${Date.now()}`, simulated: true, error: err === null || err === void 0 ? void 0 : err.message };
    }
}
async function updateCalendarEvent(eventId, params) {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    if (!calendar || eventId.startsWith('gcal_sim_') || eventId.startsWith('gcal_err_')) {
        return { success: true, simulated: true };
    }
    try {
        if (params.startDate && params.startTime) {
            const startDateTime = new Date(`${params.startDate}T${params.startTime}:00`);
            const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000);
            await calendar.events.patch({
                calendarId,
                eventId,
                requestBody: {
                    summary: params.summary,
                    description: params.description,
                    start: { dateTime: startDateTime.toISOString() },
                    end: { dateTime: endDateTime.toISOString() },
                },
            });
        }
        return { success: true, simulated: false };
    }
    catch (err) {
        console.error('[Google Calendar Update Error]', (err === null || err === void 0 ? void 0 : err.message) || err);
        return { success: false, error: err === null || err === void 0 ? void 0 : err.message };
    }
}
async function deleteCalendarEvent(eventId) {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    if (!calendar || eventId.startsWith('gcal_sim_') || eventId.startsWith('gcal_err_')) {
        return { success: true, simulated: true };
    }
    try {
        await calendar.events.delete({
            calendarId,
            eventId,
        });
        return { success: true, simulated: false };
    }
    catch (err) {
        console.error('[Google Calendar Delete Error]', (err === null || err === void 0 ? void 0 : err.message) || err);
        return { success: false, error: err === null || err === void 0 ? void 0 : err.message };
    }
}
async function checkCalendarHealth() {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    if (!calendar) {
        return {
            status: 'pending',
            message: 'Google Calendar credentials not configured in environment variables.',
            details: 'Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN in .env',
        };
    }
    try {
        await calendar.events.list({
            calendarId,
            maxResults: 1,
        });
        return {
            status: 'connected',
            message: 'Google Calendar API connected successfully.',
            details: `Active calendar ID: ${calendarId}`,
        };
    }
    catch (err) {
        return {
            status: 'error',
            message: `Calendar connection failed: ${(err === null || err === void 0 ? void 0 : err.message) || 'Unknown error'}`,
            details: 'Verify OAuth refresh token and client secrets.',
        };
    }
}
//# sourceMappingURL=google-calendar.js.map