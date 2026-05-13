-- 1. Temporary Development Policy: Allow ANYONE to upload to 'notes' bucket
-- (Use this ONLY for testing, delete before production)
DROP POLICY IF EXISTS "Allow admin upload on notes" ON storage.objects;

CREATE POLICY "Allow anyone to upload to notes (DEV ONLY)"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'notes');

CREATE POLICY "Allow anyone to update notes (DEV ONLY)"
ON storage.objects FOR UPDATE
WITH CHECK (bucket_id = 'notes');

-- 2. Ensure the bucket is truly public
UPDATE storage.buckets SET public = true WHERE id = 'notes';
