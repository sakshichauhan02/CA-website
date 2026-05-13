-- Create Written Results Table for Test Papers
CREATE TABLE IF NOT EXISTS public.written_results (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  paper_id BIGINT REFERENCES public.papers(id) ON DELETE CASCADE,
  self_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.written_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own written results" ON public.written_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own written results" ON public.written_results FOR INSERT WITH CHECK (auth.uid() = user_id);
