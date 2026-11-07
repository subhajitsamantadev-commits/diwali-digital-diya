/*
# Create greetings and wishes tables (single-tenant, no auth)

1. New Tables
- `greetings`
  - `id` (serial int, primary key) — numeric short ID used in share links
  - `short_id` (text, unique, not null) — 8-char URL-safe share code
  - `sender_name` (text, not null)
  - `receiver_name` (text, not null)
  - `language` (text, not null) — one of: en, hi, bn
  - `tone` (text, not null) — one of: heartfelt, funny, formal
  - `theme` (text, not null) — theme key (saffron, maroon, indigo, gold)
  - `message` (text, not null) — the greeting message body
  - `created_at` (timestamptz, default now())
- `wishes`
  - `id` (uuid, primary key)
  - `text` (text, not null, max 40 chars)
  - `color` (text, not null) — lantern color key
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on both tables.
- Grant CRUD to anon + authenticated (single-tenant, intentionally public).
- All policies use USING (true) / WITH CHECK (true) because the data is
  intentionally public/shared with no sign-in screen.
3. Notes
- A `short_id` index speeds up share-link lookups.
- A `created_at` desc index on wishes lets the lantern wall load recent wishes fast.
*/

CREATE TABLE IF NOT EXISTS greetings (
  id serial PRIMARY KEY,
  short_id text UNIQUE NOT NULL,
  sender_name text NOT NULL,
  receiver_name text NOT NULL,
  language text NOT NULL,
  tone text NOT NULL,
  theme text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS greetings_short_id_idx ON greetings (short_id);

ALTER TABLE greetings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON greetings TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_greetings" ON greetings;
CREATE POLICY "anon_select_greetings" ON greetings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_greetings" ON greetings;
CREATE POLICY "anon_insert_greetings" ON greetings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_greetings" ON greetings;
CREATE POLICY "anon_update_greetings" ON greetings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_greetings" ON greetings;
CREATE POLICY "anon_delete_greetings" ON greetings FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS wishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL CHECK (char_length(text) <= 40),
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wishes_created_at_idx ON wishes (created_at DESC);

ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON wishes TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_wishes" ON wishes;
CREATE POLICY "anon_select_wishes" ON wishes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_wishes" ON wishes;
CREATE POLICY "anon_insert_wishes" ON wishes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
