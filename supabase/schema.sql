-- ============================================
-- BMSA Email Dashboard — Supabase Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Members Table
-- ============================================
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  committee TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_committee ON members(committee);
CREATE INDEX idx_members_status ON members(status);

-- ============================================
-- Email Templates Table
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT DEFAULT '',
  html_body TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Sent History Table
-- ============================================
CREATE TABLE IF NOT EXISTS sent_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  audience_groups TEXT[] DEFAULT '{}',
  recipient_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'error')),
  brevo_message_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_history_sent_at ON sent_history(sent_at DESC);

-- ============================================
-- Scheduled Emails Table
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  html_body TEXT DEFAULT '',
  audience_groups TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_status ON scheduled_emails(status);
CREATE INDEX idx_scheduled_at ON scheduled_emails(scheduled_at);

-- ============================================
-- Settings Table (single row)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  sender_name TEXT DEFAULT 'BMSA',
  sender_email TEXT DEFAULT 'bmsa@example.com',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO settings (id, sender_name, sender_email)
VALUES (1, 'BMSA', 'bmsa@example.com')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Row Level Security (optional, recommended)
-- ============================================
-- Since we use the service_role key server-side,
-- RLS is bypassed. But for extra safety:

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow full access via service_role (which bypasses RLS by default)
-- No additional policies needed for server-side access.
