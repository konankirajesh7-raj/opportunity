-- ═══════════════════════════════════════════════════════
-- OpportUnity: Auto-create user profile on signup
-- Run this in Supabase SQL Editor AFTER the main schema
-- https://supabase.com/dashboard/project/vmuwwjzmzaojsotjuapz/sql/new
-- ═══════════════════════════════════════════════════════

-- This trigger automatically creates a row in public.users
-- when a new user signs up via Supabase Auth.
-- This avoids RLS issues during client-side registration.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also allow authenticated users to read any public user info (for community cards)
CREATE POLICY "Anyone can read user names for community" ON public.users
  FOR SELECT USING (TRUE);

-- Drop the old restrictive read policy (replaced by the one above)
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
