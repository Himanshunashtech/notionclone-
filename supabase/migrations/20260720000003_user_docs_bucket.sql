-- Create a storage bucket for user uploaded form documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-docs', 'user-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to uploaded files in user-docs bucket
DROP POLICY IF EXISTS "Public Read user-docs" ON storage.objects;
CREATE POLICY "Public Read user-docs" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'user-docs');

-- Policy to allow anyone (anonymous/public) to upload to the user-docs bucket
DROP POLICY IF EXISTS "Public Insert user-docs" ON storage.objects;
CREATE POLICY "Public Insert user-docs" ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'user-docs');
