-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  user_id TEXT NOT NULL,
  is_archived BOOLEAN DEFAULT false NOT NULL,
  parent_document UUID REFERENCES documents(id) ON DELETE SET NULL,
  content TEXT,
  cover_image TEXT,
  icon TEXT,
  is_published BOOLEAN DEFAULT false NOT NULL,
  "order" INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  is_favorite BOOLEAN DEFAULT false NOT NULL,
  editor_font TEXT,
  full_width BOOLEAN DEFAULT true NOT NULL,
  small_text BOOLEAN DEFAULT false NOT NULL,
  show_toc BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for documents
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_parent ON documents(user_id, parent_document);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  editor_font TEXT,
  focus_mode BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for user_settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Profile trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  
  -- Create default user settings
  INSERT INTO public.user_settings (user_id, editor_font, focus_mode)
  VALUES (new.id::text, 'default', false);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- Policies for documents
-- ----------------------------------------------------

-- Allow authenticated users full control over their own documents
DROP POLICY IF EXISTS "Allow users to manage own documents" ON documents;
CREATE POLICY "Allow users to manage own documents" ON documents
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Allow public read access to published documents
DROP POLICY IF EXISTS "Allow public read access to published documents" ON documents;
CREATE POLICY "Allow public read access to published documents" ON documents
  FOR SELECT
  TO public
  USING (is_published = true AND is_archived = false);

-- ----------------------------------------------------
-- Policies for user_settings
-- ----------------------------------------------------

-- Allow users full control over their own settings
DROP POLICY IF EXISTS "Allow users to manage own settings" ON user_settings;
CREATE POLICY "Allow users to manage own settings" ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- ----------------------------------------------------
-- Policies for profiles
-- ----------------------------------------------------

-- Allow public read access to profiles
DROP POLICY IF EXISTS "Allow public read access to profiles" ON profiles;
CREATE POLICY "Allow public read access to profiles" ON profiles
  FOR SELECT
  TO public
  USING (true);

-- Allow users to update their own profiles
DROP POLICY IF EXISTS "Allow users to update own profiles" ON profiles;
CREATE POLICY "Allow users to update own profiles" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------
-- Supabase Storage Setup (files bucket)
-- ----------------------------------------------------

-- Create a storage bucket for public files if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to uploaded files
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'files');

-- Policy to allow authenticated uploads to the files bucket
DROP POLICY IF EXISTS "Allow Authenticated Uploads" ON storage.objects;
CREATE POLICY "Allow Authenticated Uploads" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'files' AND auth.uid() = owner);

-- Policy to allow authenticated deletions from the files bucket
DROP POLICY IF EXISTS "Allow Authenticated Deletions" ON storage.objects;
CREATE POLICY "Allow Authenticated Deletions" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'files' AND auth.uid() = owner);

-- Policy to allow authenticated updates to the files bucket
DROP POLICY IF EXISTS "Allow Authenticated Updates" ON storage.objects;
CREATE POLICY "Allow Authenticated Updates" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'files' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'files' AND auth.uid() = owner);


-- NEXT_PUBLIC_SUPABASE_URL=https://arjojssrtxsggnxcmiri.supabase.co
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyam9qc3NydHhzZ2dueGNtaXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxOTI3OTksImV4cCI6MjA5OTc2ODc5OX0.aAsHVDrEenlXaLQiwv8BT9oBWiYGcSKsd0cwBL6ZTtI
-- NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
-- NEXT_PUBLIC_GOOGLE_CLIENT_ID=1077696862984-amk8qgv97ou6vdjgvuvia1jir7juv86u.apps.googleusercontent.com

