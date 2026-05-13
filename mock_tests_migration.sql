-- Migration to support Mock Tests feature

-- 1. Ensure mcq_tests table exists (from admin_tables.sql)
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

-- 2. Add test_id to questions table to link them to specific tests
-- This allows dynamic question count calculation
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='test_id') THEN
    ALTER TABLE public.questions ADD COLUMN test_id BIGINT REFERENCES public.mcq_tests(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Create Subscriptions table to handle premium access
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'canceled'
  plan_type TEXT DEFAULT 'premium', 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id) -- One active subscription per user for simplicity
);

-- 4. Enable RLS
ALTER TABLE public.mcq_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- MCQ Tests are viewable by everyone
DROP POLICY IF EXISTS "MCQ Tests are viewable by everyone" ON public.mcq_tests;
CREATE POLICY "MCQ Tests are viewable by everyone" ON public.mcq_tests FOR SELECT USING (true);

-- Questions are viewable by everyone (content restriction handled in app logic)
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;
CREATE POLICY "Questions are viewable by everyone" ON public.questions FOR SELECT USING (true);

-- Subscriptions viewable only by the owner
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 6. Update test_results table to support specific test tracking
DO $$ 
BEGIN 
  -- Add test_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='test_id') THEN
    ALTER TABLE public.test_results ADD COLUMN test_id BIGINT REFERENCES public.mcq_tests(id) ON DELETE CASCADE;
  END IF;

  -- Add percentage if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='percentage') THEN
    ALTER TABLE public.test_results ADD COLUMN percentage DECIMAL(5,2);
  END IF;

  -- Ensure total_score exists (aliasing for score)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='test_results' AND column_name='total_score') THEN
    ALTER TABLE public.test_results ADD COLUMN total_score INTEGER DEFAULT 0;
  END IF;
END $$;

-- 7. Ensure RLS for test_results allows authenticated inserts
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert their own test results" ON public.test_results;
CREATE POLICY "Users can insert their own test results" 
ON public.test_results FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own test results" ON public.test_results;
CREATE POLICY "Users can view their own test results" 
ON public.test_results FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);
