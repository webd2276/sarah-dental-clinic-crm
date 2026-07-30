CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  login_at TIMESTAMPTZ DEFAULT now(),
  logout_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_login_sessions_admin_user_id ON login_sessions(admin_user_id);
CREATE INDEX idx_login_sessions_active ON login_sessions(is_active);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on admin_users"
  ON admin_users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on login_sessions"
  ON login_sessions FOR ALL USING (true) WITH CHECK (true);