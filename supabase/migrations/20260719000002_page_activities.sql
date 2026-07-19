-- Create page_activities table
CREATE TABLE IF NOT EXISTS page_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  context TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for quick lookups
CREATE INDEX IF NOT EXISTS idx_page_activities_document ON page_activities(document_id);
CREATE INDEX IF NOT EXISTS idx_page_activities_document_time ON page_activities(document_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE page_activities ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to manage page activities
DROP POLICY IF EXISTS "Allow users to manage own page activities" ON page_activities;
CREATE POLICY "Allow users to manage own page activities" ON page_activities
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
