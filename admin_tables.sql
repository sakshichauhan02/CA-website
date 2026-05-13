-- Create MCQ Tests Table
CREATE TABLE IF NOT EXISTS public.mcq_tests (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  questions_count INTEGER DEFAULT 0,
  time_limit INTEGER DEFAULT 60, -- in minutes
  is_premium BOOLEAN DEFAULT FALSE,
  difficulty TEXT DEFAULT 'Medium', -- Easy, Medium, Hard
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mcq_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policies (Viewable by everyone)
CREATE POLICY "MCQ Tests are viewable by everyone" ON public.mcq_tests FOR SELECT USING (true);
CREATE POLICY "Notes are viewable by everyone" ON public.notes FOR SELECT USING (true);

-- Trigger to sync auth.users to public.profiles (RUN THIS IN SQL EDITOR)
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, full_name, email)
--   VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
