import { google } from 'googleapis';

// Helper to get authorized Google Calendar client
export function getCalendarClient() {
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

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function createCalendarEvent(params: {
  summary: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes?: number;
}) {
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
  } catch (err: any) {
    console.error('[Google Calendar Error]', err?.message || err);
    // Fallback so Supabase write is never blocked
    return { id: `gcal_err_${Date.now()}`, simulated: true, error: err?.message };
  }
}

export async function updateCalendarEvent(
  eventId: string,
  params: {
    summary?: string;
    description?: string;
    startDate?: string;
    startTime?: string;
    status?: string;
  }
) {
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
  } catch (err: any) {
    console.error('[Google Calendar Update Error]', err?.message || err);
    return { success: false, error: err?.message };
  }
}

export async function deleteCalendarEvent(eventId: string) {
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
  } catch (err: any) {
    console.error('[Google Calendar Delete Error]', err?.message || err);
    return { success: false, error: err?.message };
  }
}

export async function checkCalendarHealth() {
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
  } catch (err: any) {
    return {
      status: 'error',
      message: `Calendar connection failed: ${err?.message || 'Unknown error'}`,
      details: 'Verify OAuth refresh token and client secrets.',
    };
  }
}
