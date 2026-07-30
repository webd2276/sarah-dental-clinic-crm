CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT REFERENCES bookings(id) ON DELETE CASCADE,
  google_calendar_id TEXT NOT NULL DEFAULT '4738b4b306ba3e16c1b5b52253a61426394a3ef0b03d68f1881bcdb885c07d4d@group.calendar.google.com',
  google_event_id TEXT,
  summary TEXT,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'rescheduled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by booking
CREATE INDEX idx_calendar_events_booking_id ON calendar_events(booking_id);

-- Index for fast lookup by google event id (useful for update/delete matching)
CREATE INDEX idx_calendar_events_google_event_id ON calendar_events(google_event_id);

-- Enable Row Level Security (matching your other tables)
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (same pattern as your other tables likely use)
CREATE POLICY "Service role full access on calendar_events"
  ON calendar_events
  FOR ALL
  USING (true)
  WITH CHECK (true);
