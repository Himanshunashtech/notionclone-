-- Create security definer function to check if parent is published without causing infinite recursion
CREATE OR REPLACE FUNCTION public.is_published_and_not_archived(doc_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.documents
    WHERE id = doc_id
      AND is_published = true
      AND is_archived = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow public read access to published documents and their children
DROP POLICY IF EXISTS "Allow public read access to published documents" ON documents;
DROP POLICY IF EXISTS "Allow public read access to published documents and children" ON documents;
CREATE POLICY "Allow public read access to published documents and children" ON documents
  FOR SELECT
  TO public
  USING (
    (is_published = true AND is_archived = false) OR
    (
      parent_document IS NOT NULL AND
      public.is_published_and_not_archived(parent_document)
    )
  );

-- Allow public insert if parent is published (useful for form submissions)
DROP POLICY IF EXISTS "Allow public insert if parent is published" ON documents;
CREATE POLICY "Allow public insert if parent is published" ON documents
  FOR INSERT
  TO public
  WITH CHECK (
    parent_document IS NOT NULL AND
    public.is_published_and_not_archived(parent_document)
  );

