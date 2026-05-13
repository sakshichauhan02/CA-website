-- 1. Add missing 'topic' column to notes table
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notes' AND column_name='topic') THEN
    ALTER TABLE public.notes ADD COLUMN topic TEXT;
  END IF;
END $$;

-- 2. Ensure Storage Bucket exists (Run this to be safe)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notes', 'notes', true) 
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies (Allow authenticated users to upload and anyone to view)
-- Note: These might require 'storage' schema access
CREATE POLICY "Allow public view on notes"
ON storage.objects FOR SELECT
USING (bucket_id = 'notes');

CREATE POLICY "Allow admin upload on notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'notes' AND 
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
);
