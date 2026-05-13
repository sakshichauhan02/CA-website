-- 1. Add INSERT policy for 'notes' table
-- (Allowing authenticated users for now, or anyone if in dev bypass mode)
DROP POLICY IF EXISTS "Admins can manage notes" ON public.notes;

CREATE POLICY "Allow anyone to insert notes (DEV ONLY)"
ON public.notes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow anyone to update notes (DEV ONLY)"
ON public.notes FOR UPDATE
USING (true);

CREATE POLICY "Allow anyone to delete notes (DEV ONLY)"
ON public.notes FOR DELETE
USING (true);

-- 2. Ensure Row Level Security is enabled
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
