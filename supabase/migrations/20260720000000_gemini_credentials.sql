-- Migration: Add gemini_api_key configuration functions to Supabase database.
-- This allows storing and reading credentials securely inside the database structure.

CREATE TABLE IF NOT EXISTS public.api_credentials (
    key_name TEXT PRIMARY KEY,
    key_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;

-- Allow reading the key value for authenticated sessions
CREATE POLICY "Allow read for authenticated" ON public.api_credentials
    FOR SELECT TO authenticated USING (true);

-- Insert the Gemini API key
INSERT INTO public.api_credentials (key_name, key_value)
VALUES ('gemini_api_key', 'AIzaSyApGrp9p8PKeZiWvjgk9xuFPxVRwiFJ9e0')
ON CONFLICT (key_name) DO UPDATE SET key_value = EXCLUDED.key_value, updated_at = now();
