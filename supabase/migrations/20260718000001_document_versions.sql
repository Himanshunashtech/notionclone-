-- Create document_versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  label TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for document_versions
CREATE INDEX IF NOT EXISTS idx_document_versions_doc ON document_versions(document_id);

-- Enable RLS
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users full control over versions of their documents
DROP POLICY IF EXISTS "Allow users to manage own document versions" ON document_versions;
CREATE POLICY "Allow users to manage own document versions" ON document_versions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_versions.document_id 
      AND documents.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_versions.document_id 
      AND documents.user_id = auth.uid()::text
    )
  );
