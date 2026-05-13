-- Update MCQ Tables for more details
ALTER TABLE public.mcq_tests ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS explanation TEXT;
