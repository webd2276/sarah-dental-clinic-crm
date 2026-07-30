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
  is_active BOOLEAN DEFAULT true,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_sessions ENABLE ROW LEVEL SECURITY;
