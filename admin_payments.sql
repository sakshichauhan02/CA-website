-- 1. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id BIGSERIAL PRIMARY KEY,
  student_name TEXT,
  student_email TEXT,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- 'success', 'pending', 'failed'
  plan_type TEXT DEFAULT 'pro', -- 'pro', 'mentor'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Admins can view all payments
CREATE POLICY "Admins can view all payments" 
ON public.payments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Users can view their own payments
CREATE POLICY "Users can view their own payments" 
ON public.payments FOR SELECT 
USING (
  student_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 4. Seed with some "real" data for the user to see
-- (Technically still seed data, but it's in the DB now)
INSERT INTO public.payments (student_name, student_email, amount, status, plan_type)
VALUES 
('Aditya Kumar', 'aditya@example.com', 1999, 'success', 'pro'),
('Megha Jain', 'megha@example.com', 4999, 'success', 'mentor'),
('Suresh Raina', 'suresh@example.com', 1999, 'failed', 'pro');
