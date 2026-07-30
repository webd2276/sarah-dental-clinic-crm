/**
 * Run this script ONCE manually after the `create_admin_auth_tables` migration is pushed.
 * DO NOT commit this to run automatically on every deploy, as it resets or attempts to recreate the admin user.
 * 
 * Usage:
 * npx tsx functions/scripts/seed-admin.ts
 * or
 * npx ts-node functions/scripts/seed-admin.ts
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env file if running locally
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Also try loading from the current directory just in case
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdmin() {
  try {
    const password = '12345';
    const saltRounds = 10;
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    console.log('Inserting admin user...');
    const { data, error } = await supabase
      .from('admin_users')
      .upsert(
        { username: 'admin', password_hash: passwordHash },
        { onConflict: 'username' }
      )
      .select()
      .single();

    if (error) {
      console.error('Failed to seed admin user:', error.message);
      process.exit(1);
    }

    console.log('Successfully seeded admin user:', data.username);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error during seeding:', err);
    process.exit(1);
  }
}

seedAdmin();
