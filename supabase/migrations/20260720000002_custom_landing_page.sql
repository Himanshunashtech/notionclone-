-- Add custom_landing_page_id column to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS custom_landing_page_id TEXT;
