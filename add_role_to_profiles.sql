-- Add role column to profiles table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'student';
  END IF;
END $$;

-- Update specific user to be admin (Replace with your email)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
