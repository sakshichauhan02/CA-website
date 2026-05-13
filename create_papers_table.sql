-- Create Papers Table
CREATE TABLE IF NOT EXISTS public.papers (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  marks INTEGER DEFAULT 100,
  description TEXT,
  pdf_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Papers are viewable by everyone" ON public.papers FOR SELECT USING (true);

-- Admins can do everything
CREATE POLICY "Admins can manage papers" 
ON public.papers FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
