"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const crm_store_1 = require("../lib/crm-store");
const google_calendar_1 = require("../lib/google-calendar");
const google_sheets_1 = require("../lib/google-sheets");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.apiRouter = (0, express_1.Router)();
// Middleware to parse JSON
exports.apiRouter.use((req, res, next) => {
    next();
});
/**
 * POST /api/auth/login
 */
exports.apiRouter.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }
        if (!crm_store_1.supabase) {
            return res.status(500).json({ success: false, message: 'Supabase client not configured' });
        }
        const { data: user, error } = await crm_store_1.supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .single();
        if (error || !user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
        const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '');
        const userAgent = (req.headers['user-agent'] || '');
        const { data: session, error: sessionError } = await crm_store_1.supabase
            .from('login_sessions')
            .insert({
            admin_user_id: user.id,
            username: user.username,
            ip_address: ipAddress,
            user_agent: userAgent
        })
            .select()
            .single();
        if (sessionError || !session) {
            return res.status(500).json({ success: false, message: 'Failed to create session' });
        }
        return res.json({ success: true, sessionId: session.id, username: user.username });
    }
    catch (err) {
        console.error('[Login Error]', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
/**
 * POST /api/auth/logout
 */
exports.apiRouter.post('/auth/logout', async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ success: false, message: 'Session ID required' });
        }
        if (!crm_store_1.supabase) {
            return res.status(500).json({ success: false, message: 'Supabase client not configured' });
        }
        const { error } = await crm_store_1.supabase
            .from('login_sessions')
            .update({ logout_at: new Date().toISOString(), is_active: false })
            .eq('id', sessionId);
        if (error) {
            return res.status(500).json({ success: false, message: 'Failed to update session' });
        }
        return res.json({ success: true });
    }
    catch (err) {
        console.error('[Logout Error]', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
/**
 * POST /api/webhooks/n8n-sync
 * Incoming Webhook called by n8n workflow on booking/reschedule/cancel
 */
exports.apiRouter.post('/webhooks/n8n-sync', async (req, res) => {
    try {
        const providedSecret = req.header('X-Webhook-Secret') || req.header('x-webhook-secret');
        const expectedSecret = process.env.N8N_WEBHOOK_SHARED_SECRET || 'sara_dental_crm_secret_2026';
        if (expectedSecret && providedSecret !== expectedSecret) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or missing X-Webhook-Secret header.',
            });
        }
        const { action, // 'created' | 'rescheduled' | 'cancelled'
        patient_name, phone_number, email, service_type, date, time, google_calendar_event_id, channel, notes, booking_id, } = req.body;
        if (!patient_name || !phone_number) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'patient_name and phone_number are required fields.',
            });
        }
        const validService = service_type || 'Checkup';
        const channelType = channel || 'call';
        // 1. Upsert Patient
        const patient = await (0, crm_store_1.upsertPatientByPhone)(patient_name, phone_number, email);
        let booking;
        let logDesc = '';
        let logAction = 'booking_created';
        if (action === 'rescheduled') {
            logAction = 'booking_rescheduled';
            if (booking_id) {
                booking = await (0, crm_store_1.updateBookingStatus)(booking_id, {
                    status: 'rescheduled',
                    appointment_date: date,
                    appointment_time: time,
                    notes: notes || 'Rescheduled via n8n webhook',
                });
            }
            else {
                // Find latest booking for this patient
                const existingBookings = await (0, crm_store_1.getBookings)({ search: phone_number });
                if (existingBookings.length > 0) {
                    booking = await (0, crm_store_1.updateBookingStatus)(existingBookings[0].id, {
                        status: 'rescheduled',
                        appointment_date: date,
                        appointment_time: time,
                        notes: notes || 'Rescheduled via n8n webhook',
                    });
                }
            }
            if (!booking) {
                booking = await (0, crm_store_1.createBooking)({
                    patient_id: patient.id,
                    service_type: validService,
                    appointment_date: date || new Date().toISOString().split('T')[0],
                    appointment_time: time || '10:00',
                    channel: channelType,
                    status: 'rescheduled',
                    google_calendar_event_id,
                    notes,
                });
            }
            logDesc = `${validService} rescheduled for ${date || booking.appointment_date} at ${time || booking.appointment_time}`;
            if (booking && booking.google_calendar_event_id) {
                try {
                    await (0, google_calendar_1.updateCalendarEvent)(booking.google_calendar_event_id, {
                        summary: `${validService} - ${patient_name}`,
                        startDate: date || booking.appointment_date,
                        startTime: time || booking.appointment_time,
                    });
                }
                catch (err) {
                    console.error('[Google Calendar] Failed to update event on webhook sync:', err);
                }
            }
        }
        else if (action === 'cancelled') {
            logAction = 'booking_cancelled';
            if (booking_id) {
                booking = await (0, crm_store_1.updateBookingStatus)(booking_id, { status: 'cancelled', notes });
            }
            else {
                const existingBookings = await (0, crm_store_1.getBookings)({ search: phone_number });
                if (existingBookings.length > 0) {
                    booking = await (0, crm_store_1.updateBookingStatus)(existingBookings[0].id, { status: 'cancelled', notes });
                }
            }
            if (!booking) {
                booking = await (0, crm_store_1.createBooking)({
                    patient_id: patient.id,
                    service_type: validService,
                    appointment_date: date || new Date().toISOString().split('T')[0],
                    appointment_time: time || '10:00',
                    channel: channelType,
                    status: 'cancelled',
                    notes,
                });
            }
            logDesc = `${validService} booking cancelled by patient`;
            if (booking && booking.google_calendar_event_id) {
                try {
                    await (0, google_calendar_1.deleteCalendarEvent)(booking.google_calendar_event_id);
                }
                catch (err) {
                    console.error('[Google Calendar] Failed to delete event on webhook sync:', err);
                }
            }
        }
        else {
            // action = 'created' or default
            logAction = 'booking_created';
            let finalEventId = google_calendar_event_id;
            try {
                const calResult = await (0, google_calendar_1.createCalendarEvent)({
                    summary: `${validService} - ${patient_name}`,
                    description: `Phone: ${phone_number}${email ? ` | Email: ${email}` : ''}`,
                    startDate: date || new Date().toISOString().split('T')[0],
                    startTime: time || '10:00',
                    durationMinutes: 45,
                });
                finalEventId = calResult.id;
            }
            catch (err) {
                console.error('[Google Calendar] Failed to create event on webhook sync:', err);
            }
            booking = await (0, crm_store_1.createBooking)({
                patient_id: patient.id,
                service_type: validService,
                appointment_date: date || new Date().toISOString().split('T')[0],
                appointment_time: time || '10:00',
                channel: channelType,
                status: 'confirmed',
                google_calendar_event_id: finalEventId,
                notes,
            });
            logDesc = `${validService} booked for ${booking.appointment_date} at ${booking.appointment_time}`;
        }
        // 2. Log Activity
        const activity = await (0, crm_store_1.logActivity)({
            booking_id: booking.id,
            patient_id: patient.id,
            action: logAction,
            description: logDesc,
            channel: channelType,
        });
        return res.status(200).json({
            success: true,
            message: 'n8n Sync processed successfully',
            data: {
                patient,
                booking,
                activity,
            },
        });
    }
    catch (err) {
        console.error('[n8n Webhook Error]', err);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to process webhook',
        });
    }
});
/**
 * GET /api/dashboard/stats
 */
exports.apiRouter.get('/dashboard/stats', async (_req, res) => {
    try {
        const stats = await (0, crm_store_1.getDashboardStats)();
        return res.json(stats);
    }
    catch (err) {
        return res.status(500).json({ error: err === null || err === void 0 ? void 0 : err.message });
    }
});
/**
 * GET /api/bookings
 */
exports.apiRouter.get('/bookings', async (req, res) => {
    try {
        const { status, service_type, search } = req.query;
        const bookings = await (0, crm_store_1.getBookings)({
            status: status,
            service_type: service_type,
            search: search,
        });
        return res.json({ bookings, total: bookings.length });
    }
    catch (err) {
        return res.status(500).json({ error: err === null || err === void 0 ? void 0 : err.message });
    }
});
/**
 * POST /api/bookings
 * Create new booking manually from CRM UI
 */
exports.apiRouter.post('/bookings', async (req, res) => {
    try {
        const { patient_name, phone_number, email, service_type, date, time, channel, notes } = req.body;
        if (!patient_name || !phone_number || !service_type || !date || !time) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'patient_name, phone_number, service_type, date, and time are required.',
            });
        }
        // 1. Upsert Patient
        const patient = await (0, crm_store_1.upsertPatientByPhone)(patient_name, phone_number, email);
        // 2. Sync to Google Calendar API
        const calResult = await (0, google_calendar_1.createCalendarEvent)({
            summary: `${service_type} - ${patient.full_name}`,
            description: `Phone: ${patient.phone}\nNotes: ${notes || 'Booked via Sarah Dental CRM'}`,
            startDate: date,
            startTime: time,
            durationMinutes: 45,
        });
        // 3. Create Booking in Store / Supabase
        const booking = await (0, crm_store_1.createBooking)({
            patient_id: patient.id,
            service_type,
            appointment_date: date,
            appointment_time: time,
            channel: channel || 'manual',
            status: 'confirmed',
            google_calendar_event_id: calResult.id,
            notes: notes || null,
        });
        // 4. Log Activity
        const logDesc = `${service_type} booked manually for ${date} at ${time}`;
        await (0, crm_store_1.logActivity)({
            booking_id: booking.id,
            patient_id: patient.id,
            action: 'booking_created',
            description: logDesc,
            channel: channel || 'manual',
        });
        return res.status(201).json({
            success: true,
            booking: Object.assign(Object.assign({}, booking), { patient }),
            google_calendar_sync: calResult,
        });
    }
    catch (err) {
        return res.status(500).json({ error: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to create booking' });
    }
});
/**
 * PATCH /api/bookings/:id
 * Update status, reschedule or cancel booking
 */
exports.apiRouter.patch('/bookings/:id', async (req, res) => {
    var _a;
    try {
        const id = req.params.id;
        const { status, appointment_date, appointment_time, notes } = req.body;
        const existingBookings = await (0, crm_store_1.getBookings)();
        const existing = existingBookings.find((b) => b.id === id);
        if (!existing) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        // Update in Store / Supabase
        const updated = await (0, crm_store_1.updateBookingStatus)(id, {
            status,
            appointment_date,
            appointment_time,
            notes,
        });
        if (!updated) {
            return res.status(500).json({ error: 'Failed to update booking' });
        }
        // Sync to Google Calendar
        if (existing.google_calendar_event_id) {
            if (status === 'cancelled') {
                await (0, google_calendar_1.deleteCalendarEvent)(existing.google_calendar_event_id);
            }
            else if (status === 'rescheduled') {
                await (0, google_calendar_1.updateCalendarEvent)(existing.google_calendar_event_id, {
                    summary: `${existing.service_type} - ${((_a = updated.patient) === null || _a === void 0 ? void 0 : _a.full_name) || 'Patient'}`,
                    startDate: appointment_date || existing.appointment_date,
                    startTime: appointment_time || existing.appointment_time,
                });
            }
        }
        // Log activity
        let actionType = 'booking_rescheduled';
        let desc = `${existing.service_type} updated`;
        if (status === 'rescheduled') {
            actionType = 'booking_rescheduled';
            desc = `${existing.service_type} rescheduled to ${appointment_date || existing.appointment_date} at ${appointment_time || existing.appointment_time}`;
        }
        else if (status === 'cancelled') {
            actionType = 'booking_cancelled';
            desc = `${existing.service_type} booking cancelled`;
        }
        await (0, crm_store_1.logActivity)({
            booking_id: id,
            patient_id: existing.patient_id,
            action: actionType,
            description: desc,
            channel: 'manual',
        });
        return res.json({ success: true, booking: updated });
    }
    catch (err) {
        return res.status(500).json({ error: err === null || err === void 0 ? void 0 : err.message });
    }
});
/**
 * GET /api/patients
 */
exports.apiRouter.get('/patients', async (_req, res) => {
    try {
        const patients = await (0, crm_store_1.getPatients)();
        return res.json({ patients, total: patients.length });
    }
    catch (err) {
        return res.status(500).json({ error: err === null || err === void 0 ? void 0 : err.message });
    }
});
/**
 * GET /api/patients/:id
 */
exports.apiRouter.get('/patients/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const patientDetail = await (0, crm_store_1.getPatientById)(id);
        if (!patientDetail) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        return res.json(patientDetail);
    }
    catch (err) {
        return res.status(500).json({ error: err === null || err === void 0 ? void 0 : err.message });
    }
});
/**
 * GET /api/activity
 */
exports.apiRouter.get('/activity', async (_req, res) => {
    try {
        const logs = await (0, crm_store_1.getActivityLogs)(30);
        return res.json({ activity: logs });
    }
    catch (err) {
        return res.status(500).json({ error: err === null || err === void 0 ? void 0 : err.message });
    }
});
/**
 * GET /api/integrations/status
 * Health check for Google Calendar, Google Sheets, and n8n webhooks
 */
exports.apiRouter.get('/integrations/status', async (_req, res) => {
    try {
        const calStatus = await (0, google_calendar_1.checkCalendarHealth)();
        const sheetsStatus = await (0, google_sheets_1.checkSheetsHealth)();
        const n8nAvailabilityUrl = process.env.N8N_CHECK_AVAILABILITY_URL || 'https://n8n.yourclinic.com/webhook/check-availability';
        const n8nBookUrl = process.env.N8N_BOOK_APPOINTMENT_URL || 'https://n8n.yourclinic.com/webhook/book-appointment';
        const n8nModifyUrl = process.env.N8N_MODIFY_APPOINTMENT_URL || 'https://n8n.yourclinic.com/webhook/modify-appointment';
        return res.json({
            google_calendar: calStatus,
            google_sheets: sheetsStatus,
            n8n_webhooks: {
                check_availability: {
                    url: n8nAvailabilityUrl,
                    status: 'configured',
                    message: 'Endpoint active for checking calendar slots',
                },
                book_appointment: {
                    url: n8nBookUrl,
                    status: 'configured',
                    message: 'Endpoint active for receiving voice/WhatsApp bookings',
                },
                modify_appointment: {
                    url: n8nModifyUrl,
                    status: 'configured',
                    message: 'Endpoint active for reschedules and cancellations',
                },
            },
            app_sync_endpoint: {
                url: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/n8n-sync`,
                secret_configured: Boolean(process.env.N8N_WEBHOOK_SHARED_SECRET),
                header_required: 'X-Webhook-Secret',
            },
        });
    }
    catch (err) {
        return res.status(500).json({ error: err === null || err === void 0 ? void 0 : err.message });
    }
});
/**
 * POST /api/integrations/test-webhook
 * Interactive test tool for trigger simulated n8n booking from CRM UI
 */
exports.apiRouter.post('/integrations/test-webhook', async (req, res) => {
    try {
        const { action = 'created', patient_name = 'Test Patient', service_type = 'Teeth Cleaning', channel = 'call' } = req.body;
        const patient = await (0, crm_store_1.upsertPatientByPhone)(patient_name, '+1 (555) 999-0000', 'test@clinic.com');
        const today = new Date().toISOString().split('T')[0];
        const booking = await (0, crm_store_1.createBooking)({
            patient_id: patient.id,
            service_type,
            appointment_date: today,
            appointment_time: '11:30',
            channel,
            status: action === 'cancelled' ? 'cancelled' : action === 'rescheduled' ? 'rescheduled' : 'confirmed',
            notes: `Triggered via Setup Guide Test Suite (${action})`,
        });
        const activity = await (0, crm_store_1.logActivity)({
            booking_id: booking.id,
            patient_id: patient.id,
            action: action === 'cancelled' ? 'booking_cancelled' : action === 'rescheduled' ? 'booking_rescheduled' : 'booking_created',
            description: `[TEST] ${service_type} ${action} for ${patient_name}`,
            channel,
        });
        return res.json({
            success: true,
            message: 'Test webhook event processed successfully!',
            data: { patient, booking, activity },
        });
    }
    catch (err) {
        return res.status(500).json({ error: err === null || err === void 0 ? void 0 : err.message });
    }
});
//# sourceMappingURL=routes.js.map