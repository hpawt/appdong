-- Additive migration: preserves the existing users, applications and announcements.
CREATE TABLE IF NOT EXISTS calendar_event (
  id varchar(36) PRIMARY KEY,
  title varchar(100) NOT NULL,
  description text NOT NULL DEFAULT '',
  location varchar(150) NOT NULL DEFAULT '',
  start_date date NOT NULL,
  end_date date NOT NULL,
  time varchar(5) NOT NULL DEFAULT '',
  category varchar(20) NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT calendar_event_date_order CHECK (end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS calendar_event_dates_idx ON calendar_event (start_date, end_date);
CREATE TABLE IF NOT EXISTS custom_form (
  id varchar(36) PRIMARY KEY,
  title varchar(150) NOT NULL,
  description text NOT NULL DEFAULT '',
  questions jsonb NOT NULL,
  published boolean NOT NULL DEFAULT false,
  accepting boolean NOT NULL DEFAULT true,
  version varchar(36) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS form_response (
  id varchar(36) PRIMARY KEY,
  form_id varchar(36) NOT NULL REFERENCES custom_form(id) ON DELETE CASCADE,
  questions jsonb NOT NULL,
  answers jsonb NOT NULL,
  version varchar(36) NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS form_response_form_date_idx ON form_response (form_id, submitted_at);
