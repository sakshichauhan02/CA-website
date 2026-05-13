-- Create Doubts Table
CREATE TABLE IF NOT EXISTS public.doubts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Students can view their own doubts" ON public.doubts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can post doubts" ON public.doubts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all doubts" 
ON public.doubts FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
