-- Create delete_user_account function with SECURITY DEFINER privileges to allow users to delete themselves from auth.users
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Clean up all user data across all tables (only if the tables exist)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'document_versions') THEN
    EXECUTE 'DELETE FROM public.document_versions WHERE created_by = $1' USING current_user_id::text;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_activities') THEN
    EXECUTE 'DELETE FROM public.page_activities WHERE user_id = $1' USING current_user_id::text;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'calendar_events') THEN
    EXECUTE 'DELETE FROM public.calendar_events WHERE user_id = $1' USING current_user_id::text;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_settings') THEN
    EXECUTE 'DELETE FROM public.user_settings WHERE user_id = $1' USING current_user_id::text;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    EXECUTE 'DELETE FROM public.documents WHERE user_id = $1' USING current_user_id::text;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    EXECUTE 'DELETE FROM public.profiles WHERE id = $1' USING current_user_id;
  END IF;

  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
