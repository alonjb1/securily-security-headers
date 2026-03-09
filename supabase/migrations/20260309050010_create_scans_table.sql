/*
  # Create Security Scans Schema

  1. New Tables
    - `scans`
      - `id` (uuid, primary key)
      - `url` (text, the scanned URL)
      - `scan_type` (text, web/app/api)
      - `status` (text, pending/running/completed/failed)
      - `results` (jsonb, scan results)
      - `ai_insights` (jsonb, optional AI insights)
      - `metadata` (jsonb, scan metadata)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `scans` table
    - Add policy for public read access (view scan results)
    - Add policy for public insert (anyone can create scans)
    
  3. Indexes
    - Index on url for quick lookups
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  scan_type text DEFAULT 'web',
  status text DEFAULT 'pending',
  results jsonb,
  ai_insights jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scans"
  ON scans
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create scans"
  ON scans
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update scans"
  ON scans
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_scans_url ON scans(url);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);