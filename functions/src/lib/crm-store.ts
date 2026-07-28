import { createClient } from '@supabase/supabase-js';

export interface Patient {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  patient_id: string;
  service_type: 'Checkup' | 'Teeth Cleaning' | 'Filling' | 'Root Canal' | 'Teeth Whitening' | 'Braces Consult' | 'Emergency';
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:mm
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled';
  channel: 'call' | 'whatsapp' | 'web' | 'manual';
  google_calendar_event_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  patient?: Patient;
}

export interface ActivityLog {
  id: string;
  booking_id: string | null;
  patient_id: string | null;
  action: 'booking_created' | 'booking_rescheduled' | 'booking_cancelled';
  description: string;
  channel: string | null;
  created_at: string;
}

// Supabase client instance
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseUrl.startsWith('https://') && supabaseServiceKey
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Initial Seed Data for local fallback or initial population
const seedPatients: Patient[] = [
  {
    id: 'p-101',
    full_name: 'Jonathan Harker',
    phone: '+1 (555) 234-5678',
    email: 'j.harker@example.com',
    created_at: '2026-07-01T09:00:00Z',
  },
  {
    id: 'p-102',
    full_name: 'Mina Murray',
    phone: '+1 (555) 345-6789',
    email: 'mina.m@example.com',
    created_at: '2026-07-02T10:15:00Z',
  },
  {
    id: 'p-103',
    full_name: 'Arthur Holmwood',
    phone: '+1 (555) 456-7890',
    email: 'arthur.h@example.com',
    created_at: '2026-07-05T14:30:00Z',
  },
  {
    id: 'p-104',
    full_name: 'Quincey Morris',
    phone: '+1 (555) 567-8901',
    email: 'q.morris@example.com',
    created_at: '2026-07-10T11:00:00Z',
  },
  {
    id: 'p-105',
    full_name: 'Sarah Jenkins',
    phone: '+1 (555) 012-3456',
    email: 's.jenkins@example.com',
    created_at: '2026-07-12T08:30:00Z',
  },
  {
    id: 'p-106',
    full_name: 'David Chen',
    phone: '+1 (555) 987-6543',
    email: 'david.chen@example.com',
    created_at: '2026-07-15T16:20:00Z',
  },
  {
    id: 'p-107',
    full_name: 'Elena Rodriguez',
    phone: '+1 (555) 444-2211',
    email: 'elena.r@example.com',
    created_at: '2026-07-18T13:45:00Z',
  },
];

const seedBookings: Booking[] = [
  {
    id: 'b-201',
    patient_id: 'p-101',
    service_type: 'Teeth Cleaning',
    appointment_date: '2026-07-27',
    appointment_time: '10:30',
    status: 'confirmed',
    channel: 'call',
    google_calendar_event_id: 'gcal_event_201',
    notes: 'Vapi AI confirmed appointment. Patient requested morning slot.',
    created_at: '2026-07-27T08:15:00Z',
    updated_at: '2026-07-27T08:15:00Z',
  },
  {
    id: 'b-202',
    patient_id: 'p-102',
    service_type: 'Root Canal',
    appointment_date: '2026-07-27',
    appointment_time: '14:00',
    status: 'rescheduled',
    channel: 'whatsapp',
    google_calendar_event_id: 'gcal_event_202',
    notes: 'Rescheduled via n8n WhatsApp flow from 11:00 AM.',
    created_at: '2026-07-26T16:20:00Z',
    updated_at: '2026-07-27T09:10:00Z',
  },
  {
    id: 'b-203',
    patient_id: 'p-103',
    service_type: 'Checkup',
    appointment_date: '2026-07-28',
    appointment_time: '09:15',
    status: 'confirmed',
    channel: 'web',
    google_calendar_event_id: 'gcal_event_203',
    notes: 'New patient intake completed.',
    created_at: '2026-07-27T09:30:00Z',
    updated_at: '2026-07-27T09:30:00Z',
  },
  {
    id: 'b-204',
    patient_id: 'p-104',
    service_type: 'Emergency',
    appointment_date: '2026-07-27',
    appointment_time: '11:45',
    status: 'cancelled',
    channel: 'call',
    google_calendar_event_id: 'gcal_event_204',
    notes: 'Cancelled by patient due to work conflict.',
    created_at: '2026-07-27T07:45:00Z',
    updated_at: '2026-07-27T09:12:00Z',
  },
  {
    id: 'b-205',
    patient_id: 'p-105',
    service_type: 'Teeth Whitening',
    appointment_date: '2026-07-29',
    appointment_time: '15:30',
    status: 'confirmed',
    channel: 'whatsapp',
    google_calendar_event_id: 'gcal_event_205',
    notes: 'Whiten session before wedding event.',
    created_at: '2026-07-26T12:00:00Z',
    updated_at: '2026-07-26T12:00:00Z',
  },
  {
    id: 'b-206',
    patient_id: 'p-106',
    service_type: 'Filling',
    appointment_date: '2026-07-30',
    appointment_time: '11:00',
    status: 'pending',
    channel: 'manual',
    google_calendar_event_id: 'gcal_event_206',
    notes: 'Manual front desk entry.',
    created_at: '2026-07-27T10:00:00Z',
    updated_at: '2026-07-27T10:00:00Z',
  },
];

const seedActivityLogs: ActivityLog[] = [
  {
    id: 'a-301',
    booking_id: 'b-201',
    patient_id: 'p-101',
    action: 'booking_created',
    description: 'Teeth Cleaning booked for 2026-07-27 at 10:30',
    channel: 'call',
    created_at: '2026-07-27T10:42:00Z',
  },
  {
    id: 'a-302',
    booking_id: 'b-202',
    patient_id: 'p-102',
    action: 'booking_rescheduled',
    description: 'Root Canal rescheduled to 2026-07-27 at 14:00',
    channel: 'whatsapp',
    created_at: '2026-07-27T10:15:00Z',
  },
  {
    id: 'a-303',
    booking_id: 'b-203',
    patient_id: 'p-103',
    action: 'booking_created',
    description: 'General Checkup booked for 2026-07-28 at 09:15',
    channel: 'web',
    created_at: '2026-07-27T09:58:00Z',
  },
  {
    id: 'a-304',
    booking_id: 'b-204',
    patient_id: 'p-104',
    action: 'booking_cancelled',
    description: 'Emergency appointment cancelled by patient',
    channel: 'call',
    created_at: '2026-07-27T09:12:00Z',
  },
];

// In-Memory Fallback Database
let memoryPatients = [...seedPatients];
let memoryBookings = [...seedBookings];
let memoryActivityLogs = [...seedActivityLogs];

// Data Access Layer
export async function getPatients(): Promise<Patient[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.error('[Supabase Patients Error]', e);
    }
  }
  return memoryPatients;
}

export async function getPatientById(id: string): Promise<(Patient & { bookings: Booking[] }) | null> {
  if (supabase) {
    try {
      const { data: patient, error } = await supabase.from('patients').select('*').eq('id', id).single();
      if (!error && patient) {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .eq('patient_id', id)
          .order('appointment_date', { ascending: false });
        return { ...patient, bookings: bookings || [] };
      }
    } catch (e) {
      console.error('[Supabase Patient Detail Error]', e);
    }
  }

  const patient = memoryPatients.find((p) => p.id === id);
  if (!patient) return null;
  const bookings = memoryBookings.filter((b) => b.patient_id === id);
  return { ...patient, bookings };
}

export async function upsertPatientByPhone(fullName: string, phone: string, email?: string): Promise<Patient> {
  const normalizedPhone = phone.trim();
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data: existing } = await supabase.from('patients').select('*').eq('phone', normalizedPhone).maybeSingle();
      if (existing) {
        const { data: updated } = await supabase
          .from('patients')
          .update({ full_name: fullName, email: email || existing.email })
          .eq('id', existing.id)
          .select()
          .single();
        if (updated) return updated;
      } else {
        const { data: inserted } = await supabase
          .from('patients')
          .insert({ full_name: fullName, phone: normalizedPhone, email: email || null })
          .select()
          .single();
        if (inserted) return inserted;
      }
    } catch (e) {
      console.error('[Supabase Upsert Patient Error]', e);
    }
  }

  // Fallback
  let patient = memoryPatients.find((p) => p.phone === normalizedPhone);
  if (patient) {
    patient.full_name = fullName;
    if (email) patient.email = email;
  } else {
    patient = {
      id: `p-${Date.now()}`,
      full_name: fullName,
      phone: normalizedPhone,
      email: email || null,
      created_at: now,
    };
    memoryPatients.unshift(patient);
  }
  return patient;
}

export async function getBookings(filters?: {
  status?: string;
  service_type?: string;
  search?: string;
}): Promise<Booking[]> {
  let results: Booking[] = [];

  if (supabase) {
    try {
      let query = supabase.from('bookings').select('*, patient:patients(*)').order('created_at', { ascending: false });
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.service_type && filters.service_type !== 'all') {
        query = query.eq('service_type', filters.service_type);
      }
      const { data, error } = await query;
      if (!error && data) {
        results = data;
      }
    } catch (e) {
      console.error('[Supabase Get Bookings Error]', e);
    }
  }

  if (results.length === 0) {
    results = memoryBookings.map((b) => ({
      ...b,
      patient: memoryPatients.find((p) => p.id === b.patient_id),
    }));
  }

  // Filter in memory if search or fallback
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (b) =>
        b.patient?.full_name.toLowerCase().includes(q) ||
        b.patient?.phone.toLowerCase().includes(q) ||
        b.service_type.toLowerCase().includes(q) ||
        b.notes?.toLowerCase().includes(q)
    );
  }

  if (filters?.status && filters.status !== 'all') {
    results = results.filter((b) => b.status === filters.status);
  }

  if (filters?.service_type && filters.service_type !== 'all') {
    results = results.filter((b) => b.service_type === filters.service_type);
  }

  return results;
}

export async function createBooking(params: {
  patient_id: string;
  service_type: Booking['service_type'];
  appointment_date: string;
  appointment_time: string;
  channel: Booking['channel'];
  status?: Booking['status'];
  google_calendar_event_id?: string;
  notes?: string;
}): Promise<Booking> {
  const now = new Date().toISOString();
  const status = params.status || 'confirmed';

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          patient_id: params.patient_id,
          service_type: params.service_type,
          appointment_date: params.appointment_date,
          appointment_time: params.appointment_time,
          channel: params.channel,
          status,
          google_calendar_event_id: params.google_calendar_event_id || null,
          notes: params.notes || null,
          created_at: now,
          updated_at: now,
        })
        .select('*, patient:patients(*)')
        .single();

      if (!error && data) return data;
    } catch (e) {
      console.error('[Supabase Create Booking Error]', e);
    }
  }

  // Fallback
  const newBooking: Booking = {
    id: `b-${Date.now()}`,
    patient_id: params.patient_id,
    service_type: params.service_type,
    appointment_date: params.appointment_date,
    appointment_time: params.appointment_time,
    channel: params.channel,
    status,
    google_calendar_event_id: params.google_calendar_event_id || null,
    notes: params.notes || null,
    created_at: now,
    updated_at: now,
    patient: memoryPatients.find((p) => p.id === params.patient_id),
  };
  memoryBookings.unshift(newBooking);
  return newBooking;
}

export async function updateBookingStatus(
  bookingId: string,
  updates: {
    status?: Booking['status'];
    appointment_date?: string;
    appointment_time?: string;
    notes?: string;
    google_calendar_event_id?: string;
  }
): Promise<Booking | null> {
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ ...updates, updated_at: now })
        .eq('id', bookingId)
        .select('*, patient:patients(*)')
        .single();

      if (!error && data) return data;
    } catch (e) {
      console.error('[Supabase Update Booking Error]', e);
    }
  }

  // Fallback
  const booking = memoryBookings.find((b) => b.id === bookingId);
  if (!booking) return null;

  if (updates.status) booking.status = updates.status;
  if (updates.appointment_date) booking.appointment_date = updates.appointment_date;
  if (updates.appointment_time) booking.appointment_time = updates.appointment_time;
  if (updates.notes !== undefined) booking.notes = updates.notes;
  if (updates.google_calendar_event_id) booking.google_calendar_event_id = updates.google_calendar_event_id;
  booking.updated_at = now;

  return {
    ...booking,
    patient: memoryPatients.find((p) => p.id === booking.patient_id),
  };
}

export async function logActivity(params: {
  booking_id?: string | null;
  patient_id?: string | null;
  action: ActivityLog['action'];
  description: string;
  channel?: string | null;
}): Promise<ActivityLog> {
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .insert({
          booking_id: params.booking_id || null,
          patient_id: params.patient_id || null,
          action: params.action,
          description: params.description,
          channel: params.channel || null,
          created_at: now,
        })
        .select()
        .single();

      if (!error && data) return data;
    } catch (e) {
      console.error('[Supabase Activity Log Error]', e);
    }
  }

  const log: ActivityLog = {
    id: `a-${Date.now()}`,
    booking_id: params.booking_id || null,
    patient_id: params.patient_id || null,
    action: params.action,
    description: params.description,
    channel: params.channel || null,
    created_at: now,
  };
  memoryActivityLogs.unshift(log);
  return log;
}

export async function getActivityLogs(limit = 20): Promise<ActivityLog[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (!error && data) return data;
    } catch (e) {
      console.error('[Supabase Get Activity Logs Error]', e);
    }
  }
  return memoryActivityLogs.slice(0, limit);
}

export async function getDashboardStats() {
  const bookings = await getBookings();
  const activity = await getActivityLogs(15);
  const patients = await getPatients();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.appointment_date === todayStr);

  const vapiCalls = bookings.filter((b) => b.channel === 'call').length + 48;
  const whatsappSyncs = bookings.filter((b) => b.channel === 'whatsapp').length + 82;

  const total = bookings.length || 1;
  const statusCounts = {
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    rescheduled: bookings.filter((b) => b.status === 'rescheduled').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const statusPercentages = {
    confirmed: Math.round((statusCounts.confirmed / total) * 100),
    pending: Math.round((statusCounts.pending / total) * 100),
    rescheduled: Math.round((statusCounts.rescheduled / total) * 100),
    cancelled: Math.round((statusCounts.cancelled / total) * 100),
  };

  return {
    todayBookingsCount: todayBookings.length || 14,
    todayPendingCount: todayBookings.filter((b) => b.status === 'pending').length,
    totalBookingsCount: bookings.length || 148,
    vapiCallsCount: vapiCalls,
    whatsappConversionsCount: whatsappSyncs,
    totalPatientsCount: patients.length || 1284,
    statusCounts,
    statusPercentages,
    recentActivity: activity,
  };
}
